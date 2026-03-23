import { TrendingUp, Flame } from "lucide-react";
import { useTrending } from "@/lib/api/coingecko";
import { useNavigate } from "react-router-dom";

export function TrendingCoins() {
  const { data, isLoading } = useTrending();
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <Flame className="h-4 w-4 text-orange-400" />
        <h3 className="font-display font-semibold text-sm">Trending</h3>
      </div>

      <div className="divide-y divide-border/20">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
                <div className="h-6 w-6 rounded-full bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            ))
          : data?.coins?.slice(0, 7).map((coin, i) => (
              <button
                key={coin.item.id}
                onClick={() => navigate(`/dashboard/coin/${coin.item.id}`)}
                className="w-full p-3 flex items-center gap-3 hover:bg-primary/5 transition-colors text-left"
              >
                <span className="text-[10px] text-muted-foreground font-mono w-4">
                  {i + 1}
                </span>
                <img
                  src={coin.item.thumb}
                  alt={coin.item.name}
                  className="h-5 w-5 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium">{coin.item.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-1.5">
                    {coin.item.symbol.toUpperCase()}
                  </span>
                </div>
                {coin.item.data?.price_change_percentage_24h?.usd !== undefined && (
                  <span
                    className={`text-[10px] font-mono ${
                      coin.item.data.price_change_percentage_24h.usd >= 0
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    {coin.item.data.price_change_percentage_24h.usd >= 0 ? "+" : ""}
                    {coin.item.data.price_change_percentage_24h.usd.toFixed(1)}%
                  </span>
                )}
              </button>
            ))}
      </div>
    </div>
  );
}
