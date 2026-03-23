import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

const stats = [
  { label: "Market Cap Total", value: "$2.45T", change: "+2.3%", positive: true, icon: DollarSign },
  { label: "Volume 24h", value: "$89.2B", change: "+5.1%", positive: true, icon: Activity },
  { label: "BTC Dominância", value: "54.2%", change: "-0.3%", positive: false, icon: TrendingDown },
  { label: "Fear & Greed", value: "72", change: "Ganância", positive: true, icon: TrendingUp },
];

export function MarketStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-card rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <stat.icon className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <div className="font-display font-bold text-xl">{stat.value}</div>
          <span className={`text-xs font-mono ${stat.positive ? 'text-primary' : 'text-destructive'}`}>
            {stat.change}
          </span>
        </div>
      ))}
    </div>
  );
}
