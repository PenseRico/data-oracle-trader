import { CoinGeckoMarket, calculateRSI, calculateSMA } from "./api/coingecko";

export interface SignalScore {
  total: number;
  classification: "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell";
  label: string;
  emoji: string;
  reasons: SignalReason[];
  breakdown: ScoreBreakdown;
}

export interface SignalReason {
  factor: string;
  description: string;
  points: number;
  category: "momentum" | "trend" | "volume" | "sentiment";
}

export interface ScoreBreakdown {
  momentum: number;
  trend: number;
  volume: number;
  sentiment: number;
}

export interface EnrichedCoin extends CoinGeckoMarket {
  rsi: number;
  ma10: number;
  ma20: number;
  ma80: number;
  signal: SignalScore;
  volumeRatio: number;
}

function classifyScore(score: number): Pick<SignalScore, "classification" | "label" | "emoji"> {
  if (score >= 8) return { classification: "strong_buy", label: "COMPRA FORTE", emoji: "🟢" };
  if (score >= 5) return { classification: "buy", label: "COMPRA", emoji: "🟡" };
  if (score >= 3) return { classification: "neutral", label: "NEUTRO", emoji: "⚪" };
  if (score >= 1) return { classification: "sell", label: "VENDA", emoji: "🔴" };
  return { classification: "strong_sell", label: "VENDA FORTE", emoji: "🔴" };
}

export function calculateSignalScore(
  coin: CoinGeckoMarket,
  fearGreedValue?: number
): SignalScore {
  const prices = coin.sparkline_in_7d?.price || [];
  const rsi = calculateRSI(prices);
  const ma10 = calculateSMA(prices, 10);
  const ma20 = calculateSMA(prices, 20);
  const ma80 = calculateSMA(prices, 80);
  const currentPrice = coin.current_price;

  const reasons: SignalReason[] = [];
  let momentum = 0;
  let trend = 0;
  let volume = 0;
  let sentiment = 0;

  // === MOMENTUM (RSI) ===
  if (rsi <= 25) {
    momentum += 3;
    reasons.push({ factor: "RSI", description: `RSI extremamente baixo (${Math.round(rsi)}) — sobrevendido forte`, points: 3, category: "momentum" });
  } else if (rsi <= 30) {
    momentum += 2;
    reasons.push({ factor: "RSI", description: `RSI baixo (${Math.round(rsi)}) — sobrevendido`, points: 2, category: "momentum" });
  } else if (rsi >= 75) {
    momentum -= 3;
    reasons.push({ factor: "RSI", description: `RSI muito alto (${Math.round(rsi)}) — sobrecomprado forte`, points: -3, category: "momentum" });
  } else if (rsi >= 70) {
    momentum -= 2;
    reasons.push({ factor: "RSI", description: `RSI alto (${Math.round(rsi)}) — sobrecomprado`, points: -2, category: "momentum" });
  }

  // === TREND (Moving Averages) ===
  if (currentPrice > ma10) {
    trend += 1;
    reasons.push({ factor: "MA10", description: "Preço acima da MA10", points: 1, category: "trend" });
  } else {
    trend -= 1;
    reasons.push({ factor: "MA10", description: "Preço abaixo da MA10", points: -1, category: "trend" });
  }

  if (ma10 > ma20) {
    trend += 2;
    reasons.push({ factor: "Cruzamento MA", description: "MA10 > MA20 — cruzamento bullish", points: 2, category: "trend" });
  } else if (ma10 < ma20) {
    trend -= 2;
    reasons.push({ factor: "Cruzamento MA", description: "MA10 < MA20 — cruzamento bearish", points: -2, category: "trend" });
  }

  if (ma20 > ma80) {
    trend += 1;
    reasons.push({ factor: "Tendência", description: "MA20 > MA80 — tendência de alta de longo prazo", points: 1, category: "trend" });
  } else {
    trend -= 1;
    reasons.push({ factor: "Tendência", description: "MA20 < MA80 — tendência de baixa de longo prazo", points: -1, category: "trend" });
  }

  // === VOLUME ===
  // Compare volume to average (using volume/market_cap ratio as proxy)
  const volumeRatio = coin.total_volume / coin.market_cap;
  if (volumeRatio > 0.15) {
    volume += 3;
    reasons.push({ factor: "Volume", description: "Volume explosivo (>15% do market cap)", points: 3, category: "volume" });
  } else if (volumeRatio > 0.08) {
    volume += 2;
    reasons.push({ factor: "Volume", description: "Volume acima da média (>8% do market cap)", points: 2, category: "volume" });
  } else if (volumeRatio < 0.02) {
    volume -= 1;
    reasons.push({ factor: "Volume", description: "Volume muito baixo (<2% do market cap)", points: -1, category: "volume" });
  }

  // === SENTIMENT (Fear & Greed) ===
  if (fearGreedValue !== undefined) {
    if (fearGreedValue <= 20) {
      sentiment += 2;
      reasons.push({ factor: "Fear & Greed", description: `Medo extremo (${fearGreedValue}) — oportunidade contrária`, points: 2, category: "sentiment" });
    } else if (fearGreedValue <= 35) {
      sentiment += 1;
      reasons.push({ factor: "Fear & Greed", description: `Medo (${fearGreedValue}) — mercado cauteloso`, points: 1, category: "sentiment" });
    } else if (fearGreedValue >= 80) {
      sentiment -= 2;
      reasons.push({ factor: "Fear & Greed", description: `Ganância extrema (${fearGreedValue}) — possível topo`, points: -2, category: "sentiment" });
    } else if (fearGreedValue >= 65) {
      sentiment -= 1;
      reasons.push({ factor: "Fear & Greed", description: `Ganância (${fearGreedValue}) — mercado otimista`, points: -1, category: "sentiment" });
    }
  }

  // Price change momentum bonus
  const change24 = coin.price_change_percentage_24h_in_currency ?? 0;
  const change7d = coin.price_change_percentage_7d_in_currency ?? 0;
  if (change24 > 5 && change7d > 10) {
    momentum += 1;
    reasons.push({ factor: "Momentum", description: "Forte alta em 24h e 7d — momentum positivo", points: 1, category: "momentum" });
  } else if (change24 < -5 && change7d < -10 && rsi < 40) {
    momentum += 1;
    reasons.push({ factor: "Reversão", description: "Forte queda + RSI baixo — possível reversão", points: 1, category: "momentum" });
  }

  const total = momentum + trend + volume + sentiment;

  return {
    total,
    ...classifyScore(total),
    reasons: reasons.sort((a, b) => Math.abs(b.points) - Math.abs(a.points)),
    breakdown: { momentum, trend, volume, sentiment },
  };
}

export function enrichCoins(
  coins: CoinGeckoMarket[],
  fearGreedValue?: number
): EnrichedCoin[] {
  return coins.map((coin) => {
    const prices = coin.sparkline_in_7d?.price || [];
    return {
      ...coin,
      rsi: calculateRSI(prices),
      ma10: calculateSMA(prices, 10),
      ma20: calculateSMA(prices, 20),
      ma80: calculateSMA(prices, 80),
      volumeRatio: coin.total_volume / coin.market_cap,
      signal: calculateSignalScore(coin, fearGreedValue),
    };
  });
}

export function getClassColor(classification: SignalScore["classification"]): string {
  switch (classification) {
    case "strong_buy": return "text-primary";
    case "buy": return "text-yellow-400";
    case "neutral": return "text-muted-foreground";
    case "sell": return "text-orange-400";
    case "strong_sell": return "text-destructive";
  }
}

export function getClassBg(classification: SignalScore["classification"]): string {
  switch (classification) {
    case "strong_buy": return "bg-primary/15 text-primary border-primary/30";
    case "buy": return "bg-yellow-400/15 text-yellow-400 border-yellow-400/30";
    case "neutral": return "bg-muted text-muted-foreground border-border";
    case "sell": return "bg-orange-400/15 text-orange-400 border-orange-400/30";
    case "strong_sell": return "bg-destructive/15 text-destructive border-destructive/30";
  }
}
