/**
 * ESTUDO DE POSIÇÃO — monta, por moeda que o usuário TEM, uma leitura em 3 horizontes
 * (curto / médio / longo) dizendo se é caso de SEGURAR, REALIZAR PARCIAL, VENDER ou AUMENTAR,
 * com as ZONAS de venda/recompra.
 *
 * REGRA DE OURO: os NÚMEROS saem daqui (do código, dados reais) — RSI, tendência dos motores
 * de setup, zonas por preço/Fibonacci. A IA só REFINA a palavra do veredito e escreve 1 linha
 * de porquê. Se a IA falhar, este arquivo sozinho já entrega os cartões (modo só-código).
 */
import type { EnrichedCoin, SetupEvaluation } from "@/lib/signalEngine";

export type Horizonte = "curto" | "medio" | "longo";
export type Veredito = "Segurar" | "Realizar parcial" | "Vender" | "Aumentar";

export const VEREDITOS: Veredito[] = ["Segurar", "Realizar parcial", "Vender", "Aumentar"];

export interface HorizonRead {
  horizonte: Horizonte;
  titulo: string;      // "Curto prazo (dias)"
  veredito: Veredito;
  porque: string;      // 1 linha, ≤140 chars
  sellZone: number;    // zona de realização (acima)
  rebuyZone: number;   // zona de recompra (abaixo)
  bias: "BUY" | "SELL" | "NEUTRAL";
  confidence: number;  // 0-100 (força do setup)
}

export interface PositionStudy {
  symbol: string;
  price: number;
  avgPrice: number;    // 0 = desconhecido
  pnlPct?: number;     // undefined se não sabe o custo
  rsi: number;
  curto: HorizonRead;
  medio: HorizonRead;
  longo: HorizonRead;
}

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

/** Zona de venda (resistência acima) e recompra (suporte abaixo) para um lookback do sparkline. */
function zonesFor(prices: number[], lookback: number, price: number, fib?: Record<number, number>, useFib = false) {
  const recent = prices.slice(-lookback).filter(isNum);
  const high = recent.length ? Math.max(...recent) : price;
  const low = recent.length ? Math.min(...recent) : price;
  let sellZone = Math.max(high, price * 1.02);
  let rebuyZone = Math.min(low, price * 0.98);
  // No longo prazo, ancora a recompra no golden pocket profundo (fib[0.382] = low+0.382*range,
  // que é a retração 0.618 medida do topo) e a venda no topo do swing (fib[1]).
  if (useFib && fib) {
    const deepPullback = fib[0.382];
    const swingHigh = fib[1];
    if (isNum(deepPullback) && deepPullback < price) rebuyZone = Math.min(rebuyZone, deepPullback);
    if (isNum(swingHigh) && swingHigh > price) sellZone = Math.max(sellZone, swingHigh);
  }
  return { sellZone, rebuyZone };
}

/**
 * Veredito automático (o usuário JÁ POSSUI a moeda — nunca mandamos "vender tudo" de leve).
 * Ciente do HORIZONTE:
 *  - "Vender" (saída total) SÓ no médio/longo, e só com estrutura quebrada forte + sobrecompra.
 *    No CURTO o teto é "Realizar parcial" (um repique intradiário não liquida a posição).
 *  - O RSI vem do sparkline de ~14h; então o gatilho de sobrecompra (RSI≥78) NÃO vale pro LONGO
 *    (meses) — um pico de 14h não muda a tese de longo prazo.
 */
function codeVerdict(setup: SetupEvaluation, rsi: number, horizonte: Horizonte, pnlPct?: number): { veredito: Veredito; porque: string } {
  const conf = setup.confidence;
  const motivo = setup.reasons?.[0] ?? "";
  const emLucro = pnlPct !== undefined && pnlPct > 0;
  const podeVender = horizonte !== "curto";

  if (setup.type === "SELL" && conf >= 70 && rsi >= 70 && podeVender) {
    return { veredito: "Vender", porque: motivo || "Tendência virou e RSI sobrecomprado — proteja o ganho." };
  }
  if (setup.type === "SELL" && conf >= 55) {
    return { veredito: "Realizar parcial", porque: motivo || "Sinais de topo — realizar parte reduz o risco." };
  }
  if (rsi >= 78 && horizonte !== "longo") {
    return { veredito: "Realizar parcial", porque: `RSI ${Math.round(rsi)} (sobrecomprado)${emLucro ? " e em lucro" : ""} — realizar parte protege o ganho.` };
  }
  if (setup.type === "BUY" && conf >= 55 && rsi <= 48) {
    return { veredito: "Aumentar", porque: motivo || "Zona de recompra em tendência de alta — bom ponto para acumular." };
  }
  if (setup.type === "BUY" && conf >= 55) {
    return { veredito: "Segurar", porque: motivo || "Tendência a favor — manter a posição faz sentido." };
  }
  return { veredito: "Segurar", porque: rsi <= 35 ? "RSI baixo, sem gatilho claro — segurar e observar." : "Sem assimetria clara — segurar e acompanhar." };
}

const TITULOS: Record<Horizonte, string> = {
  curto: "Curto prazo (dias)",
  medio: "Médio prazo (semanas)",
  longo: "Longo prazo (meses)",
};

function readHorizon(
  horizonte: Horizonte,
  setup: SetupEvaluation,
  rsi: number,
  prices: number[],
  price: number,
  fib: Record<number, number> | undefined,
  pnlPct?: number,
): HorizonRead {
  const lookback = horizonte === "curto" ? 24 : horizonte === "medio" ? 84 : 168;
  const { sellZone, rebuyZone } = zonesFor(prices, lookback, price, fib, horizonte === "longo");
  const { veredito, porque } = codeVerdict(setup, rsi, horizonte, pnlPct);
  return {
    horizonte,
    titulo: TITULOS[horizonte],
    veredito,
    porque,
    sellZone,
    rebuyZone,
    bias: setup.type,
    confidence: setup.confidence,
  };
}

/** Monta o estudo completo (3 horizontes) de UMA moeda a partir do coin enriquecido + posição. */
export function buildPositionStudy(coin: EnrichedCoin, avgPrice: number, pnlPct?: number): PositionStudy {
  const prices = (coin.sparkline_in_7d?.price ?? []).filter(isNum);
  const fib = coin.indicators?.fib;
  const rsi = coin.indicators?.rsi ?? 50;
  const price = coin.current_price;
  const neutral: SetupEvaluation = { isActive: false, type: "NEUTRAL", confidence: 0, reasons: [] };
  return {
    symbol: (coin.symbol ?? "").toUpperCase(),
    price,
    avgPrice,
    pnlPct,
    rsi,
    curto: readHorizon("curto", coin.shortTerm ?? neutral, rsi, prices, price, fib, pnlPct),
    medio: readHorizon("medio", coin.midTerm ?? neutral, rsi, prices, price, fib, pnlPct),
    longo: readHorizon("longo", coin.longTerm ?? neutral, rsi, prices, price, fib, pnlPct),
  };
}

// ── Camada IA: monta o prompt, aplica o que a IA devolveu (validando), com fallback só-código. ──

/** Ficha curta por moeda pra IA (só palavras + números que ELA NÃO reinventa). */
export function fichaParaIA(s: PositionStudy): string {
  const pos = s.avgPrice > 0 ? `preço médio $${s.avgPrice}, resultado ${s.pnlPct! >= 0 ? "+" : ""}${(s.pnlPct ?? 0).toFixed(0)}%` : "sem preço de compra";
  const linha = (h: HorizonRead) =>
    `${h.horizonte}: tendência ${h.bias === "BUY" ? "de alta" : h.bias === "SELL" ? "de baixa" : "lateral"} (força ${h.confidence}), sugestão do sistema "${h.veredito}"`;
  return `${s.symbol} — preço $${s.price}, RSI ${Math.round(s.rsi)}, ${pos}\n  ${linha(s.curto)}\n  ${linha(s.medio)}\n  ${linha(s.longo)}`;
}

/** Casa o veredito da IA com o conjunto permitido, tolerando caixa/espaços ("vender" → "Vender"). */
function normalizeVeredito(v: unknown): Veredito | null {
  if (typeof v !== "string") return null;
  const t = v.trim().toLowerCase();
  return VEREDITOS.find((x) => x.toLowerCase() === t) ?? null;
}

/**
 * Aplica o JSON da IA sobre os estudos (mantém as zonas do código; troca veredito+porque se válidos).
 * Retorna também quantas moedas foram REALMENTE refinadas — pra tela saber se a IA contribuiu.
 */
export function aplicarRespostaIA(studies: PositionStudy[], raw: string): { studies: PositionStudy[]; refinados: number } {
  let parsed: any = null;
  try {
    const jsonStr = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    parsed = JSON.parse(jsonStr);
  } catch {
    return { studies, refinados: 0 }; // JSON quebrado → modo só-código
  }
  const arr: any[] = Array.isArray(parsed?.moedas) ? parsed.moedas : [];
  const bySym = new Map<string, any>();
  arr.forEach((m) => m?.symbol && bySym.set(String(m.symbol).toUpperCase(), m));

  let refinados = 0;
  const merge = (h: HorizonRead, ai: any): { h: HorizonRead; mudou: boolean } => {
    if (!ai) return { h, mudou: false };
    const nv = normalizeVeredito(ai.veredito);
    const np = typeof ai.porque === "string" && ai.porque.trim() ? ai.porque.trim().slice(0, 160) : null;
    if (!nv && !np) return { h, mudou: false };
    return { h: { ...h, veredito: nv ?? h.veredito, porque: np ?? h.porque }, mudou: true };
  };

  const out = studies.map((s) => {
    const m = bySym.get(s.symbol);
    if (!m) return s;
    const c = merge(s.curto, m.curto), md = merge(s.medio, m.medio), l = merge(s.longo, m.longo);
    if (c.mudou || md.mudou || l.mudou) refinados++;
    return { ...s, curto: c.h, medio: md.h, longo: l.h };
  });
  return { studies: out, refinados };
}
