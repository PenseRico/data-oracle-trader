import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { computeTrend } from "@/lib/trend";

/** Badge compacto de tendência (ALTA/BAIXA/LATERAL) calculado do sparkline. */
export function TrendBadge({ prices }: { prices?: number[] }) {
  const t = computeTrend(prices);
  if (!t) return <span className="text-muted-foreground/40 text-[10px] font-mono">—</span>;
  const map = {
    ALTA: { cls: "text-emerald-300 bg-emerald-500/15 border-emerald-500/20", Icon: TrendingUp },
    BAIXA: { cls: "text-rose-300 bg-rose-500/15 border-rose-500/20", Icon: TrendingDown },
    LATERAL: { cls: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", Icon: Minus },
  }[t.dir];
  const { Icon } = map;
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${map.cls}`}>
      <Icon className="h-3 w-3" /> {t.dir}
    </span>
  );
}
