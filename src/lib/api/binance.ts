import { useQuery } from "@tanstack/react-query";

const BINANCE_BASE = "https://api.binance.com/api/v3";

export type Timeframe = "1h" | "4h" | "12h" | "1d";

export interface BinanceKline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

async function fetchBinanceKlines(symbol: string, interval: Timeframe, limit = 100): Promise<BinanceKline[]> {
  const formattedSymbol = symbol.toUpperCase().endsWith("USDT") ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
  const url = `${BINANCE_BASE}/klines?symbol=${formattedSymbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`);
  const data = await res.json();
  
  return data.map((d: any[]) => ({
    openTime: d[0],
    open: parseFloat(d[1]),
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4]),
    volume: parseFloat(d[5]),
    closeTime: d[6],
  }));
}

// Calculate RSI from Binance Klines
export function calculateBinanceRSI(klines: BinanceKline[], period = 14): number {
  if (klines.length < period + 1) return 50;
  
  const closes = klines.map(k => k.close);
  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  
  let gains = 0;
  let losses = 0;
  
  // Initial average
  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Smoothed averages
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// Hook for multi-timeframe RSI for a single symbol
export function useMultiRsi(symbol: string) {
  return useQuery({
    queryKey: ["binance-multi-rsi", symbol],
    queryFn: async () => {
      const timeframes: Timeframe[] = ["1h", "4h", "12h", "1d"];
      const results: Record<string, number> = {};
      
      await Promise.all(timeframes.map(async (tf) => {
        try {
          const klines = await fetchBinanceKlines(symbol, tf, 50);
          results[tf] = calculateBinanceRSI(klines);
        } catch (e) {
          results[tf] = 50; // default
        }
      }));
      
      return results;
    },
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

// Global RSI Heatmap data hook for top symbols
export function useRsiHeatmapData(symbols: string[]) {
  return useQuery({
    queryKey: ["binance-rsi-heatmap", symbols],
    queryFn: async () => {
      const timeframes: Timeframe[] = ["1h", "4h", "12h", "1d"];
      const heatmap: Record<string, Record<string, number>> = {};
      
      // Batch processing with small delays if needed, but for 20-30 symbols it's ok
      await Promise.all(symbols.map(async (symbol) => {
        heatmap[symbol] = {};
        await Promise.all(timeframes.map(async (tf) => {
          try {
            const klines = await fetchBinanceKlines(symbol, tf, 50);
            heatmap[symbol][tf] = calculateBinanceRSI(klines);
          } catch (e) {
            heatmap[symbol][tf] = 50;
          }
        }));
      }));
      
      return heatmap;
    },
    staleTime: 60_000,
    enabled: symbols.length > 0,
  });
}

// Fetch funding rate and open interest from Binance Futures (Public API)
export async function fetchBinanceDerivativeData(symbol: string) {
  const formattedSymbol = symbol.toUpperCase().endsWith("USDT") ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
  
  try {
    const [fundingRes, oiRes] = await Promise.all([
      fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${formattedSymbol}`),
      fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${formattedSymbol}`)
    ]);

    if (!fundingRes.ok || !oiRes.ok) return null;

    const fundingData = await fundingRes.json();
    const oiData = await oiRes.json();

    return {
      fundingRate: parseFloat(fundingData.lastFundingRate),
      nextFundingTime: fundingData.nextFundingTime,
      openInterest: parseFloat(oiData.openInterest),
      timestamp: oiData.time
    };
  } catch (e) {
    return null;
  }
}

// Hook for batch derivative data (Global Market Status)
export function useDerivativeData(symbols: string[]) {
  return useQuery({
    queryKey: ["binance-derivatives", symbols],
    queryFn: async () => {
      const results: Record<string, any> = {};
      // Fetch top symbols in parallel
      await Promise.all(symbols.map(async (s) => {
        const data = await fetchBinanceDerivativeData(s);
        if (data) results[s] = data;
      }));
      return results;
    },
    staleTime: 60_000,
    enabled: symbols.length > 0,
  });
}
