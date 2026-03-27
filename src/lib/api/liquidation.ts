import { useState, useEffect, useRef } from "react";

const BINANCE_FUTURES_WS = "wss://fstream.binance.com/ws";
const BINANCE_FUTURES_REST = "https://fapi.binance.com/fapi/v1";

export interface LiquidationOrder {
  symbol: string;
  side: "BUY" | "SELL"; // BUY for Short liquidation, SELL for Long liquidation
  price: number;
  quantity: number;
  time: number;
  usdValue: number;
}

// Global hook to monitor ALL binance futures liquidations in real-time
export function useGlobalLiquidations(limit = 100) {
  const [liquidations, setLiquidations] = useState<LiquidationOrder[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initial fetch to get the historical data immediately
    fetchRecentLiquidations().then(recent => {
      setLiquidations(recent.slice(0, limit));
    });

    const ws = new WebSocket(`${BINANCE_FUTURES_WS}/!forceOrder@arr`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (Array.isArray(data)) {
        const batch: LiquidationOrder[] = data.map((d: any) => ({
          symbol: d.o.s,
          side: d.o.S,
          price: parseFloat(d.o.p),
          quantity: parseFloat(d.o.q),
          time: d.o.T,
          usdValue: parseFloat(d.o.p) * parseFloat(d.o.q)
        }));

        setLiquidations((prev) => {
          const combined = [...batch, ...prev];
          return combined.slice(0, limit);
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [limit]);

  return liquidations;
}

// Function to fetch recent liquidation history (past 7 days) via REST
export async function fetchRecentLiquidations(symbol?: string): Promise<LiquidationOrder[]> {
  const url = `${BINANCE_FUTURES_REST}/allForceOrders${symbol ? `?symbol=${symbol}` : ""}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => ({
      symbol: d.symbol,
      side: d.side,
      price: parseFloat(d.price),
      quantity: parseFloat(d.origQty),
      time: d.time,
      usdValue: parseFloat(d.price) * parseFloat(d.origQty)
    })).sort((a: any, b: any) => b.time - a.time);
  } catch (e) {
    return [];
  }
}

// Strategy helper to group liquidations by price buckets
export function getLiquidationClusters(orders: LiquidationOrder[], bucketSizePercent = 0.01) {
  const clusters: Record<string, { totalUsd: number; count: number; side: "BUY" | "SELL" }> = {};
  
  orders.forEach(order => {
    const bucket = Math.floor(order.price / (order.price * bucketSizePercent));
    const key = `${order.symbol}-${bucket}-${order.side}`;
    
    if (!clusters[key]) {
      clusters[key] = { totalUsd: 0, count: 0, side: order.side };
    }
    clusters[key].totalUsd += order.usdValue;
    clusters[key].count += 1;
  });

  return clusters;
}
