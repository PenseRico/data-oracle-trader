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
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const max_tokens = Math.min(Math.max(Number(body.max_tokens) || 800, 64), 1500);
    if (!messages.length) {
      res.status(400).json({ error: "messages vazio" });
      return;
    }
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens, temperature: 0.5 }),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
