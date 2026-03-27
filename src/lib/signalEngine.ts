import { 
  CoinGeckoMarket, 
  calculateRSI, 
  calculateSMA, 
  calculateMACD, 
  calculateBollingerBands, 
  calculateStochRSI,
  calculateFibonacci
} from "./api/coingecko";

export interface SignalScore {
  total: number;
  classification: "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell";
  label: string;
  emoji: string;
  reasons: SignalReason[];
  breakdown: ScoreBreakdown;
  isGoldenZone: boolean; // RSI < 10
  isExhaustionZone: boolean; // RSI > 85
  confluence: "Low" | "Medium" | "High";
}

export interface SignalReason {
  factor: string;
  description: string;
  points: number;
  category: "momentum" | "trend" | "volume" | "sentiment" | "volatility" | "derivative";
}

export interface ScoreBreakdown {
  momentum: number;
  trend: number;
  volume: number;
  sentiment: number;
  volatility: number;
  derivative: number;
}

export interface SignalIndicators {
  rsi: number;
  stochRsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bb: { middle: number; upper: number; lower: number };
  ma10: number;
  ma20: number;
  ma80: number;
  fib: Record<number, number>;
  multiRsi?: Record<string, number>;
  fundingRate?: number;
  openInterest?: number;
}

export interface EnrichedCoin extends CoinGeckoMarket {
  rsi: number;
  stochRsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bb: { middle: number; upper: number; lower: number };
  ma10: number;
  ma20: number;
  ma80: number;
  indicators: SignalIndicators;
  signal: SignalScore;
  volumeRatio: number;
}

function classifyScore(score: number): Pick<SignalScore, "classification" | "label" | "emoji"> {
  if (score >= 8) return { classification: "strong_buy", label: "COMPRA INSTITUCIONAL", emoji: "💎" };
  if (score >= 5) return { classification: "buy", label: "ALTA TÉCNICA", emoji: "📈" };
  if (score >= 3) return { classification: "neutral", label: "NEUTRO", emoji: "⚪" };
  if (score >= 1) return { classification: "sell", label: "BAIXA TÉCNICA", emoji: "📉" };
  return { classification: "strong_sell", label: "DISTRIBUIÇÃO FORTE", emoji: "🔥" };
}

export function calculateSignalScore(
  coin: CoinGeckoMarket,
  fearGreedValue?: number,
  multiRsi?: Record<string, number>,
  fundingRate?: number
): SignalScore {
  const prices = coin.sparkline_in_7d?.price || [];
  const rsi = calculateRSI(prices);
  const stochRsi = calculateStochRSI(prices);
  const macd = calculateMACD(prices);
  const bb = calculateBollingerBands(prices);
  const ma10 = calculateSMA(prices, 10);
  const ma20 = calculateSMA(prices, 20);
  const ma80 = calculateSMA(prices, 80);
  const fib = calculateFibonacci(prices);
  const currentPrice = coin.current_price;

  const reasons: SignalReason[] = [];
  let momentum = 0;
  let trend = 0;
  let volume = 0;
  let sentiment = 0;
  let volatility = 0;
  let derivative = 0;

  // === MOMENTUM (RSI + StochRSI + MACD) ===
  // RSI
  const isGoldenZone = rsi <= 10;
  const isExhaustionZone = rsi >= 85;

  if (isGoldenZone) {
    momentum += 5; // MASSIVE WEIGHT for extreme RSI
    reasons.push({ factor: "RSI GOLDEN ZONE", description: `RSI EXTREMO (${Math.round(rsi)}) — Oportunidade rara de compra`, points: 5, category: "momentum" });
  } else if (rsi <= 25) {
    momentum += 3;
    reasons.push({ factor: "RSI", description: `RSI extremamente baixo (${Math.round(rsi)}) — sobrevendido forte`, points: 3, category: "momentum" });
  } else if (rsi <= 30) {
    momentum += 2;
    reasons.push({ factor: "RSI", description: `RSI baixo (${Math.round(rsi)}) — sobrevendido`, points: 2, category: "momentum" });
  } else if (isExhaustionZone) {
    momentum -= 5;
    reasons.push({ factor: "RSI EXHAUSTION", description: `RSI EXTREMO (${Math.round(rsi)}) — Zona de perigo / Venda`, points: -5, category: "momentum" });
  } else if (rsi >= 75) {
    momentum -= 3;
    reasons.push({ factor: "RSI", description: `RSI muito alto (${Math.round(rsi)}) — sobrecomprado forte`, points: -3, category: "momentum" });
  } else if (rsi >= 70) {
    momentum -= 2;
    reasons.push({ factor: "RSI", description: `RSI alto (${Math.round(rsi)}) — sobrecomprado`, points: -2, category: "momentum" });
  }

  // Multi-Timeframe Confluence
  if (multiRsi) {
    const tf4h = multiRsi["4h"];
    const tf1d = multiRsi["1d"];
    
    if (rsi < 30 && tf4h < 35 && tf1d < 40) {
      momentum += 4;
      reasons.push({ factor: "MTF RSI", description: "CONFLUÊNCIA DE SOBREVENDA (1h+4h+1D) — Altíssima probabilidade", points: 4, category: "momentum" });
    } else if (rsi > 70 && tf4h > 65 && tf1d > 60) {
      momentum -= 4;
      reasons.push({ factor: "MTF RSI", description: "CONFLUÊNCIA DE SOBRECOMPRA (1h+4h+1D) — Risco de correção", points: -4, category: "momentum" });
    }
  }

  // StochRSI
  if (stochRsi <= 15) {
    momentum += 2;
    reasons.push({ factor: "StochRSI", description: `StochRSI no fundo (${Math.round(stochRsi)}) — ignição bullish`, points: 2, category: "momentum" });
  } else if (stochRsi >= 85) {
    momentum -= 2;
    reasons.push({ factor: "StochRSI", description: `StochRSI no topo (${Math.round(stochRsi)}) — exaustão de compra`, points: -2, category: "momentum" });
  }

  // MACD
  if (macd.histogram > 0 && macd.macd > macd.signal) {
    momentum += 2;
    reasons.push({ factor: "MACD", description: "Histograma positivo + Cruzamento bullish", points: 2, category: "momentum" });
  } else if (macd.histogram < 0 && macd.macd < macd.signal) {
    momentum -= 2;
    reasons.push({ factor: "MACD", description: "Histograma negativo + Cruzamento bearish", points: -2, category: "momentum" });
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

  // === VOLATILITY (Bollinger Bands) ===
  if (currentPrice >= bb.upper) {
    volatility -= 2;
    reasons.push({ factor: "Bollinger", description: "Preço tocando banda superior — resistência", points: -2, category: "volatility" });
  } else if (currentPrice <= bb.lower) {
    volatility += 2;
    reasons.push({ factor: "Bollinger", description: "Preço tocando banda inferior — suporte", points: 2, category: "volatility" });
  }

  // === FIBONACCI ZONES ===
  const goldenPocketMin = fib[0.618] * 0.995;
  const goldenPocketMax = fib[0.618] * 1.005;
  
  if (currentPrice >= goldenPocketMin && currentPrice <= goldenPocketMax) {
    trend += 4;
    reasons.push({ factor: "Fibonacci", description: "PREÇO NO GOLDEN POCKET (0.618) — Zona Institucional", points: 4, category: "trend" });
  } else if (currentPrice >= fib[0.382] * 0.995 && currentPrice <= fib[0.382] * 1.005) {
    trend += 2;
    reasons.push({ factor: "Fibonacci", description: "Respeitando Fib 0.382 — Continuidade de tendência", points: 2, category: "trend" });
  } else if (currentPrice >= fib[0.5] * 0.995 && currentPrice <= fib[0.5] * 1.005) {
    trend += 1;
    reasons.push({ factor: "Fibonacci", description: "Fib 0.5 — Ponto de equilíbrio", points: 1, category: "trend" });
  }

  // === VOLUME ===
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

  // === DERIVATIVES (Funding Rate) ===
  if (fundingRate !== undefined) {
    if (fundingRate < -0.01) {
      derivative += 3;
      reasons.push({ factor: "Funding Rate", description: `Funding NEGATIVO (${fundingRate.toFixed(4)}) — Possível Short Squeeze`, points: 3, category: "derivative" });
    } else if (fundingRate > 0.03) {
      derivative -= 2;
      reasons.push({ factor: "Funding Rate", description: `Funding ALTO (${fundingRate.toFixed(4)}) — Excesso de alavancagem Long`, points: -2, category: "derivative" });
    }
  }

  const total = momentum + trend + volume + sentiment + volatility + derivative;

  // Logic for Confluence Level
  let confluenceCount = 0;
  if (rsi < 30 && currentPrice < bb.lower) confluenceCount++;
  if (rsi < 15) confluenceCount++;
  if (fearGreedValue !== undefined && fearGreedValue < 20) confluenceCount++;
  
  const confluence = confluenceCount >= 2 ? "High" : (confluenceCount === 1 ? "Medium" : "Low");

  return {
    total,
    ...classifyScore(total),
    reasons: reasons.sort((a, b) => Math.abs(b.points) - Math.abs(a.points)),
    breakdown: { momentum, trend, volume, sentiment, volatility, derivative },
    isGoldenZone,
    isExhaustionZone,
    confluence
  };
}

export function enrichCoins(
  coins: CoinGeckoMarket[],
  fearGreedValue?: number,
  multiRsiData?: Record<string, Record<string, number>>,
  derivativeData?: Record<string, any>
): EnrichedCoin[] {
  return coins.map((coin) => {
    const symbol = coin.symbol.toUpperCase();
    const prices = coin.sparkline_in_7d?.price || [];
    const multiRsi = multiRsiData?.[symbol];
    const derivative = derivativeData?.[symbol];

    const indicators: SignalIndicators = {
      rsi: calculateRSI(prices),
      stochRsi: calculateStochRSI(prices),
      macd: calculateMACD(prices),
      bb: calculateBollingerBands(prices),
      ma10: calculateSMA(prices, 10),
      ma20: calculateSMA(prices, 20),
      ma80: calculateSMA(prices, 80),
      fib: calculateFibonacci(prices),
      multiRsi: multiRsi,
      fundingRate: derivative?.fundingRate,
      openInterest: derivative?.openInterest,
    };

    return {
      ...coin,
      ...indicators,
      indicators,
      volumeRatio: coin.total_volume / coin.market_cap,
      signal: calculateSignalScore(coin, fearGreedValue, multiRsi, derivative?.fundingRate),
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
