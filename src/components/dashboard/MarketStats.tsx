import { DollarSign, Activity, TrendingDown, TrendingUp, Gauge } from "lucide-react";
import { useGlobalData, useFearGreed } from "@/lib/api/coingecko";
import { formatMarketCap } from "@/data/mockCoins";

export function MarketStats() {
  const { data: global, isLoading: gLoading } = useGlobalData();
  const { data: fg, isLoading: fgLoading } = useFearGreed();

  const fgValue = fg?.data?.[0]?.value || "—";
  const fgLabel = fg?.data?.[0]?.value_classification || "—";
  const fgNum = parseInt(fgValue);
  const fgPositive = fgNum > 50;

  const stats = [
    {
      label: "Market Cap Total",
      value: gLoading ? "..." : formatMarketCap(global?.data?.total_market_cap?.usd || 0),
      change: gLoading
        ? ""
        : `${(global?.data?.market_cap_change_percentage_24h_usd ?? 0) >= 0 ? "+" : ""}${(global?.data?.market_cap_change_percentage_24h_usd ?? 0).toFixed(1)}%`,
      positive: (global?.data?.market_cap_change_percentage_24h_usd ?? 0) >= 0,
      icon: DollarSign,
    },
    {
      label: "Volume 24h",
      value: gLoading ? "..." : formatMarketCap(global?.data?.total_volume?.usd || 0),
      change: "",
      positive: true,
      icon: Activity,
    },
    {
      label: "BTC Dominância",
      value: gLoading ? "..." : `${(global?.data?.market_cap_percentage?.btc ?? 0).toFixed(1)}%`,
      change: "",
      positive: true,
      icon: TrendingUp,
    },
    {
      label: "Fear & Greed",
      value: fgLoading ? "..." : fgValue,
      change: fgLoading ? "" : fgLabel,
      positive: fgPositive,
      icon: Gauge,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <stat.icon className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <div className="font-display font-bold text-xl">{stat.value}</div>
          {stat.change && (
            <span className={`text-xs font-mono ${stat.positive ? "text-primary" : "text-destructive"}`}>
              {stat.change}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
