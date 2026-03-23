import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LiveCoinTable } from "@/components/dashboard/LiveCoinTable";
import { useMarkets, calculateRSI } from "@/lib/api/coingecko";
import { TrendingDown } from "lucide-react";
import { useMemo } from "react";

export default function SellSignals() {
  const { data: markets, isLoading } = useMarkets(1, 100);

  const sellCoins = useMemo(() => {
    if (!markets) return [];
    return markets.filter((c) => {
      const rsi = calculateRSI(c.sparkline_in_7d?.price || []);
      return rsi >= 70;
    });
  }, [markets]);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/15 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">Sinais de Venda</h1>
            <p className="text-sm text-muted-foreground">Moedas com RSI ≥ 70 — possível correção</p>
          </div>
        </div>
        <LiveCoinTable coins={sellCoins} title={`${sellCoins.length} moedas sobrecompradas`} isLoading={isLoading} />
        {!isLoading && sellCoins.length === 0 && (
          <div className="glass-card rounded-lg p-8 text-center text-muted-foreground">
            Nenhuma moeda com RSI ≥ 70 no momento. O mercado está em zona neutra ou sobrevendida.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
