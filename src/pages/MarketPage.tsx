import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CoinTable } from "@/components/dashboard/CoinTable";
import { RsiFilterPanel } from "@/components/dashboard/RsiFilterPanel";
import { mockCoins, TimeFrame, CoinData } from "@/data/mockCoins";

export default function MarketPage() {
  const [filtered, setFiltered] = useState<CoinData[]>(mockCoins);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('4h');

  const handleFilter = ({ timeframe, min, max }: { timeframe: TimeFrame; min: number; max: number }) => {
    setActiveTimeframe(timeframe);
    setFiltered(
      mockCoins.filter((c) => {
        const rsi = c.rsi[timeframe];
        return rsi >= min && rsi <= max;
      })
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-glow">Mercado</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Filtre por RSI, médias móveis e sinais de compra/venda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-4">
            <RsiFilterPanel onFilter={handleFilter} activeTimeframe={activeTimeframe} />
          </aside>
          <div>
            <CoinTable
              coins={filtered}
              title={`${filtered.length} moedas encontradas`}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
