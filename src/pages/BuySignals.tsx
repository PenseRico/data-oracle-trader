import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { enrichCoins } from "@/lib/signalEngine";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function BuySignals() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const { data: fg } = useFearGreed();
  const fgVal = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const buyCoins = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fgVal).filter((c) => c.signal.total >= 5).sort((a, b) => b.signal.total - a.signal.total);
  }, [markets, fgVal]);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Oportunidades de Compra</h1>
            <p className="text-sm text-muted-foreground">Moedas com Score ≥ 5 — confluência de sinais favorável</p>
          </div>
        </div>
        <SignalEngineTable coins={buyCoins} title={`${buyCoins.length} oportunidades`} isLoading={isLoading} />
        {!isLoading && buyCoins.length === 0 && (
          <div className="glass-card rounded-lg p-8 text-center text-muted-foreground">
            Nenhuma moeda com Score ≥ 5 no momento.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
