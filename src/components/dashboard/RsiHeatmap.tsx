import { useRsiHeatmapData, Timeframe } from "@/lib/api/binance";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RsiHeatmapProps {
  symbols: string[];
}

export function RsiHeatmap({ symbols }: RsiHeatmapProps) {
  const { data: heatmap, isLoading } = useRsiHeatmapData(symbols);
  const timeframes: Timeframe[] = ["1d", "12h", "4h", "1h"];

  const getRsiColor = (rsi: number) => {
    if (rsi < 10) return "bg-cyan-500 text-black font-bold animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.6)]";
    if (rsi < 20) return "bg-cyan-900/80 text-cyan-200";
    if (rsi < 30) return "bg-cyan-950/40 text-cyan-400";
    if (rsi > 85) return "bg-red-500 text-black font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]";
    if (rsi > 80) return "bg-red-900/80 text-red-200";
    if (rsi > 70) return "bg-red-950/40 text-red-400";
    return "bg-secondary/40 text-muted-foreground";
  };

  const getRsiLabel = (rsi: number) => {
    if (rsi < 10) return "EXTREME OVERSOLD";
    if (rsi < 30) return "OVERSOLD";
    if (rsi > 85) return "EXTREME OVERBOUGHT";
    if (rsi > 70) return "OVERBOUGHT";
    return "NEUTRAL";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-muted/20" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 40 }).map((_, i) => (
            <Skeleton key={i} className="h-10 bg-muted/10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-xl space-y-4 border-primary/20 bg-black/40 backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-primary rounded-full" />
          <h2 className="font-display font-bold text-lg text-glow tracking-tight uppercase">RSI Heatmap Pro</h2>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Buy Zone {"<"} 10</Badge>
          <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">Sell Zone {">"} 85</Badge>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-[10px] text-muted-foreground text-left p-1 font-mono">ASSET</th>
              {timeframes.map(tf => (
                <th key={tf} className="text-[10px] text-muted-foreground text-center p-1 font-mono uppercase">{tf}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.filter(s => heatmap?.[s] && Object.keys(heatmap[s]).length > 0).map(symbol => (
              <tr key={symbol} className="group hover:bg-white/5 transition-colors rounded-lg overflow-hidden">
                <td className="p-1">
                  <span className="text-xs font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                    {symbol.split("USDT")[0]}
                  </span>
                </td>
                {timeframes.map(tf => {
                  const val = heatmap?.[symbol]?.[tf];
                  const displayVal = val !== undefined ? Math.round(val) : "-";
                  
                  return (
                    <td className="p-0.5" key={`${symbol}-${tf}`}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`
                              h-8 flex items-center justify-center rounded-sm text-[11px] font-mono transition-all duration-300
                              ${val !== undefined ? getRsiColor(val) : "bg-muted/5"}
                              ${val !== undefined && (val < 10 || val > 85) ? "scale-105" : ""}
                            `}>
                              {displayVal}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background/95 border-primary/20 backdrop-blur-md">
                            <p className="text-xs font-mono">
                              {symbol} {tf} RSI: <span className="font-bold text-primary">{val?.toFixed(2) || "-"}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase">{val !== undefined ? getRsiLabel(val) : ""}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
