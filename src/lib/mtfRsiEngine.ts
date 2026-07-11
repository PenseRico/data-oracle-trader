/**
 * MTF RSI Confluence — porte 1:1 do indicador Pine Script do setup do usuário.
 *
 * Pesos de confluência:  Diário = 3pts · 4h = 2pts · 1h = 1pt · 5m = gatilho (gate)
 *   score_l = (D<=os?3) + (4h<=os?2) + (1h<=os?1)
 *   score_s = (D>=ob?3) + (4h>=ob?2) + (1h>=ob?1)
 *   trigger_l = RSI5m <= os  E  score_l >= 1
 *   trigger_s = RSI5m >= ob  E  score_s >= 1
 *   força (cor): score >= 3 forte · 2 médio · 1 fraco
 *
 * Os timeframes/RSI vêm prontos de `useRsiHeatmapData` (binance.ts), que já
 * calcula o RSI(14) em 5m/1h/4h/1d — exatamente o que o Pine consome.
 */

export interface MtfConfig {
  /** Oversold ≤ (gatilho Long). Pine default = 20. */
  oversold: number;
  /** Overbought ≥ (gatilho Short). Pine default = 80. */
  overbought: number;
}

export const DEFAULT_MTF_CONFIG: MtfConfig = { oversold: 20, overbought: 80 };

/** Presets de sensibilidade (o `os`/`ob` são inputs no Pine original). */
export const MTF_PRESETS = [
  { id: "estrito", label: "Seu Setup (estrito)", oversold: 20, overbought: 80 },
  { id: "moderado", label: "Moderado", oversold: 25, overbought: 75 },
  { id: "amplo", label: "Amplo", oversold: 30, overbought: 70 },
] as const;

export type SignalDir = "LONG" | "SHORT" | "NEUTRAL";
export type SignalStrength = "forte" | "medio" | "fraco" | "nenhum";

export interface MtfLeg {
  tf: "D" | "4h" | "1h" | "5m";
  rsi: number;
  /** Pontos que esta perna vale no score (D=3, 4h=2, 1h=1, 5m=gate=0). */
  pts: number;
  alignedLong: boolean;
  alignedShort: boolean;
}

export interface MtfSignal {
  symbol: string;
  base: string;
  rsi: { d: number; h4: number; h1: number; m5: number };
  scoreLong: number; // 0..6
  scoreShort: number; // 0..6
  triggerLong: boolean;
  triggerShort: boolean;
  direction: SignalDir;
  /** score da direção dominante */
  score: number;
  strength: SignalStrength;
  /** gatilho de 5m disparado nesta vela */
  fired: boolean;
  legs: MtfLeg[];
}

function strengthOf(score: number): SignalStrength {
  if (score >= 3) return "forte";
  if (score === 2) return "medio";
  if (score === 1) return "fraco";
  return "nenhum";
}

/** Mapa de RSI por timeframe (ex.: heatmap[symbol]) → sinal MTF. */
export function computeMtfSignal(
  symbol: string,
  rsiByTf: Record<string, number> | undefined,
  config: MtfConfig = DEFAULT_MTF_CONFIG,
): MtfSignal | null {
  if (!rsiByTf) return null;
  const d = rsiByTf["1d"];
  const h4 = rsiByTf["4h"];
  const h1 = rsiByTf["1h"];
  const m5 = rsiByTf["5m"];
  if ([d, h4, h1, m5].some((v) => v === undefined || v === null || Number.isNaN(v))) return null;

  const { oversold: os, overbought: ob } = config;

  const scoreLong = (d <= os ? 3 : 0) + (h4 <= os ? 2 : 0) + (h1 <= os ? 1 : 0);
  const scoreShort = (d >= ob ? 3 : 0) + (h4 >= ob ? 2 : 0) + (h1 >= ob ? 1 : 0);

  const triggerLong = m5 <= os && scoreLong >= 1;
  const triggerShort = m5 >= ob && scoreShort >= 1;

  let direction: SignalDir = "NEUTRAL";
  let score = 0;
  if (scoreLong > scoreShort) {
    direction = "LONG";
    score = scoreLong;
  } else if (scoreShort > scoreLong) {
    direction = "SHORT";
    score = scoreShort;
  }

  const legs: MtfLeg[] = [
    { tf: "D", rsi: d, pts: 3, alignedLong: d <= os, alignedShort: d >= ob },
    { tf: "4h", rsi: h4, pts: 2, alignedLong: h4 <= os, alignedShort: h4 >= ob },
    { tf: "1h", rsi: h1, pts: 1, alignedLong: h1 <= os, alignedShort: h1 >= ob },
    { tf: "5m", rsi: m5, pts: 0, alignedLong: m5 <= os, alignedShort: m5 >= ob },
  ];

  return {
    symbol,
    base: symbol.replace("USDT", ""),
    rsi: { d, h4, h1, m5 },
    scoreLong,
    scoreShort,
    triggerLong,
    triggerShort,
    direction,
    score,
    strength: strengthOf(score),
    fired: triggerLong || triggerShort,
    legs,
  };
}

export interface RankedSignals {
  longs: MtfSignal[];
  shorts: MtfSignal[];
}

/**
 * Converte o heatmap inteiro em duas listas (compras/vendas) já ordenadas:
 * gatilho disparado primeiro, depois maior confluência, depois RSI mais extremo.
 * Ativos neutros (score 0/0) são descartados — o painel só mostra o que está
 * em compra ou venda.
 */
export function rankMtfSignals(
  heatmap: Record<string, Record<string, number>> | undefined,
  symbols: string[],
  config: MtfConfig = DEFAULT_MTF_CONFIG,
): RankedSignals {
  if (!heatmap) return { longs: [], shorts: [] };

  const longs: MtfSignal[] = [];
  const shorts: MtfSignal[] = [];

  for (const symbol of symbols) {
    const sig = computeMtfSignal(symbol, heatmap[symbol], config);
    if (!sig) continue;
    if (sig.scoreLong > 0) longs.push(sig);
    if (sig.scoreShort > 0) shorts.push(sig);
  }

  longs.sort(
    (a, b) =>
      Number(b.triggerLong) - Number(a.triggerLong) ||
      b.scoreLong - a.scoreLong ||
      a.rsi.m5 - b.rsi.m5,
  );
  shorts.sort(
    (a, b) =>
      Number(b.triggerShort) - Number(a.triggerShort) ||
      b.scoreShort - a.scoreShort ||
      b.rsi.m5 - a.rsi.m5,
  );

  return { longs, shorts };
}
