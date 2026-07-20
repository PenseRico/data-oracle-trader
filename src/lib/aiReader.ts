/**
 * Camada de IA — chama a função serverless da Vercel (/api/ai-proxy).
 * A chave da OpenRouter fica NO SERVIDOR (env var da Vercel). O cliente nunca vê chave.
 */

import { supabase } from "@/integrations/supabase/client";

const PROXY_URL = "/api/ai-proxy";

interface Msg { role: "system" | "user" | "assistant"; content: string; }

/** Erro de cota esgotada — carrega quando a IA libera de novo (pra tela mostrar o timer). */
export class QuotaError extends Error {
  resetAt: string | null;
  constructor(message: string, resetAt: string | null) {
    super(message);
    this.name = "QuotaError";
    this.resetAt = resetAt;
  }
}

async function aiChat(
  messages: Msg[],
  opts: { model?: string; maxTokens?: number; action?: string } = {},
): Promise<string> {
  const { model = "openai/gpt-4o-mini", maxTokens = 900, action = "ia" } = opts;
  // Manda o token da sessão pro proxy validar (evita proxy aberto / abuso de créditos).
  const { data: { session } } = await supabase.auth.getSession();
  const r = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, action }),
  });
  const d = await r.json().catch(() => ({ error: "resposta inválida da IA" }));
  if (r.status === 429 && d?.quota) {
    throw new QuotaError(
      typeof d.error === "string" ? d.error : "Você já usou a análise deste período.",
      d.reset_at ?? null,
    );
  }
  if (d.error) throw new Error(typeof d.error === "string" ? d.error : d.error.message ?? "erro na IA");
  return d.choices?.[0]?.message?.content ?? "";
}

/**
 * CATÁLOGO DE SKILLS DO INVESTIDOR — o "manual" que arma a IA com as estratégias reais.
 */
const PLAYBOOK = `
Você é um ANALISTA DE CRIPTO experiente e disciplinado. Use SOMENTE os dados fornecidos (reais, do app) — nunca invente preço ou indicador.

CATÁLOGO DE ESTRATÉGIAS (aplique quando o dado encaixar):
- Confluência RSI multi-timeframe: sobrevenda alinhada em TFs maiores + gatilho no menor = compra de maior probabilidade; sobrecompra alinhada = risco de topo.
- Setup Compra: RSI 40–57 + preço colado na EMA80 (±2%) + volume subindo + rompimento do topo anterior.
- Mean reversion: preço fora da banda de Bollinger + RSI extremo → reversão provável ao voltar pra dentro/50.
- EMA ribbon (8/13/21/34/55): empilhadas e subindo = tendência forte; comprimindo/invertendo = enfraquecendo.
- Divergência de RSI: preço faz fundo mais baixo e RSI faz fundo mais alto = divergência de alta (e o inverso).
- Golden/Death cross (MA50x200 no diário): filtro de regime, não gatilho de timing.
- Funding extremo: funding muito negativo = excesso de short (possível squeeze de alta); muito positivo = euforia (risco).
- Zonas on-chain (MVRV/SOPR/NUPL): abaixo do equilíbrio = capitulação/fundo; muito acima = distribuição/topo.

REGRAS DE SAÍDA (obrigatórias):
1) Por moeda: ESTADO atual (1 linha), ZONA DE VENDA (realização parcial), ZONA DE RECOMPRA, e 2 CENÁRIOS com probabilidade ("alta X% se romper $Y / baixa Z% se perder $W").
2) Português simples, "mastigado" para iniciante.
3) NUNCA dê ordem de comprar/vender, NUNCA mande "desfazer/vender tudo". São PONTOS DE ESTUDO.
4) Gestão de risco: cite onde invalida (stop lógico).
5) Termine com 1 linha: "⚠️ Não é recomendação de investimento — a decisão e o risco são seus."
Seja objetivo e curto.
`.trim();

export interface HoldingReading {
  symbol: string;
  price: number;
  rsi: number;
  trend: string;
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
  return aiChat(messages, { action: "carteira" });
}
