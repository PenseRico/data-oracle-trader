import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";
import { EnrichedCoin } from "@/lib/signalEngine";

interface ScoreSummaryCardsProps {
  coins: EnrichedCoin[];
}

export function ScoreSummaryCards({ coins }: ScoreSummaryCardsProps) {
  const strongBuys = coins.filter((c) => c.signal.classification === "strong_buy").length;
  const buys = coins.filter((c) => c.signal.classification === "buy").length;
  const sells = coins.filter((c) => c.signal.classification === "sell" || c.signal.classification === "strong_sell").length;
  const avgScore = coins.length > 0 ? (coins.reduce((a, c) => a + c.signal.total, 0) / coins.length).toFixed(1) : "0";

  const cards = [
    { label: "Compra Forte", value: strongBuys, icon: TrendingUp, accent: "text-primary", bg: "bg-primary/10" },
    { label: "Oportunidades", value: buys, icon: BarChart3, accent: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Sinais de Venda", value: sells, icon: TrendingDown, accent: "text-destructive", bg: "bg-destructive/10" },
    { label: "Score Médio", value: avgScore, icon: Activity, accent: "text-muted-foreground", bg: "bg-muted/30" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="glass-card rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{c.label}</span>
            <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center`}>
              <c.icon className={`h-4 w-4 ${c.accent}`} />
            </div>
          </div>
          <div className={`font-display font-bold text-2xl ${c.accent}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
