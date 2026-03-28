export interface WhaleOrder {
  id: string;
  price: number;
  side: 'BUY' | 'SELL';
  value: number; // In Millions USD
  exchange: string;
  age: string;
  timestamp: number;
}

export interface WhaleMarketStats {
  totalVolume24h: string;
  buyRatio: number;
  sellRatio: number;
  whaleDominance: number;
  liquidityDepth: string;
}

const exchanges = ['Binance', 'Bybit', 'OKX', 'Coinbase', 'Bitmex'];

/**
 * Generates mock Whale Orders based on CoinGlass structure
 * Simulated institutional data for V8.1 Cockpit
 */
export function getMockWhaleOrders(): WhaleOrder[] {
  const currentPrice = 64500 + (Math.random() * 500 - 250);
  const count = 25;
  
  return Array.from({ length: count }).map((_, i) => {
    const side: 'BUY' | 'SELL' = Math.random() > 0.48 ? 'BUY' : 'SELL';
    // Whales usually place orders near round numbers
    const offset = (Math.random() * 2000) * (side === 'BUY' ? -1 : 1);
    const price = Math.round((currentPrice + offset) / 10) * 10;
    
    return {
      id: `whale-${Date.now()}-${i}`,
      price,
      side,
      value: +(Math.random() * 12 + 0.5).toFixed(2), // $0.5M to $12.5M
      exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      age: `${Math.floor(Math.random() * 59)}m ${Math.floor(Math.random() * 59)}s`,
      timestamp: Date.now() - Math.random() * 1000000
    };
  }).sort((a, b) => b.value - a.value); // VIP Whales first
}

/**
 * Returns summary market metrics for Whale activity
 */
export function getWhaleMarketStats(): WhaleMarketStats {
  return {
    totalVolume24h: (85.4 + Math.random() * 5).toFixed(1),
    buyRatio: 52,
    sellRatio: 48,
    whaleDominance: +(68 + Math.random() * 2).toFixed(1),
    liquidityDepth: (240 + Math.random() * 10).toFixed(0)
  };
}
