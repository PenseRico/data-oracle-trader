import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MarketStats } from "@/components/dashboard/MarketStats";
import { LiveCoinTable } from "@/components/dashboard/LiveCoinTable";
import { NewsPanel } from "@/components/dashboard/NewsPanel";
import { TrendingCoins } from "@/components/dashboard/TrendingCoins";
import { useMarkets, calculateRSI } from "@/lib/api/coingecko";
import { useMemo } from "react";

export default function Dashboard() {
  const { data: markets, isLoading } = useMarkets(1, 50);

  const { buyOpportunities, sellSignals } = useMemo(() => {
    if (!markets) return { buyOpportunities: [], sellSignals: [] };
    return {
      buyOpportunities: markets.filter((c) => {
        const rsi = calculateRSI(c.sparkline_in_7d?.price || []);
        return rsi <= 30;
      }),
      sellSignals: markets.filter((c) => {
        const rsi = calculateRSI(c.sparkline_in_7d?.price || []);
        return rsi >= 70;
      }),
    };
  }, [markets]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div>
          <h1 className="font-display font-bold text-2xl text-glow">Visão Geral do Mercado</h1>
          <p className="text-sm text-muted-foreground mt-1">Dados em tempo real via CoinGecko API</p>
        </div>

        <MarketStats />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            {buyOpportunities.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Oportunidades de Compra — RSI ≤ 30
                  </span>
                </div>
                <LiveCoinTable coins={buyOpportunities} />
              </div>
            )}

            {sellSignals.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
                    Sinais de Venda — RSI ≥ 70
                  </span>
                </div>
                <LiveCoinTable coins={sellSignals} />
              </div>
            )}

            <LiveCoinTable
              coins={markets || []}
              title="Top 50 Moedas"
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
