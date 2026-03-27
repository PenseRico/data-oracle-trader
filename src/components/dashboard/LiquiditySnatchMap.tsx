import { useGlobalLiquidations, LiquidationOrder } from "@/lib/api/liquidation";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Info, Maximize2, RefreshCw } from "lucide-react";

interface Props {
  symbol?: string;
  height?: number;
}

export function LiquiditySnatchMap({ symbol = "BTCUSDT", height = 350 }: Props) {
  const allLiquidations = useGlobalLiquidations(1000);
  const [timeframe, setTimeframe] = useState("24h");
  
  // Model 3 Aesthetic: Temporal Density Matrix
  // We'll create a grid: 20 Price Buckets x 24 Time Buckets (1h each)
  const heatmapMatrix = useMemo(() => {
    const filtered = allLiquidations.filter(l => l.symbol.includes(symbol.replace("USDT", "")));
    if (filtered.length === 0) return [];

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Find price range in the last 1000 orders
    const prices = filtered.map(l => l.price);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const priceStep = (maxPrice - minPrice) / 20;

    // Initialize 20x24 Matrix
    const matrix: { price: number; time: number; intensity: number; side: string }[][] = [];
    for (let p = 0; p < 20; p++) {
      matrix[p] = [];
      for (let t = 0; t < 24; t++) {
        matrix[p][t] = { 
          price: maxPrice - (p * priceStep), 
          time: t, 
          intensity: 0,
          side: "NEUTRAL"
        };
      }
    }

    // Populate Matrix
    filtered.forEach(l => {
      const timeOffset = Math.floor((now - l.time) / (oneDay / 24));
      const priceIdx = Math.floor((maxPrice - l.price) / priceStep);
      
      if (timeOffset >= 0 && timeOffset < 24 && priceIdx >= 0 && priceIdx < 20) {
        matrix[priceIdx][23 - timeOffset].intensity += l.usdValue;
        matrix[priceIdx][23 - timeOffset].side = l.side;
      }
    });

    return matrix;
  }, [allLiquidations, symbol]);

  const maxIntensity = useMemo(() => {
    let max = 1;
    heatmapMatrix.forEach(row => row.forEach(cell => {
      if (cell.intensity > max) max = cell.intensity;
    }));
    return max;
  }, [heatmapMatrix]);

  // Color Mapping: Purple (Low) -> Cyan (Medium) -> Yellow (High)
  const getHeatColor = (intensity: number, side: string) => {
    if (intensity === 0) return "rgba(255, 255, 255, 0.02)";
    const ratio = intensity / maxIntensity;
    
    if (side === "SELL") { // Longs Liquidation (Support)
        if (ratio > 0.7) return "#fbbf24"; // Yellow (Critical)
        if (ratio > 0.3) return "#ec4899"; // Pink/Purple (High)
        return "#6366f1"; // Blue/Indigo (Medium)
    } else { // Shorts Liquidation (Resistance)
        if (ratio > 0.7) return "#fbbf24"; // Yellow (Critical)
        if (ratio > 0.3) return "#22d3ee"; // Cyan (High)
        return "#0891b2"; // Teal (Medium)
    }
  };

  if (heatmapMatrix.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center gap-4 border-white/5 bg-black/40" style={{ height }}>
         <RefreshCw className="h-6 w-6 text-primary animate-spin" />
         <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Iniciando Varredura Temporal V3...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 rounded-xl border-white/[0.04] bg-black/60 shadow-2xl relative group overflow-hidden" style={{ height }}>
      {/* Background Aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-1 relative z-10">
        <div>
           <div className="flex items-center gap-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic">Model 3 Heatmap</h3>
              <Badge variant="outline" className="text-[8px] h-4 px-1 rounded-sm border-primary/20 bg-primary/5 text-primary">INSTITUTIONAL</Badge>
           </div>
           <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">Price vs Time Intensity Matrix</p>
        </div>
        <div className="flex gap-1">
           <button className="p-1 hover:bg-white/5 rounded"><Maximize2 className="h-3 w-3 text-muted-foreground" /></button>
        </div>
      </div>

      {/* The Grid Visualization */}
      <div className="flex h-[calc(100%-60px)] gap-1 relative z-10">
        {/* Y-Axis (Price) */}
        <div className="flex flex-col justify-between py-1 text-[8px] font-mono text-muted-foreground/60 w-12 border-r border-white/5">
           {heatmapMatrix.filter((_, i) => i % 5 === 0).map((row, i) => (
             <span key={i}>${(row[0].price/1000).toFixed(1)}k</span>
           ))}
        </div>

        {/* Heat Grid */}
        <div className="flex-1 grid grid-cols-24 gap-[1px] p-1 bg-white/[0.01]">
          {heatmapMatrix.map((row, rIdx) => 
            row.map((cell, cIdx) => (
              <div 
                key={`${rIdx}-${cIdx}`}
                className="rounded-[1px] transition-all duration-500 hover:scale-125 hover:z-20 cursor-crosshair border-[0.5px] border-black/20"
                style={{ 
                  backgroundColor: getHeatColor(cell.intensity, cell.side),
                  opacity: cell.intensity === 0 ? 0.3 : 1,
                  boxShadow: cell.intensity > maxIntensity * 0.5 ? `0 0 10px ${getHeatColor(cell.intensity, cell.side)}` : 'none'
                }}
                title={`Price: $${cell.price.toFixed(2)} | Vol: $${(cell.intensity/1000).toFixed(1)}K`}
              />
            ))
          )}
        </div>
      </div>

      {/* Legend & Info */}
      <div className="mt-3 flex items-center justify-between text-[8px] font-mono relative z-10 border-t border-white/5 pt-2">
        <div className="flex gap-4">
           <div className="flex items-center gap-1.5 font-bold"><div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" /> <span>SHORTS HEAT</span></div>
           <div className="flex items-center gap-1.5 font-bold"><div className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_5px_#ec4899]" /> <span>LONGS HEAT</span></div>
           <div className="flex items-center gap-1.5 font-bold"><div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#fbbf24]" /> <span>CRITICAL DENSITY</span></div>
        </div>
        <div className="flex items-center gap-1 text-primary/60 italic font-bold">
           <Info className="h-2.5 w-2.5" />
           EXTRACT: PAREDES DE LIQUIDEZ DETECTADAS
        </div>
      </div>
    </div>
  );
}
