/**
 * Camada de IA — chama o backend seguro (Supabase Edge Function `ai-proxy`).
 * A chave da OpenRouter fica NO SERVIDOR (nunca no bundle).
 *
 * Modo de teste local (só o dono): se houver uma chave em localStorage['oracle:openrouter_key'],
 * chama a OpenRouter direto DAQUELE navegador — a chave fica só na máquina do dono, não no bundle.
 * Em produção, deixe o localStorage vazio e use a Edge Function.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const PROXY_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/ai-proxy` : null;
const DEV_KEY_LS = "oracle:openrouter_key";

export function getDevKey(): string | null {
  try { return localStorage.getItem(DEV_KEY_LS); } catch { return null; }
}
export function setDevKey(k: string) {
  try { localStorage.setItem(DEV_KEY_LS, k.trim()); } catch { /* noop */ }
}
export function clearDevKey() {
  try { localStorage.removeItem(DEV_KEY_LS); } catch { /* noop */ }
}
/** Existe algum caminho de IA disponível? (backend OU chave local do dono) */
export function aiAvailable(): boolean {
  return !!PROXY_URL || !!getDevKey();
}

interface Msg { role: "system" | "user" | "assistant"; content: string; }

async function aiChat(messages: Msg[], model = "openai/gpt-4o-mini", maxTokens = 900): Promise<string> {
  const devKey = getDevKey();
  // 1) modo dev local (dono testando) — chave só no localStorage do dono
  if (devKey) {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${devKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.5 }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message ?? "erro na IA");
    return d.choices?.[0]?.message?.content ?? "";
  }
  // 2) produção — backend seguro
  if (!PROXY_URL) throw new Error("IA não configurada: falta o backend (Edge Function) ou a chave local.");
  const r = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(SUPABASE_ANON ? { Authorization: `Bearer ${SUPABASE_ANON}`, apikey: SUPABASE_ANON } : {}),
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });
  const d = await r.json();
  if (d.error) throw new Error(typeof d.error === "string" ? d.error : d.error.message ?? "erro na IA");
  return d.choices?.[0]?.message?.content ?? "";
}

/**
 * CATÁLOGO DE SKILLS DO INVESTIDOR — o "manual" que arma a IA com as estratégias reais.
 * É o que faz ela raciocinar como trader, aplicando a NOSSA lógica sobre o dado real.
 */
const PLAYBOOK = `
Você é um ANALISTA DE CRIPTO experiente e disciplinado. Use SOMENTE os dados fornecidos (reais, do app) — nunca invente preço ou indicador.

CATÁLOGO DE ESTRATÉGIAS (aplique quando o dado encaixar):
- Confluência RSI multi-timeframe: sobrevenda alinhada em TFs maiores + gatilho no menor = compra de maior probabilidade; sobrecompra alinhada = risco de topo.
- Setup Compra (do usuário): RSI 40–57 + preço colado na EMA80 (±2%) + volume subindo + rompimento do topo anterior.
- Mean reversion: preço fora da banda de Bollinger + RSI extremo → reversão provável ao voltar pra dentro/50.
- EMA ribbon (8/13/21/34/55): empilhadas e subindo = tendência forte; comprimindo/invertendo = enfraquecendo.
- Divergência de RSI: preço faz fundo mais baixo e RSI faz fundo mais alto = divergência de alta (e o inverso).
- Golden/Death cross (MA50x200 no diário): filtro de regime, não gatilho de timing.
- Funding extremo: funding muito negativo = excesso de short (possível squeeze de alta); muito positivo = euforia alavancada (risco).
- Zonas on-chain (MVRV/SOPR/NUPL): abaixo do equilíbrio = capitulação/fundo; muito acima = distribuição/topo.

REGRAS DE SAÍDA (obrigatórias):
1) Por moeda: ESTADO atual (1 linha), ZONA DE VENDA (realização parcial), ZONA DE RECOMPRA, e 2 CENÁRIOS com probabilidade ("alta X% se romper $Y / baixa Z% se perder $W").
2) Sempre em português simples, "mastigado" para iniciante.
3) NUNCA dê ordem de comprar/vender, NUNCA mande "desfazer/vender tudo". São PONTOS DE ESTUDO.
4) Gestão de risco: cite onde invalida (stop lógico).
5) Termine com 1 linha: "⚠️ Não é recomendação de investimento — a decisão e o risco são seus."
Seja objetivo e curto.
`.trim();

export interface HoldingReading {
  symbol: string;
  price: number;
  rsi: number;
  trend: string; // ALTA/BAIXA/LATERAL
  qty: number;
  pnlPct?: number;
}

export async function analisarCarteira(holdings: HoldingReading[]): Promise<string> {
  const linhas = holdings
    .map(
      (h) =>
        `- ${h.symbol}: preço $${h.price}, RSI ${Math.round(h.rsi)}, tendência ${h.trend}, quantidade ${h.qty}` +
        (h.pnlPct !== undefined ? `, resultado atual ${h.pnlPct >= 0 ? "+" : ""}${h.pnlPct.toFixed(0)}%` : ""),
    )
    .join("\n");
  const messages: Msg[] = [
    { role: "system", content: PLAYBOOK },
    { role: "user", content: `Analise a minha carteira (dados reais de agora):\n${linhas}` },
  ];
  return aiChat(messages);
}
