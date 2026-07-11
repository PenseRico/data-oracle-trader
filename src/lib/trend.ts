import { calculateSMA } from "@/lib/api/coingecko";

/**
 * Leitura simples de tendência por médias móveis sobre o sparkline (preços).
 * ALTA = preço acima das médias (curta > longa). BAIXA = abaixo. LATERAL = sem direção clara.
 */
export type TrendDir = "ALTA" | "BAIXA" | "LATERAL";

export interface TrendResult {
  dir: TrendDir;
  strength: "forte" | "média" | "fraca";
}

export function computeTrend(prices: number[] | undefined): TrendResult | null {
  if (!prices || prices.length < 50) return null;
  const last = prices[prices.length - 1];
  const smaShort = calculateSMA(prices, 12);
  const smaLong = calculateSMA(prices, 48);
  // inclinação da média longa (compara com 12 períodos atrás)
  const prevLong = calculateSMA(prices.slice(0, -12), 48);
  const rising = smaLong > prevLong;

  if (last > smaShort && smaShort > smaLong) {
    return { dir: "ALTA", strength: rising ? "forte" : "média" };
  }
  if (last < smaShort && smaShort < smaLong) {
    return { dir: "BAIXA", strength: !rising ? "forte" : "média" };
  }
  return { dir: "LATERAL", strength: "fraca" };
}
