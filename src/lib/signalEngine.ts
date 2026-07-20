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
  ma50: number;
  ma80: number;
  ma100: number;
  ma200: number;
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
  ma50: number;
  ma80: number;
  ma100: number;
  ma200: number;
  indicators: SignalIndicators;
  signal: SignalScore;
  volumeRatio: number;
  shortTerm?: SetupEvaluation;
  midTerm?: SetupEvaluation;
  longTerm?: SetupEvaluation;
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
      ma50: calculateSMA(prices, 50),
      ma80: calculateSMA(prices, 80),
      ma100: calculateSMA(prices, 100),
      ma200: calculateSMA(prices, 200),
      fib: calculateFibonacci(prices),
      multiRsi: multiRsi,
      fundingRate: derivative?.fundingRate,
      openInterest: derivative?.openInterest,
    };

    const enriched = {
      ...coin,
      ...indicators,
      indicators,
      volumeRatio: coin.total_volume / coin.market_cap,
      signal: calculateSignalScore(coin, fearGreedValue, multiRsi, derivative?.fundingRate),
    } as EnrichedCoin;

    return {
      ...enriched,
      shortTerm: evaluateShortTermSetup(enriched),
      midTerm: evaluateMidTermSetup(enriched),
      longTerm: evaluateLongTermSetup(enriched),
    };
  });
}

export interface SetupEvaluation {
  isActive: boolean;
  type: "BUY" | "SELL" | "NEUTRAL";
  confidence: number; // 0-100
  reasons: string[];
}

export function evaluateShortTermSetup(coin: EnrichedCoin): SetupEvaluation {
  let confidence = 0;
  const reasons: string[] = [];
  const price = coin.current_price;
  
  // Condições de Compra Curto Prazo (Scalp/Day)
  // Tendência principal intradiária (MA80) precisa ser de alta para comprar com segurança
  const isUptrend = coin.ma20 > coin.ma80;
  
  if (isUptrend && price > coin.ma80) {
    // Pullback opportunity (preço testa MA10 ou MA20)
    if (price <= coin.ma10 * 1.01 && price >= coin.ma20 * 0.99) {
      confidence += 40;
      reasons.push("Preço tocando a zona de compra entre MA10 e MA20 (Pullback intradiário).");
    }
    
    // RSI Filters
    if (coin.indicators.rsi < 40) {
      confidence += 30;
      reasons.push("RSI baixo durante tendência de alta (Excelente ponto de entrada).");
    }
    
    // Histograma MACD
    if (coin.indicators.macd.histogram > 0) {
      confidence += 15;
      reasons.push("MACD Histograma revelando retomada de força compradora.");
    }
    
    // Filtro temporal curto (se disponível 15m)
    if (coin.indicators.multiRsi?.["15m"] !== undefined && coin.indicators.multiRsi["15m"] < 35) {
      confidence += 15;
      reasons.push("Exaustão em 15m detectada, confluência para reversão rápida.");
    }
  }

  // Condições de Venda Curto Prazo (Short/Scalp)
  const isDowntrend = coin.ma20 < coin.ma80;
  if (!isUptrend && isDowntrend && price < coin.ma80) {
    if (price >= coin.ma10 * 0.99 && price <= coin.ma20 * 1.01) {
      confidence += 40;
      reasons.push("Pullback de venda na zona da MA10-MA20 (Short seguro).");
    }
    if (coin.indicators.rsi > 60) {
      confidence += 30;
      reasons.push("RSI esticado num ciclo de baixa intradiário.");
    }
    if (coin.indicators.macd.histogram < 0) {
      confidence += 15;
      reasons.push("MACD Histograma intensificando força vendedora.");
    }
    if (coin.indicators.multiRsi?.["15m"] !== undefined && coin.indicators.multiRsi["15m"] > 65) {
      confidence += 15;
      reasons.push("Euforia em 15m detectada, topo iminente.");
    }
    
    if (confidence >= 55) {
      return { isActive: true, type: "SELL", confidence, reasons };
    }
  }

  if (confidence >= 55) {
    return { isActive: true, type: "BUY", confidence, reasons };
  }

  return { isActive: false, type: "NEUTRAL", confidence: 0, reasons: ["Ativo lateralizado ou fora das zonas ótimas de scalp."] };
}

/**
 * Setup de MÉDIO PRAZO (swing de dias/semanas). Fica entre o curto (MA10/20/80,
 * intradiário) e o longo (MA50/100/200, macro): usa MA20 vs MA50 como filtro de
 * tendência + RSI + retração de Fibonacci + MACD. Espelha a estrutura dos outros dois.
 */
export function evaluateMidTermSetup(coin: EnrichedCoin): SetupEvaluation {
  let confidence = 0;
  const reasons: string[] = [];
  const price = coin.current_price;
  const rsi = coin.indicators.rsi;

  // Tendência de médio prazo: MA20 acima da MA50 = swing de alta.
  const swingUptrend = coin.ma20 > coin.ma50;
  const swingDowntrend = coin.ma20 < coin.ma50;

  if (swingUptrend && price > coin.ma50) {
    // Pullback à zona de swing (entre MA20 e MA50) numa tendência de alta.
    if (price <= coin.ma20 * 1.02 && price >= coin.ma50 * 0.98) {
      confidence += 45;
      reasons.push("Preço recuou para a zona de swing (MA20–MA50) dentro de uma tendência de alta.");
    }
    if (rsi < 45) {
      confidence += 25;
      reasons.push("RSI ainda contido numa tendência de alta de médio prazo (fôlego para subir).");
    }
    // Retração de Fibonacci 0.382–0.5 (recompra profunda de swing; níveis medidos do topo).
    if (price >= coin.indicators.fib[0.382] * 0.97 && price <= coin.indicators.fib[0.5] * 1.03) {
      confidence += 20;
      reasons.push("Preço na zona de retração 0.382–0.5 de Fibonacci (recompra de swing).");
    }
    if (coin.indicators.macd.histogram > 0) {
      confidence += 10;
      reasons.push("MACD retomando força compradora no médio prazo.");
    }
    if (confidence >= 55) return { isActive: true, type: "BUY", confidence, reasons };
  }

  if (swingDowntrend && price < coin.ma50) {
    // Reteste da MA20–MA50 como resistência numa tendência de baixa.
    if (price >= coin.ma20 * 0.98 && price <= coin.ma50 * 1.02) {
      confidence += 45;
      reasons.push("Reteste da MA20–MA50 como resistência dentro de uma tendência de baixa.");
    }
    if (rsi > 58) {
      confidence += 25;
      reasons.push("RSI esticado dentro de um médio prazo baixista (risco de nova perna de queda).");
    }
    if (coin.indicators.macd.histogram < 0) {
      confidence += 10;
      reasons.push("MACD reforçando a pressão vendedora no swing.");
    }
    if (confidence >= 55) return { isActive: true, type: "SELL", confidence, reasons };
  }

  return { isActive: false, type: "NEUTRAL", confidence: 0, reasons: ["Sem assimetria clara de swing no médio prazo (mercado no meio do canal)."] };
}

export function evaluateLongTermSetup(coin: EnrichedCoin): SetupEvaluation {
  let confidence = 0;
  const reasons: string[] = [];
  const price = coin.current_price;

  // Condições Swing / Holder.
  // IMPORTANTE: a MA200 NÃO é confiável aqui — o sparkline tem ~168 pontos (7d horário) < 200,
  // então calculateSMA(…,200) devolve o último preço e o regime ficava INVERTIDO. Usamos MA50 vs
  // MA100 (ambas calculáveis) como âncora macro, e a MA100 como suporte profundo de longo prazo.
  const macroUptrend = coin.ma50 > coin.ma100;
  // Golden pocket (retração 0.618 medida do TOPO) = low + 0.382*range no nosso Fib (fib[0.382]).
  const goldenPocket = coin.indicators.fib[0.382];

  if (macroUptrend) {
    // Acumulação: preço corrigiu para a zona de suporte de longo prazo (entre MA100 e MA50).
    if (price <= coin.ma50 * 1.03 && price >= coin.ma100 * 0.95) {
      confidence += 50;
      reasons.push("Preço corrigiu para a zona de suporte de longo prazo (MA100–MA50). Setup clássico de acúmulo.");
    }

    if (coin.indicators.rsi < 35) {
      confidence += 30;
      reasons.push("RSI em sobrevenda durante uma tendência macro de alta.");
    }

    // Fib Retracement (golden pocket profundo).
    if (goldenPocket && price <= goldenPocket * 1.05 && price >= goldenPocket * 0.95) {
      confidence += 20;
      reasons.push("Preço na Retração de Ouro (golden pocket ~0.618).");
    }
  }

  // Short Swing / Fundo Perdido
  if (!macroUptrend) {
    if (price >= coin.ma50 * 0.95 && price <= coin.ma100 * 1.05) {
      confidence += 50;
      reasons.push("Reteste da MA50/MA100 como resistência. Zona de distribuição.");
    }
    if (coin.indicators.rsi > 65) {
      confidence += 30;
      reasons.push("RSI em euforia dentro de um mercado macro de baixa (repique de baixa).");
    }

    if (confidence >= 65) {
      return { isActive: true, type: "SELL", confidence, reasons };
    }
  }

  if (confidence >= 65) {
    return { isActive: true, type: "BUY", confidence, reasons };
  }

  return { isActive: false, type: "NEUTRAL", confidence: 0, reasons: ["Mercado oscilando no meio do canal sem assimetria de risco/retorno favorável."] };
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
