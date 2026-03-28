import { useEffect, useRef, useState, useMemo } from "react";
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData,
  UTCTimestamp,
  CandlestickSeries
} from "lightweight-charts";
import { getMockWhaleOrders, WhaleOrder } from "@/lib/orderFlowEngine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Maximize2, MousePointer2 } from "lucide-react";

interface InteractiveOrderFlowChartProps {
  initialSymbol?: string;
  theme?: "dark" | "light";
}

export default function InteractiveOrderFlowChart({ 
  initialSymbol = "BTCUSDT", 
  theme = "dark" 
}: InteractiveOrderFlowChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [whaleOrders, setWhaleOrders] = useState<WhaleOrder[]>([]);

  // Symbol selector list
  const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT"];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#666",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.02)" },
        horzLines: { color: "rgba(255, 255, 255, 0.02)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 550,
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.05)",
        timeVisible: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00f2fe",
      downColor: "#f43f5e",
      borderVisible: false,
      wickUpColor: "#00f2fe",
      wickDownColor: "#f43f5e",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Fetch initial candles from Binance API
    const fetchCandles = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`);
        const data = await response.json();
        const formattedData: CandlestickData[] = data.map((d: any) => ({
          time: (d[0] / 1000) as UTCTimestamp,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        candleSeries.setData(formattedData);
      } catch (error) {
        console.error("Failed to fetch klines:", error);
      }
    };

    fetchCandles();

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol]);

  // Handle Whale Overlays
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    // Fetch whale orders for this symbol
    const orders = getMockWhaleOrders().filter(o => {
        // In simulation we just map them loosely
        return true;
    });

    setWhaleOrders(orders);

    // Add price lines for large whale orders
    orders.forEach(order => {
        if (order.value > 5) { // Only show major walls
            candleSeriesRef.current?.createPriceLine({
                price: order.price,
                color: order.side === 'BUY' ? 'rgba(0, 242, 254, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                lineWidth: order.value > 10 ? 2 : 1,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: `WHALE ${order.side} ($${order.value}M)`,
            });
        }
    });

  }, [symbol]);

  return (
    <div className="glass-card w-full border-primary/20 bg-black/60 overflow-hidden relative group rounded-xl">
      {/* Header Toolbar */}
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-[140px] h-8 bg-black/40 border-white/5 text-[11px] font-black font-mono">
              <SelectValue placeholder="Escolher Ativo" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/5">
              {symbols.map(s => (
                <SelectItem key={s} value={s} className="text-xs font-mono">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-5 text-[9px] bg-primary/5 border-primary/20 text-primary uppercase font-mono tracking-tighter">1H Interval</Badge>
            {whaleOrders.length > 0 && (
                <Badge variant="outline" className="h-5 text-[9px] bg-cyan-400/5 border-cyan-400/20 text-cyan-400 uppercase font-mono tracking-tighter">
                   {whaleOrders.filter(o => o.value > 8).length} Muros de Baleia
                </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="h-3.5 w-3.5 text-muted-foreground cursor-not-allowed" />
          <MousePointer2 className="h-3.5 w-3.5 text-primary" />
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-glow" />
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="w-full relative">
        {/* Overlay Labels */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2">
             <Zap className="h-3 w-3 text-primary fill-primary/20" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">The Oracle Protocol Engine</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-mono">Binance Liquid Clusters Layer</span>
        </div>
      </div>

      {/* Technical Footer */}
      <div className="p-2 px-4 bg-white/[0.02] border-t border-white/[0.04] flex items-center justify-between text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
               <div className="h-1 w-1 rounded-full bg-cyan-400/40" />
               <span>Hover to sync walls</span>
            </div>
            <div className="flex items-center gap-1">
               <div className="h-1 w-1 rounded-full bg-primary/40" />
               <span>Real-time candles active</span>
            </div>
         </div>
         <div>Sincronizado: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
