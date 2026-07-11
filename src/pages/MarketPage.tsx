import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { LiveCoinTable } from "@/components/dashboard/LiveCoinTable";
import { RsiFilterPanel } from "@/components/dashboard/RsiFilterPanel";
import { useMarkets } from "@/lib/api/coingecko";
import { calculateRSI } from "@/lib/api/coingecko";
import { TimeFrame } from "@/data/mockCoins";
import { Badge } from "@/components/ui/badge";
import { Globe2, Filter } from "lucide-react";

export default function MarketPage() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const [rsiRange, setRsiRange] = useState({ min: 0, max: 100 });
  const [activeTimeframe] = useState<TimeFrame>("4h");

  const filtered = useMemo(() => {
    if (!markets) return [];
    return markets.filter((c) => {
      const rsi = calculateRSI(c.sparkline_in_7d?.price || []);
      return rsi >= rsiRange.min && rsi <= rsiRange.max;
    });
  }, [markets, rsiRange]);

  return (
    <DashboardLayout>
      <PageShell
        title={<>Market <span className="text-primary">Matrix</span></>}
        subtitle={`Top 100 ativos · filtro RSI ${rsiRange.min}–${rsiRange.max}`}
        icon={Globe2}
        accent="primary"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Market Matrix" },
        ]}
        actions={
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[9px] uppercase tracking-widest">
            {filtered.length} ativos · Live
          </Badge>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          <aside className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Filter className="h-3.5 w-3.5 text-primary/70" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Parâmetros do Motor
              </span>
            </div>
            <div className="glass-card rounded-xl p-5 border-white/5 bg-white/[0.02]">
              <RsiFilterPanel
                onFilter={({ min, max }) => setRsiRange({ min, max })}
                activeTimeframe={activeTimeframe}
              />
            </div>
            <div className="glass-card p-4 rounded-xl border-primary/10 bg-primary/5">
              <p className="text-[10px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-3">
                Use RSI &lt; 30 para identificar zonas de sobre-venda e RSI &gt; 70 para zonas de
                exaustão compradora. Cruze com volume e funding rate.
              </p>
            </div>
          </aside>

          <section className="space-y-3 min-w-0">
            <div className="glass-card rounded-xl overflow-hidden border-white/5 bg-black/40">
              <LiveCoinTable coins={filtered} title="" isLoading={isLoading} />
            </div>
          </section>
        </div>
      </PageShell>
    </DashboardLayout>
  );
}
