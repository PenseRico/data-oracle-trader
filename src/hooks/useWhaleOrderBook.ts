import { useEffect, useRef, useState } from "react";

export type WhaleSide = "BID" | "ASK";

export interface WhaleOrder {
  id: string;
  side: WhaleSide;
  price: number;
  quantity: number;
  notional: number;
  distancePct: number;
  firstSeenTs: number;
  lastSeenTs: number;
  isNew: boolean;
}

export interface WhaleSummary {
  spot: number;
  totalBidNotional: number;
  totalAskNotional: number;
  ratio: number;
  bidCount: number;
  askCount: number;
  lastUpdateTs: number;
}

const BINANCE_DEPTH = "https://api.binance.com/api/v3/depth";
const BINANCE_TICKER = "https://api.binance.com/api/v3/ticker/price";

interface FetchOpts {
  symbol: string;
  thresholdUsd: number;
  pollMs?: number;
}

interface SeenEntry {
  firstSeenTs: number;
  lastSeenTs: number;
}

export function useWhaleOrderBook({ symbol, thresholdUsd, pollMs = 4000 }: FetchOpts) {
  const [orders, setOrders] = useState<WhaleOrder[]>([]);
  const [summary, setSummary] = useState<WhaleSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Map keyed by `${side}:${price}` → first/last seen timestamps so ages persist across polls.
  const seenRef = useRef<Map<string, SeenEntry>>(new Map());

  useEffect(() => {
    let cancelled = false;
    seenRef.current = new Map();

    const tick = async () => {
      try {
        const [depthRes, tickerRes] = await Promise.all([
          fetch(`${BINANCE_DEPTH}?symbol=${symbol}&limit=5000`),
          fetch(`${BINANCE_TICKER}?symbol=${symbol}`),
        ]);
        if (!depthRes.ok || !tickerRes.ok) throw new Error(`HTTP ${depthRes.status}/${tickerRes.status}`);
        const depth = await depthRes.json();
        const ticker = await tickerRes.json();
        if (cancelled) return;

        const spot = parseFloat(ticker.price);
        const now = Date.now();
        const seen = seenRef.current;
        const stillThere = new Set<string>();

        const buildSide = (raw: [string, string][], side: WhaleSide): WhaleOrder[] =>
          raw
            .map(([priceStr, qtyStr]) => {
              const price = parseFloat(priceStr);
              const quantity = parseFloat(qtyStr);
              const notional = price * quantity;
              return { price, quantity, notional, side };
            })
            .filter((o) => o.notional >= thresholdUsd)
            .map((o) => {
              const key = `${o.side}:${o.price}`;
              stillThere.add(key);
              const prev = seen.get(key);
              const firstSeenTs = prev?.firstSeenTs ?? now;
              seen.set(key, { firstSeenTs, lastSeenTs: now });
              const distancePct = ((o.price - spot) / spot) * 100;
              return {
                id: key,
                side: o.side,
                price: o.price,
                quantity: o.quantity,
                notional: o.notional,
                distancePct,
                firstSeenTs,
                lastSeenTs: now,
                isNew: !prev,
              };
            });

        const bids = buildSide(depth.bids, "BID");
        const asks = buildSide(depth.asks, "ASK");

        // Drop entries that disappeared so the map doesn't grow forever.
        for (const k of seen.keys()) if (!stillThere.has(k)) seen.delete(k);

        const merged = [...bids, ...asks].sort((a, b) => b.notional - a.notional);

        const totalBidNotional = bids.reduce((s, o) => s + o.notional, 0);
        const totalAskNotional = asks.reduce((s, o) => s + o.notional, 0);

        setOrders(merged);
        setSummary({
          spot,
          totalBidNotional,
          totalAskNotional,
          ratio: totalAskNotional > 0 ? totalBidNotional / totalAskNotional : 0,
          bidCount: bids.length,
          askCount: asks.length,
          lastUpdateTs: now,
        });
        setError(null);
        setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "fetch error");
          setLoading(false);
        }
      }
    };

    tick();
    const id = setInterval(tick, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [symbol, thresholdUsd, pollMs]);

  return { orders, summary, error, loading };
}
