import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LiveCoinTable } from "@/components/dashboard/LiveCoinTable";
import { useMarkets, calculateRSI } from "@/lib/api/coingecko";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function BuySignals() {
  const { data: markets, isLoading } = useMarkets(1, 100);

  const buyCoins = useMemo(() => {
    if (!markets) return [];
    return markets.filter((c) => {
      const rsi = calculateRSI(c.sparkline_in_7d?.price || []);
      return rsi <= 30;
    });
  }, [markets]);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Oportunidades de Compra</h1>
            <p className="text-sm text-muted-foreground">Moedas com RSI ≤ 30 — possível reversão de alta</p>
          </div>
        </div>
        <LiveCoinTable coins={buyCoins} title={`${buyCoins.length} oportunidades`} isLoading={isLoading} />
        {!isLoading && buyCoins.length === 0 && (
          <div className="glass-card rounded-lg p-8 text-center text-muted-foreground">
            Nenhuma moeda com RSI ≤ 30 no momento. O mercado está em zona neutra ou sobrecomprada.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
