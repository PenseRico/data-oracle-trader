// Supabase Edge Function: ai-proxy
// Guarda a chave da OpenRouter NO SERVIDOR — o frontend chama esta função, nunca a OpenRouter direto.
// Assim a chave NUNCA vai no bundle do navegador (fim da exposição).
//
// Deploy:
//   supabase functions deploy ai-proxy
//   supabase secrets set OPENROUTER_API_KEY=sk-or-v1-SUA_CHAVE_NOVA
//
// Controles de custo: whitelist de modelos baratos + teto de tokens.

const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY");

// Só modelos baratos por padrão (controle de custo). Premium fica pro plano Pro (adicionar depois).
const ALLOWED_MODELS = new Set([
  "openai/gpt-4o-mini",
  "google/gemini-flash-1.5",
  "google/gemini-2.0-flash-001",
  "deepseek/deepseek-chat",
  "anthropic/claude-3.5-haiku",
]);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!OPENROUTER_KEY) return json({ error: "OPENROUTER_API_KEY não configurada no servidor" }, 500);

  try {
    const body = await req.json();
    const model = ALLOWED_MODELS.has(body.model) ? body.model : "openai/gpt-4o-mini";
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const max_tokens = Math.min(Math.max(Number(body.max_tokens) || 800, 64), 1500); // teto
    if (!messages.length) return json({ error: "messages vazio" }, 400);

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENROUTER_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens, temperature: Number(body.temperature) ?? 0.5 }),
    });
    const data = await r.json();
    return json(data, r.status);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
