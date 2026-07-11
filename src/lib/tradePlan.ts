import type { EnrichedCoin } from "@/lib/signalEngine";

/**
 * Transforma um sinal analisado em uma ENTREGA PRONTA: entrada, alvo, stop e risco/retorno.
 * O objetivo é o usuário não precisar interpretar gráfico — só executar.
 */
export interface TradePlan {
  symbol: string;
  name: string;
  image: string;
  direction: "COMPRA" | "VENDA";
  entry: number;
  stop: number;
  target1: number;
  target2: number;
  /** distância % do stop em relação à entrada (tamanho do risco) */
  riskPct: number;
  /** risco/retorno até o alvo 2 */
  rr: number;
  confidence: number; // 0-100
  confluence: string; // Low/Medium/High
  reason: string;
  timeframe: string;
}

// Stablecoins não geram trade — $1 não tem "alvo de $1.09".
const STABLES = new Set([
  "usdt", "usdc", "usd1", "pyusd", "dai", "busd", "tusd", "fdusd", "usds", "usde",
  "usdd", "gusd", "frax", "lusd", "usdp", "eurc", "usdl", "susds", "usdb", "crvusd",
  "rlusd", "usdg", "usd0", "gho", "mim", "usdx", "usdy", "buidl", " tusd", "fxusd",
]);

/** True se o símbolo é uma stablecoin (não deve gerar sinal de compra/venda direcional). */
export function isStablecoin(symbol?: string): boolean {
  return STABLES.has((symbol ?? "").toLowerCase().trim());
}

function timeframeOf(coin: EnrichedCoin): string {
  if (coin.shortTerm?.isActive) return "Scalp · horas";
  if (coin.longTerm?.isActive) return "Position · semanas";
  return "Swing · dias";
}

function confidenceOf(coin: EnrichedCoin): number {
  // mapeia o score absoluto (máx ~12) para 0-100, com piso pela confluência
  const base = Math.min(100, Math.round((Math.abs(coin.signal.total) / 12) * 100));
  const floor = coin.signal.confluence === "High" ? 70 : coin.signal.confluence === "Medium" ? 50 : 30;
  return Math.max(base, floor);
}

export function buildTradePlan(coin: EnrichedCoin): TradePlan | null {
  if (STABLES.has(coin.symbol?.toLowerCase() ?? "")) return null;
  const cls = coin.signal.classification;
  const direction: "COMPRA" | "VENDA" | null =
    cls === "strong_buy" || cls === "buy" ? "COMPRA" : cls === "sell" || cls === "strong_sell" ? "VENDA" : null;
  if (!direction) return null;

  const price = coin.current_price;
  if (!price || price <= 0) return null;

  const prices = coin.sparkline_in_7d?.price ?? [];
  const recent = prices.slice(-48);
  const low = recent.length ? Math.min(...recent) : price * 0.92;
  const high = recent.length ? Math.max(...recent) : price * 1.08;

  let entry = price;
  let stop: number;
  let target1: number;
  let target2: number;

  if (direction === "COMPRA") {
    // stop logo abaixo do suporte recente (ou MA80), limitado a um risco razoável
    const support = Math.min(low * 0.995, coin.ma80 || low);
    stop = Math.min(support, price * 0.97);
    if (stop >= price) stop = price * 0.94;
    const risk = price - stop;
    target1 = price + risk * 1.5;
    target2 = price + risk * 3;
  } else {
    const resistance = Math.max(high * 1.005, coin.ma80 || high);
    stop = Math.max(resistance, price * 1.03);
    if (stop <= price) stop = price * 1.06;
    const risk = stop - price;
    target1 = price - risk * 1.5;
    target2 = price - risk * 3;
  }

  const riskPct = Math.abs((entry - stop) / entry) * 100;
  const reason =
    coin.signal.reasons?.[0]?.description?.replace(/^O /, "").replace(/^A /, "").replace(/^Os /, "") ??
    (direction === "COMPRA" ? "Confluência de sinais de compra" : "Confluência de sinais de venda");

  return {
    symbol: coin.symbol?.toUpperCase() ?? "",
    name: coin.name,
    image: coin.image,
    direction,
    entry,
    stop,
    target1,
    target2,
    riskPct,
    rr: 3,
    confidence: confidenceOf(coin),
    confluence: coin.signal.confluence,
    reason,
    timeframe: timeframeOf(coin),
  };
}

/** Gera os melhores planos prontos a partir da lista enriquecida. */
export function buildTradePlans(coins: EnrichedCoin[], limit = 4): TradePlan[] {
  return coins
    .map(buildTradePlan)
    .filter((p): p is TradePlan => p !== null)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}
