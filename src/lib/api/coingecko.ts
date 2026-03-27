import { useQuery } from "@tanstack/react-query";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_24h_in_currency: number | null;
  price_change_percentage_7d_in_currency: number | null;
  sparkline_in_7d: { price: number[] };
  ath: number;
  atl: number;
}

export interface CoinGeckoGlobal {
  data: {
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
  };
}

export interface CoinGeckoTrending {
  coins: {
    item: {
      id: string;
      name: string;
      symbol: string;
      thumb: string;
      score: number;
      data: {
        price: number;
        price_change_percentage_24h: Record<string, number>;
      };
    };
  }[];
}

export interface FearGreedData {
  name: string;
  data: { value: string; value_classification: string; timestamp: string }[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Markets list (top coins)
export function useMarkets(page = 1, perPage = 50) {
  return useQuery({
    queryKey: ["coingecko-markets", page, perPage],
    queryFn: () =>
      fetchJson<CoinGeckoMarket[]>(
        `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`
      ),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

// Global data
export function useGlobalData() {
  return useQuery({
    queryKey: ["coingecko-global"],
    queryFn: () => fetchJson<CoinGeckoGlobal>(`${COINGECKO_BASE}/global`),
    staleTime: 120_000,
    refetchInterval: 120_000,
  });
}

// Trending coins
export function useTrending() {
  return useQuery({
    queryKey: ["coingecko-trending"],
    queryFn: () => fetchJson<CoinGeckoTrending>(`${COINGECKO_BASE}/search/trending`),
    staleTime: 300_000,
  });
}

// Single coin detail
export function useCoinDetail(coinId: string) {
  return useQuery({
    queryKey: ["coingecko-coin", coinId],
    queryFn: () =>
      fetchJson<any>(
        `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`
      ),
    staleTime: 60_000,
    enabled: !!coinId,
  });
}

// Price chart (OHLC)
export function useCoinOHLC(coinId: string, days = 1) {
  return useQuery({
    queryKey: ["coingecko-ohlc", coinId, days],
    queryFn: () =>
      fetchJson<number[][]>(
        `${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
      ),
    staleTime: 60_000,
    enabled: !!coinId,
  });
}

// Market chart (for area chart)
export function useCoinChart(coinId: string, days = 1) {
  return useQuery({
    queryKey: ["coingecko-chart", coinId, days],
    queryFn: () =>
      fetchJson<{ prices: number[][]; market_caps: number[][]; total_volumes: number[][] }>(
        `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      ),
    staleTime: 60_000,
    enabled: !!coinId,
  });
}

// Fear & Greed Index (alternative.me - free, no key)
export function useFearGreed() {
  return useQuery({
    queryKey: ["fear-greed"],
    queryFn: () =>
      fetchJson<FearGreedData>("https://api.alternative.me/fng/?limit=1"),
    staleTime: 300_000,
  });
}

// RSI calculation from price data
export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;
  
  const changes = prices.slice(1).map((p, i) => p - prices[i]);
  const recent = changes.slice(-period);
  
  let avgGain = 0;
  let avgLoss = 0;
  
  for (const change of recent) {
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// Simple Moving Average
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

// Exponential Moving Average
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return calculateSMA(prices, period);
  const k = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26 + 9) return { macd: 0, signal: 0, histogram: 0 };
  
  // Calculate MACD Line = 12-period EMA - 26-period EMA
  // To get the Signal Line (9-period EMA of MACD Line), we need multiple MACD points
  const macdPoints: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    const ema12 = calculateEMA(slice, 12);
    const ema26 = calculateEMA(slice, 26);
    macdPoints.push(ema12 - ema26);
  }
  
  const macd = macdPoints[macdPoints.length - 1];
  const signal = calculateEMA(macdPoints, 9);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

// Bollinger Bands
export function calculateBollingerBands(prices: number[], period = 20, stdDev = 2): { middle: number; upper: number; lower: number } {
  if (prices.length < period) return { middle: 0, upper: 0, lower: 0 };
  
  const slice = prices.slice(-period);
  const middle = calculateSMA(slice, period);
  
  const squareDiffs = slice.map((p) => Math.pow(p - middle, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / period;
  const standardDeviation = Math.sqrt(avgSquareDiff);
  
  return {
    middle,
    upper: middle + standardDeviation * stdDev,
    lower: middle - standardDeviation * stdDev,
  };
}

// StochRSI
export function calculateStochRSI(prices: number[], period = 14): number {
  if (prices.length < period * 2) return 50;
  
  const rsiValues: number[] = [];
  for (let i = period; i <= prices.length; i++) {
    rsiValues.push(calculateRSI(prices.slice(0, i), period));
  }
  
  const latestRsi = rsiValues[rsiValues.length - 1];
  const recentRsi = rsiValues.slice(-period);
  const minRsi = Math.min(...recentRsi);
  const maxRsi = Math.max(...recentRsi);
  
  if (maxRsi === minRsi) return 50;
  return ((latestRsi - minRsi) / (maxRsi - minRsi)) * 100;
}
