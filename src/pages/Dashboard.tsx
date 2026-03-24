import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MarketStats } from "@/components/dashboard/MarketStats";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { SignalHeatmap } from "@/components/dashboard/SignalHeatmap";
import { ScoreSummaryCards } from "@/components/dashboard/ScoreSummaryCards";
import { NewsPanel } from "@/components/dashboard/NewsPanel";
import { TrendingCoins } from "@/components/dashboard/TrendingCoins";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { enrichCoins } from "@/lib/signalEngine";
import { useMemo } from "react";

export default function Dashboard() {
  const { data: markets, isLoading } = useMarkets(1, 50);
  const { data: fg } = useFearGreed();

  const fearGreedValue = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const enriched = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fearGreedValue);
  }, [markets, fearGreedValue]);

  const topBuys = useMemo(() => enriched.filter((c) => c.signal.total >= 5).sort((a, b) => b.signal.total - a.signal.total), [enriched]);
  const topSells = useMemo(() => enriched.filter((c) => c.signal.total <= 0).sort((a, b) => a.signal.total - b.signal.total), [enriched]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div>
          <h1 className="font-display font-bold text-2xl text-glow">Signal Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de confluência multi-indicador — Score baseado em RSI, MAs, Volume e Sentimento
          </p>
        </div>

        <MarketStats />
        <ScoreSummaryCards coins={enriched} />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <SignalHeatmap coins={enriched} />

            {topBuys.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    🟢 Oportunidades de Compra — Score ≥ 5
                  </span>
                </div>
                <SignalEngineTable coins={topBuys} />
              </div>
            )}

            {topSells.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
                    🔴 Sinais de Venda — Score ≤ 0
                  </span>
                </div>
                <SignalEngineTable coins={topSells} />
              </div>
            )}

            <SignalEngineTable
              coins={enriched}
              title="Ranking Completo — Top 50"
              isLoading={isLoading}
            />
          </div>

          <aside className="space-y-4">
            <TrendingCoins />
            <NewsPanel />
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
