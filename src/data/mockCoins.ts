export type TimeFrame = '4h' | '12h' | '24h';

export type CoinData = {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  rsi: Record<TimeFrame, number>;
  ma10: number;
  ma20: number;
  ma80: number;
  signal: 'buy' | 'sell' | 'neutral';
  sparkline: number[];
};

const generateSparkline = (base: number, volatility: number): number[] => {
  const points: number[] = [];
  let current = base;
  for (let i = 0; i < 24; i++) {
    current += (Math.random() - 0.5) * volatility;
    points.push(current);
  }
  return points;
};

export const mockCoins: CoinData[] = [
  {
    id: 'bitcoin', rank: 1, name: 'Bitcoin', symbol: 'BTC',
    price: 67432.18, change1h: 0.23, change24h: 2.45, change7d: 5.12,
    marketCap: 1326000000000, volume24h: 28500000000,
    rsi: { '4h': 62, '12h': 58, '24h': 55 },
    ma10: 66800, ma20: 65200, ma80: 61500,
    signal: 'neutral',
    sparkline: generateSparkline(67000, 500),
  },
  {
    id: 'ethereum', rank: 2, name: 'Ethereum', symbol: 'ETH',
    price: 3521.45, change1h: -0.12, change24h: 1.87, change7d: 3.45,
    marketCap: 423000000000, volume24h: 15200000000,
    rsi: { '4h': 48, '12h': 52, '24h': 50 },
    ma10: 3480, ma20: 3420, ma80: 3200,
    signal: 'neutral',
    sparkline: generateSparkline(3500, 30),
  },
  {
    id: 'solana', rank: 3, name: 'Solana', symbol: 'SOL',
    price: 178.92, change1h: 1.45, change24h: 8.23, change7d: 15.67,
    marketCap: 82000000000, volume24h: 4500000000,
    rsi: { '4h': 78, '12h': 74, '24h': 72 },
    ma10: 172, ma20: 165, ma80: 142,
    signal: 'sell',
    sparkline: generateSparkline(175, 5),
  },
  {
    id: 'xrp', rank: 4, name: 'XRP', symbol: 'XRP',
    price: 0.6234, change1h: -0.34, change24h: -1.23, change7d: 2.10,
    marketCap: 34000000000, volume24h: 1200000000,
    rsi: { '4h': 42, '12h': 38, '24h': 35 },
    ma10: 0.63, ma20: 0.64, ma80: 0.58,
    signal: 'neutral',
    sparkline: generateSparkline(0.62, 0.01),
  },
  {
    id: 'cardano', rank: 5, name: 'Cardano', symbol: 'ADA',
    price: 0.4567, change1h: 0.67, change24h: 3.45, change7d: -2.30,
    marketCap: 16000000000, volume24h: 520000000,
    rsi: { '4h': 55, '12h': 51, '24h': 48 },
    ma10: 0.45, ma20: 0.44, ma80: 0.41,
    signal: 'neutral',
    sparkline: generateSparkline(0.45, 0.008),
  },
  {
    id: 'dogecoin', rank: 6, name: 'Dogecoin', symbol: 'DOGE',
    price: 0.1234, change1h: 2.10, change24h: 12.45, change7d: 18.90,
    marketCap: 17800000000, volume24h: 2100000000,
    rsi: { '4h': 82, '12h': 79, '24h': 76 },
    ma10: 0.115, ma20: 0.108, ma80: 0.092,
    signal: 'sell',
    sparkline: generateSparkline(0.12, 0.005),
  },
  {
    id: 'avalanche', rank: 7, name: 'Avalanche', symbol: 'AVAX',
    price: 38.45, change1h: -0.89, change24h: -3.21, change7d: -8.45,
    marketCap: 14500000000, volume24h: 680000000,
    rsi: { '4h': 28, '12h': 25, '24h': 22 },
    ma10: 39.80, ma20: 41.20, ma80: 45.50,
    signal: 'buy',
    sparkline: generateSparkline(38, 1.5),
  },
  {
    id: 'chainlink', rank: 8, name: 'Chainlink', symbol: 'LINK',
    price: 14.78, change1h: 0.45, change24h: 1.23, change7d: 6.78,
    marketCap: 8900000000, volume24h: 450000000,
    rsi: { '4h': 58, '12h': 62, '24h': 60 },
    ma10: 14.50, ma20: 14.10, ma80: 12.80,
    signal: 'neutral',
    sparkline: generateSparkline(14.7, 0.4),
  },
  {
    id: 'polkadot', rank: 9, name: 'Polkadot', symbol: 'DOT',
    price: 7.23, change1h: -1.20, change24h: -4.56, change7d: -12.30,
    marketCap: 9800000000, volume24h: 320000000,
    rsi: { '4h': 22, '12h': 20, '24h': 18 },
    ma10: 7.80, ma20: 8.20, ma80: 9.50,
    signal: 'buy',
    sparkline: generateSparkline(7.2, 0.3),
  },
  {
    id: 'polygon', rank: 10, name: 'Polygon', symbol: 'MATIC',
    price: 0.8912, change1h: 0.12, change24h: 0.89, change7d: 4.56,
    marketCap: 8200000000, volume24h: 380000000,
    rsi: { '4h': 52, '12h': 50, '24h': 47 },
    ma10: 0.88, ma20: 0.86, ma80: 0.79,
    signal: 'neutral',
    sparkline: generateSparkline(0.89, 0.02),
  },
  {
    id: 'near', rank: 11, name: 'NEAR Protocol', symbol: 'NEAR',
    price: 6.45, change1h: 3.20, change24h: 15.67, change7d: 22.30,
    marketCap: 7100000000, volume24h: 890000000,
    rsi: { '4h': 85, '12h': 82, '24h': 78 },
    ma10: 5.80, ma20: 5.40, ma80: 4.50,
    signal: 'sell',
    sparkline: generateSparkline(6.4, 0.3),
  },
  {
    id: 'injective', rank: 12, name: 'Injective', symbol: 'INJ',
    price: 24.56, change1h: -2.30, change24h: -7.89, change7d: -15.40,
    marketCap: 2300000000, volume24h: 210000000,
    rsi: { '4h': 18, '12h': 22, '24h': 25 },
    ma10: 26.80, ma20: 28.50, ma80: 32.00,
    signal: 'buy',
    sparkline: generateSparkline(24.5, 1.2),
  },
  {
    id: 'sui', rank: 13, name: 'Sui', symbol: 'SUI',
    price: 1.78, change1h: 1.89, change24h: 9.45, change7d: 28.90,
    marketCap: 5400000000, volume24h: 1500000000,
    rsi: { '4h': 88, '12h': 84, '24h': 80 },
    ma10: 1.60, ma20: 1.45, ma80: 1.10,
    signal: 'sell',
    sparkline: generateSparkline(1.75, 0.06),
  },
  {
    id: 'arbitrum', rank: 14, name: 'Arbitrum', symbol: 'ARB',
    price: 1.12, change1h: -0.45, change24h: -2.10, change7d: -5.60,
    marketCap: 3200000000, volume24h: 280000000,
    rsi: { '4h': 35, '12h': 32, '24h': 30 },
    ma10: 1.15, ma20: 1.18, ma80: 1.30,
    signal: 'buy',
    sparkline: generateSparkline(1.12, 0.04),
  },
  {
    id: 'optimism', rank: 15, name: 'Optimism', symbol: 'OP',
    price: 2.34, change1h: 0.78, change24h: 4.56, change7d: 10.20,
    marketCap: 2800000000, volume24h: 320000000,
    rsi: { '4h': 65, '12h': 68, '24h': 71 },
    ma10: 2.28, ma20: 2.20, ma80: 1.95,
    signal: 'sell',
    sparkline: generateSparkline(2.3, 0.08),
  },
];

export const formatPrice = (price: number): string => {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
};

export const formatMarketCap = (cap: number): string => {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2).replace('.', ',')} Tri`;
  if (cap >= 1e9)  return `$${(cap / 1e9).toFixed(2).replace('.', ',')} Bi`;
  if (cap >= 1e6)  return `$${(cap / 1e6).toFixed(2).replace('.', ',')} Mi`;
  return `$${cap.toLocaleString('pt-BR')}`;
};

export const formatVolume = formatMarketCap;

export const getRsiColor = (rsi: number): string => {
  if (rsi >= 70) return 'text-destructive';
  if (rsi <= 30) return 'text-primary';
  return 'text-muted-foreground';
};

export const getRsiBg = (rsi: number): string => {
  if (rsi >= 70) return 'bg-destructive/10 text-destructive';
  if (rsi <= 30) return 'bg-primary/10 text-primary';
  return 'bg-muted text-muted-foreground';
};

export const getSignalConfig = (signal: 'buy' | 'sell' | 'neutral') => {
  switch (signal) {
    case 'buy': return { label: 'COMPRA', className: 'bg-primary/15 text-primary border-primary/30' };
    case 'sell': return { label: 'VENDA', className: 'bg-destructive/15 text-destructive border-destructive/30' };
    default: return { label: 'NEUTRO', className: 'bg-muted text-muted-foreground border-border' };
  }
};
