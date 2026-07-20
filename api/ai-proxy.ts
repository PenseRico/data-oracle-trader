// Vercel Serverless Function — proxy seguro pra OpenRouter.
// A chave fica no SERVIDOR (env var OPENROUTER_API_KEY da Vercel), nunca no cliente.
// O front chama /api/ai-proxy COM o token da sessão Supabase; ninguém sem login usa.

const ALLOWED = new Set([
  "openai/gpt-4o-mini",
  "google/gemini-flash-1.5",
  "google/gemini-2.0-flash-001",
  "deepseek/deepseek-chat",
  "anthropic/claude-3.5-haiku",
]);

// Rate-limit best-effort por instância (por usuário): janela deslizante simples.
const RL_WINDOW_MS = 60_000;
const RL_MAX = 15; // req/min por usuário
const hits = new Map<string, number[]>();
function rateLimited(id: string): boolean {
  const now = Date.now();
  const arr = (hits.get(id) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  arr.push(now);
  hits.set(id, arr);
  return arr.length > RL_MAX;
}

async function verifyUser(token: string): Promise<string | null> {
  const url = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) return null; // sem config = falha fechada
  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u?.id ?? null;
  } catch {
    return null;
  }
}

// Chama uma função (RPC) do Supabase com o token do PRÓPRIO usuário.
// Usado pra consume_quota (SECURITY DEFINER + auth.uid() do token): consumir só afeta a
// própria linha, então roda com o token do usuário. O ESTORNO é separado (refundQuota,
// via service_role) porque decrementar não pode ficar ao alcance do cliente.
async function callRpc(fn: string, token: string, args: Record<string, unknown>): Promise<any> {
  const url = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// Estorno da cota — SÓ o servidor pode fazer. No banco, refund_quota é service-role-only
// (revogada de authenticated/anon), então o cliente NÃO consegue zerar a própria cota.
// Precisa de SUPABASE_SERVICE_ROLE_KEY na Vercel; sem ela, o estorno é pulado (best-effort).
async function refundQuota(userId: string, action: string): Promise<void> {
  const url = process.env.VITE_SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svc) return;
  try {
    await fetch(`${url}/rest/v1/rpc/refund_quota`, {
      method: "POST",
      headers: { apikey: svc, Authorization: `Bearer ${svc}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_user: userId, p_action: action }),
    });
  } catch {
    /* best-effort: se o estorno falhar, no pior caso o usuário perde 1 uso */
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Exige sessão válida do Supabase (bloqueia proxy aberto / abuso de créditos).
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "É preciso estar logado para usar a IA." });
    return;
  }
  const userId = await verifyUser(token);
  if (!userId) {
    res.status(401).json({ error: "Sessão inválida ou expirada." });
    return;
  }
  if (rateLimited(userId)) {
    res.status(429).json({ error: "Muitas requisições. Aguarde um minuto." });
    return;
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    res.status(500).json({ error: "OPENROUTER_API_KEY não configurada na Vercel" });
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const model = ALLOWED.has(body.model) ? body.model : "openai/gpt-4o-mini";
    // Sanitiza e LIMITA o input (evita drenar créditos com prompt gigante).
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m: any) => m && typeof m.content === "string" && ["system", "user", "assistant"].includes(m.role))
      .slice(0, 12)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 8000) }));
    const max_tokens = Math.min(Math.max(Number(body.max_tokens) || 800, 64), 1500);
    if (!messages.length) {
      res.status(400).json({ error: "messages vazio ou inválido" });
      return;
    }
    const totalChars = messages.reduce((n: number, m: any) => n + m.content.length, 0);
    if (totalChars > 24000) {
      res.status(413).json({ error: "Entrada muito longa." });
      return;
    }

    // COTA: carteira 1x/semana, demais IA 1x/dia. O `action` é ALLOWLIST no servidor
    // (nunca confiar no cliente — senão bastaria variar o action pra ter baldes infinitos).
    const action = body.action === "carteira" ? "carteira" : "ia";
    const quota = await callRpc("consume_quota", token, { p_action: action });
    if (!quota) {
      // Cota indisponível (SQL ainda não rodado / erro) → falha fechada, sem gastar IA.
      res.status(503).json({ error: "Cota de IA indisponível no momento. Tente mais tarde." });
      return;
    }
    if (!quota.allowed) {
      res.status(429).json({
        quota: true,
        reset_at: quota.reset_at ?? null,
        error:
          action === "carteira"
            ? "Você já usou o estudo da carteira desta semana."
            : "Você já usou esta análise hoje.",
      });
      return;
    }

    // A cota FOI consumida: qualquer falha até a resposta OK precisa ESTORNAR o uso.
    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, max_tokens, temperature: 0.5 }),
      });
      if (!r.ok) {
        await refundQuota(userId, action);
        const errData = await r.json().catch(() => ({ error: "IA indisponível no momento." }));
        res.status(r.status).json(errData);
        return;
      }
      const data = await r.json(); // pode lançar se vier corpo não-JSON mesmo com status 200
      res.status(200).json(data);
    } catch (e) {
      await refundQuota(userId, action); // rede caiu / corpo inválido → devolve o uso
      console.error("ai-proxy openrouter error:", e);
      res.status(502).json({ error: "Erro ao falar com a IA. Tente de novo." });
    }
  } catch (e) {
    console.error("ai-proxy error:", e);
    res.status(500).json({ error: "Erro ao processar a solicitação." });
  }
}
