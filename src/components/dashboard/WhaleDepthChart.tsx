import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  CandlestickSeries,
  LineSeries,
  IPriceLine,
} from "lightweight-charts";
import type { WhaleOrder } from "@/hooks/useWhaleOrderBook";

export type WhaleChartInterval = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";

interface WhaleDepthChartProps {
  symbol: string;
  orders: WhaleOrder[];
  spot: number | undefined;
  height?: number;
  /** Max number of whale walls drawn per side (top N by notional). */
  maxWallsPerSide?: number;
  interval?: WhaleChartInterval;
  /** Whether to draw the rounded border + bg around the chart. Disable when nesting inside another framed container. */
  framed?: boolean;
}

export default function WhaleDepthChart({
  symbol,
  orders,
  spot,
  height = 460,
  maxWallsPerSide = 20,
  interval = "15m",
  framed = true,
}: WhaleDepthChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wallSeriesRef = useRef<ISeriesApi<"Line">[]>([]);
  const spotLineRef = useRef<IPriceLine | null>(null);

  // ── Build chart (rebuilt only when symbol/interval/height change) ──
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#888",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.02)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      width: containerRef.current.clientWidth,
      height,
      rightPriceScale: { borderColor: "rgba(255,255,255,0.05)" },
      timeScale: {
        borderColor: "rgba(255,255,255,0.05)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "#10b981", width: 1, style: 2 },
        horzLine: { color: "#10b981", width: 1, style: 2 },
      },
    });

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candle;

    let cancelled = false;
    const loadCandles = async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`,
        );
        const data = await res.json();
        if (cancelled) return;
        const candles: CandlestickData[] = data.map((d: any) => ({
          time: (d[0] / 1000) as UTCTimestamp,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        candle.setData(candles);
        chart.timeScale().fitContent();
      } catch {
        // network blip — leave empty
      }
    };
    loadCandles();
    const refreshId = setInterval(loadCandles, 30_000);

    const onResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      clearInterval(refreshId);
      window.removeEventListener("resize", onResize);
      wallSeriesRef.current = [];
      spotLineRef.current = null;
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [symbol, interval, height]);

  // ── Redraw whale walls (duration bars) when orders change ──
  useEffect(() => {
    const chart = chartRef.current;
    const candle = candleSeriesRef.current;
    if (!chart || !candle) return;

    // Wipe previous wall series
    for (const s of wallSeriesRef.current) {
      try {
        chart.removeSeries(s);
      } catch {
        // chart may have been disposed
      }
    }
    wallSeriesRef.current = [];

    // Wipe and recreate spot reference line
    if (spotLineRef.current) {
      try {
        candle.removePriceLine(spotLineRef.current);
      } catch {
        /* noop */
      }
      spotLineRef.current = null;
    }

    if (!orders.length) return;

    const bidsRaw = orders.filter((o) => o.side === "BID").slice(0, maxWallsPerSide);
    const asksRaw = orders.filter((o) => o.side === "ASK").slice(0, maxWallsPerSide);
    const bids = aggregateWalls(bidsRaw, 0.0008);
    const asks = aggregateWalls(asksRaw, 0.0008);
    const both = [...bids, ...asks];
    if (!both.length) return;

    const maxNotional = Math.max(...both.map((o) => o.notional));
    const nowSec = Math.floor(Date.now() / 1000) as UTCTimestamp;

    // Mínimo de candles que a barra ocupa, para ela "alcançar" os candles visíveis
    // mesmo quando a parede acabou de aparecer nesta sessão. ~40 candles ≈ 25% do chart (200 candles).
    const intervalSec = intervalToSeconds(interval);
    const MIN_BAR_CANDLES = 40;
    const minStartSec = (nowSec - intervalSec * MIN_BAR_CANDLES) as UTCTimestamp;

    for (const o of both) {
      const intensity = Math.min(1, o.notional / maxNotional);
      const alpha = 0.45 + intensity * 0.5;
      const color =
        o.side === "BID"
          ? `rgba(16, 185, 129, ${alpha.toFixed(2)})`
          : `rgba(244, 63, 94, ${alpha.toFixed(2)})`;
      const width = intensity > 0.65 ? 4 : intensity > 0.35 ? 3 : 2;
      const firstSec = Math.floor(o.firstSeenTs / 1000) as UTCTimestamp;
      // Use o menor entre firstSeen e o piso visual (40 candles atrás) — assim a barra sempre
      // alcança os candles, mas continua crescendo conforme a parede persiste.
      const startSec = (Math.min(firstSec, minStartSec) as UTCTimestamp);

      const lineSeries = chart.addSeries(LineSeries, {
        color,
        lineWidth: width as 1 | 2 | 3 | 4,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      lineSeries.setData([
        { time: startSec, value: o.price },
        { time: nowSec, value: o.price },
      ]);
      wallSeriesRef.current.push(lineSeries);
    }

    if (spot && Number.isFinite(spot)) {
      spotLineRef.current = candle.createPriceLine({
        price: spot,
        color: "rgba(255,255,255,0.55)",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "SPOT",
      });
    }
  }, [orders, spot, maxWallsPerSide]);

  return (
    <div
      className={`relative w-full overflow-hidden ${
        framed ? "rounded-xl border border-white/5 bg-black/40" : ""
      }`}
    >
      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3 text-[9px] uppercase tracking-widest font-mono pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-sm bg-emerald-400/80" />
          <span className="text-emerald-300/80">Bid · suporte</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-sm bg-rose-400/80" />
          <span className="text-rose-300/80">Ask · resistência</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-sm bg-white/50" />
          <span className="text-white/60">Spot</span>
        </div>
        <span className="text-muted-foreground/50">
          · barra horizontal = quanto tempo a parede está no livro
        </span>
      </div>
      <div ref={containerRef} className="w-full" style={{ height }} />
    </div>
  );
}

function intervalToSeconds(i: WhaleChartInterval): number {
  switch (i) {
    case "1m": return 60;
    case "5m": return 300;
    case "15m": return 900;
    case "30m": return 1800;
    case "1h": return 3600;
    case "4h": return 14400;
    case "1d": return 86400;
  }
}

/**
 * Junta paredes próximas em buckets — duas ordens dentro de `tolerance` (fração) viram uma só,
 * com preço médio ponderado pelo notional e notional somado.
 */
function aggregateWalls(input: WhaleOrder[], tolerance: number): WhaleOrder[] {
  if (!input.length) return [];
  const sorted = [...input].sort((a, b) => a.price - b.price);
  const buckets: WhaleOrder[] = [];

  for (const o of sorted) {
    const last = buckets[buckets.length - 1];
    if (last && Math.abs(o.price - last.price) / last.price <= tolerance) {
      const totalNotional = last.notional + o.notional;
      const blendedPrice =
        (last.price * last.notional + o.price * o.notional) / totalNotional;
      buckets[buckets.length - 1] = {
        ...last,
        price: blendedPrice,
        quantity: last.quantity + o.quantity,
        notional: totalNotional,
        firstSeenTs: Math.min(last.firstSeenTs, o.firstSeenTs),
      };
    } else {
      buckets.push(o);
    }
  }
  return buckets;
}
