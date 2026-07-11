import { useRsiHeatmapData, Timeframe } from "@/lib/api/binance";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, ThermometerSun } from "lucide-react";
import { InfoHint } from "./InfoHint";

interface RsiHeatmapProps {
  symbols: string[];
}

export function RsiHeatmap({ symbols }: RsiHeatmapProps) {
  const { data: heatmap, isLoading } = useRsiHeatmapData(symbols);
  
  // Array of timeframes matching the order we fetched
  const timeframes: Timeframe[] = ["1d", "4h", "1h", "15m", "5m"];

  const getRsiStyle = (rsi: number) => {
    // Coinglass style: red for overbought (high), cyan/green for oversold (low).
    // Extreme values glow.
    if (rsi < 10) return "bg-[#06b6d4] text-black font-black shadow-[0_0_12px_rgba(6,182,212,0.8)] border border-[#06b6d4]";
    if (rsi < 25) return "bg-[#0891b2] text-white font-bold border border-[#06b6d4]/50";
    if (rsi < 35) return "bg-[#164e63] text-[#67e8f9] border border-[#0891b2]/30";
    if (rsi > 90) return "bg-[#ef4444] text-black font-black shadow-[0_0_12px_rgba(239,68,68,0.8)] border border-[#ef4444]";
    if (rsi > 75) return "bg-[#b91c1c] text-white font-bold border border-[#ef4444]/50";
    if (rsi > 65) return "bg-[#7f1d1d] text-[#fca5a5] border border-[#b91c1c]/30";
    
    // Neutral mid-zone
    return "bg-[#18181b] text-muted-foreground border border-white/5";
  };

  const getRsiLabel = (rsi: number) => {
    if (rsi < 10) return "EXTREME OVERSOLD";
    if (rsi < 25) return "OVERSOLD";
    if (rsi > 90) return "EXTREME OVERBOUGHT";
    if (rsi > 75) return "OVERBOUGHT";
    return "NEUTRAL";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 bg-muted/20" />
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <Skeleton key={i} className="h-8 bg-muted/10 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-fade-in relative">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ThermometerSun className="h-4 w-4 text-primary" />
          <h2 className="font-display font-black text-sm text-glow tracking-tight uppercase flex items-center gap-1.5">
            RSI Heatmap <span className="text-primary italic">Pro</span>
            <InfoHint id="rsi" />
          </h2>
        </div>
        
        {/* Heatmap Legend */}
        <div className="hidden md:flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest font-mono">
           <div className="px-2 py-0.5 rounded-sm bg-[#06b6d4] text-black shadow-[0_0_5px_rgba(6,182,212,0.5)]">{"< 10"}</div>
           <div className="px-2 py-0.5 rounded-sm bg-[#0891b2] text-white">{"< 25"}</div>
           <div className="px-2 py-0.5 rounded-sm bg-[#164e63] text-[#67e8f9]">{"< 35"}</div>
           <div className="px-2 py-0.5 rounded-sm bg-[#18181b] text-muted-foreground border border-white/5">35 - 65</div>
           <div className="px-2 py-0.5 rounded-sm bg-[#7f1d1d] text-[#fca5a5]">{"> 65"}</div>
           <div className="px-2 py-0.5 rounded-sm bg-[#b91c1c] text-white">{"> 75"}</div>
           <div className="px-2 py-0.5 rounded-sm bg-[#ef4444] text-black shadow-[0_0_5px_rgba(239,68,68,0.5)]">{"> 90"}</div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2">
        <table className="w-full border-separate border-spacing-y-1 border-spacing-x-1">
          <thead>
            <tr>
              <th className="text-[10px] text-muted-foreground text-left p-2 font-mono font-bold">ATIVO</th>
              {timeframes.map(tf => (
                <th key={tf} className="text-[10px] text-muted-foreground text-center p-2 font-mono font-bold uppercase w-[80px]">
                  {tf}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map(symbol => {
              const dataExists = heatmap?.[symbol] && Object.keys(heatmap[symbol]).length > 0;
              if (!dataExists) return null;
              
              const baseName = symbol.replace("USDT", "");
              
              return (
                <tr key={symbol} className="group transition-colors">
                  <td className="p-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-black/40 border border-white/5 rounded-md min-w-[80px]">
                      <span className="text-xs font-black tracking-widest text-foreground group-hover:text-primary transition-colors">
                        {baseName}
                      </span>
                    </div>
                  </td>
                  
                  {timeframes.map(tf => {
                    const val = heatmap?.[symbol]?.[tf];
                    const hasVal = val !== undefined && val !== null;
                    const displayVal = hasVal ? Math.round(val) : "-";
                    
                    return (
                      <td className="p-0.5" key={`${symbol}-${tf}`}>
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`
                                h-8 w-full flex items-center justify-center rounded-sm text-[11px] font-mono transition-all duration-300 cursor-crosshair
                                ${hasVal ? getRsiStyle(val) : "bg-muted/5 border border-white/5"}
                                ${hasVal && (val < 15 || val > 85) ? "scale-105 z-10 relative" : ""}
                              `}>
                                {displayVal}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-zinc-950 border-primary/20 backdrop-blur-md px-3 py-2">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                  {baseName} • {tf}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Activity className="h-3 w-3 text-primary" />
                                  <span className="text-sm font-black text-white">RSI: {hasVal ? val.toFixed(1) : "N/A"}</span>
                                </div>
                                {hasVal && (
                                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${val < 30 ? "text-cyan-400" : val > 70 ? "text-rose-500" : "text-muted-foreground"}`}>
                                    {getRsiLabel(val)}
                                  </span>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
