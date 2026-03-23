import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CoinTable } from "@/components/dashboard/CoinTable";
import { mockCoins } from "@/data/mockCoins";
import { TrendingDown } from "lucide-react";

export default function SellSignals() {
  const sellCoins = mockCoins.filter((c) => c.signal === 'sell' || c.rsi['4h'] > 70 || c.rsi['12h'] > 70 || c.rsi['24h'] > 70);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/15 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">Sinais de Venda</h1>
            <p className="text-sm text-muted-foreground">Moedas com RSI acima de 70 nos timeframes 4H, 12H e 24H</p>
          </div>
        </div>
        <CoinTable coins={sellCoins} title={`${sellCoins.length} moedas sobrecompradas`} />
      </div>
    </DashboardLayout>
  );
}
