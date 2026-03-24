import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { enrichCoins } from "@/lib/signalEngine";
import { TrendingDown } from "lucide-react";
import { useMemo } from "react";

export default function SellSignals() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const { data: fg } = useFearGreed();
  const fgVal = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const sellCoins = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fgVal).filter((c) => c.signal.total <= 0).sort((a, b) => a.signal.total - b.signal.total);
  }, [markets, fgVal]);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/15 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">Sinais de Venda</h1>
            <p className="text-sm text-muted-foreground">Moedas com Score ≤ 0 — confluência negativa</p>
          </div>
        </div>
        <SignalEngineTable coins={sellCoins} title={`${sellCoins.length} moedas em alerta`} isLoading={isLoading} />
        {!isLoading && sellCoins.length === 0 && (
          <div className="glass-card rounded-lg p-8 text-center text-muted-foreground">
            Nenhuma moeda com Score ≤ 0 no momento.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
