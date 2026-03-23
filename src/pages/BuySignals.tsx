import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CoinTable } from "@/components/dashboard/CoinTable";
import { mockCoins } from "@/data/mockCoins";
import { TrendingUp } from "lucide-react";

export default function BuySignals() {
  const buyCoins = mockCoins.filter((c) => c.signal === 'buy' || c.rsi['4h'] < 30 || c.rsi['12h'] < 30 || c.rsi['24h'] < 30);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Oportunidades de Compra</h1>
            <p className="text-sm text-muted-foreground">Moedas com RSI abaixo de 30 — possível reversão de alta</p>
          </div>
        </div>
        <CoinTable coins={buyCoins} title={`${buyCoins.length} oportunidades encontradas`} />
      </div>
    </DashboardLayout>
  );
}
