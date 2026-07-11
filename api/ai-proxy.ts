// Vercel Serverless Function — proxy seguro pra OpenRouter.
// A chave fica no SERVIDOR (env var OPENROUTER_API_KEY da Vercel), nunca no cliente.
// O front chama /api/ai-proxy; ninguém vê a chave.

const ALLOWED = new Set([
  "openai/gpt-4o-mini",
  "google/gemini-flash-1.5",
  "google/gemini-2.0-flash-001",
  "deepseek/deepseek-chat",
  "anthropic/claude-3.5-haiku",
]);

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
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
