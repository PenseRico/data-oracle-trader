import { EnrichedCoin, getClassColor } from "@/lib/signalEngine";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SignalHeatmapProps {
  coins: EnrichedCoin[];
}

function getHeatColor(score: number): string {
  if (score >= 8) return "bg-primary/40 border-primary/50";
  if (score >= 5) return "bg-yellow-400/25 border-yellow-400/40";
  if (score >= 3) return "bg-muted/40 border-border/50";
  if (score >= 1) return "bg-orange-400/25 border-orange-400/40";
  return "bg-destructive/30 border-destructive/50";
}

export function SignalHeatmap({ coins }: SignalHeatmapProps) {
  const navigate = useNavigate();

  const sorted = [...coins].sort((a, b) => b.market_cap - a.market_cap);

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-sm text-muted-foreground">Heatmap de Sinais</h3>
      <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
        {sorted.slice(0, 40).map((coin) => (
          <Tooltip key={coin.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate(`/dashboard/coin/${coin.id}`)}
                className={`rounded-lg border p-2 flex flex-col items-center gap-1 transition-all hover:scale-105 ${getHeatColor(coin.signal.total)}`}
              >
                <img src={coin.image} alt={coin.name} className="h-5 w-5 rounded-full" />
                <span className="text-[9px] font-medium truncate w-full text-center">{coin.symbol.toUpperCase()}</span>
                <span className={`text-[10px] font-mono font-bold ${getClassColor(coin.signal.classification)}`}>
                  {coin.signal.total}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-semibold">{coin.name}</p>
              <p>{coin.signal.emoji} {coin.signal.label} (Score: {coin.signal.total})</p>
              <p className="text-muted-foreground">RSI: {Math.round(coin.rsi)} | MA: {coin.ma10 > coin.ma20 ? "Bull" : "Bear"}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1"><div className="h-2 w-4 rounded bg-primary/40" /> Compra Forte</div>
        <div className="flex items-center gap-1"><div className="h-2 w-4 rounded bg-yellow-400/25" /> Compra</div>
        <div className="flex items-center gap-1"><div className="h-2 w-4 rounded bg-muted/40" /> Neutro</div>
        <div className="flex items-center gap-1"><div className="h-2 w-4 rounded bg-orange-400/25" /> Venda</div>
        <div className="flex items-center gap-1"><div className="h-2 w-4 rounded bg-destructive/30" /> Venda Forte</div>
      </div>
    </div>
  );
}
