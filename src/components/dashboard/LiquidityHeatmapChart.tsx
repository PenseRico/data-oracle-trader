import { useEffect, useRef, useState } from "react";
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData,
  UTCTimestamp,
  CandlestickSeries,
  PriceLineOptions
} from "lightweight-charts";
import { getMockWhaleOrders, WhaleOrder } from "@/lib/orderFlowEngine";
import { Badge } from "@/components/ui/badge";
import { Zap, Activity, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LiquidityHeatmapChartProps {
  symbol: string;
  height?: number;
}

export default function LiquidityHeatmapChart({ 
  symbol, 
  height = 600 
}: LiquidityHeatmapChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [whaleOrders, setWhaleOrders] = useState<WhaleOrder[]>([]);
  const [activeLiquidity, setActiveLiquidity] = useState<{ price: number, value: number } | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#666",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.02)" },
        horzLines: { color: "rgba(255, 255, 255, 0.02)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.05)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1, // Normal
        vertLine: { color: "#00f2fe", width: 1, style: 2 },
        horzLine: { color: "#00f2fe", width: 1, style: 2 },
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

    // Fetch Binance Data
    const fetchCandles = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=150`);
        const data = await response.json();
        const formattedData: CandlestickData[] = data.map((d: any) => ({
          time: (d[0] / 1000) as UTCTimestamp,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        candleSeries.setData(formattedData);
        chart.timeScale().fitContent();
      } catch (error) {
        console.error("Failed to fetch klines:", error);
      }
    };

    fetchCandles();

    // Heatmap Logic: Rendering Whale Walls as Intensity Zones
    const renderHeatmap = () => {
        const orders = getMockWhaleOrders().slice(0, 15);
        setWhaleOrders(orders);

        orders.forEach(order => {
            // Calculate opacity based on value (simulating heatmap intensity)
            const intensity = Math.min(order.value / 15, 0.6);
            const color = order.side === 'BUY' 
                ? `rgba(0, 242, 254, ${intensity})` 
                : `rgba(244, 63, 94, ${intensity})`;

            candleSeries.createPriceLine({
                price: order.price,
                color: color,
                lineWidth: order.value > 10 ? 3 : 1,
                lineStyle: 0, // Solid for heatmap feel
                axisLabelVisible: true,
                title: order.value > 10 ? `WHALE WALL $${order.value}M` : "",
            });
        });
    };

    renderHeatmap();

    // Resize
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
  }, [symbol, height]);

  return (
    <div className="relative w-full h-full bg-black/40 rounded-xl overflow-hidden border border-white/[0.04]">
      {/* Dynamic Heatmap Legend */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
         <div className="glass-card p-2 px-3 border-primary/20 backdrop-blur-md flex flex-col gap-1">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Intensidade Whale (Bids)</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Intensidade Whale (Asks)</span>
            </div>
         </div>
      </div>

      {/* Engine Label */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
         <div className="flex items-center gap-2 mb-1">
            <Zap className="h-3 w-3 text-primary fill-primary/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Oracle Heatmap V8.3</span>
         </div>
         <Badge variant="outline" className="text-[8px] bg-black/60 border-white/5 text-muted-foreground uppercase font-mono tracking-tighter">
            Liquidity Cluster Layer Active
         </Badge>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="w-full h-full" />

      {/* Footer Info */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-4 text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
         <div className="flex items-center gap-1">
            <Activity className="h-2 w-2" />
            <span>CoinGlass-Style Depth Active</span>
         </div>
         <TooltipProvider>
            <Tooltip>
               <TooltipTrigger>
                  <Info className="h-2.5 w-2.5 hover:text-primary transition-colors cursor-help" />
               </TooltipTrigger>
               <TooltipContent className="bg-zinc-950 border-white/10 text-[10px] p-3 max-w-[200px]">
                  O Heatmap exibe a densidade do livro de ordens histórico. Linhas mais sólidas e brilhantes indicam onde grandes instituições (Whales) estão defendendo o preço.
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>
      </div>
    </div>
  );
}
