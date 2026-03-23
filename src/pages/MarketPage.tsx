import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LiveCoinTable } from "@/components/dashboard/LiveCoinTable";
import { RsiFilterPanel } from "@/components/dashboard/RsiFilterPanel";
import { useMarkets, calculateRSI } from "@/lib/api/coingecko";
import { TimeFrame } from "@/data/mockCoins";

export default function MarketPage() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const [rsiRange, setRsiRange] = useState({ min: 0, max: 100 });
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>("4h");

  const filtered = useMemo(() => {
    if (!markets) return [];
    return markets.filter((c) => {
      const rsi = calculateRSI(c.sparkline_in_7d?.price || []);
      return rsi >= rsiRange.min && rsi <= rsiRange.max;
    });
  }, [markets, rsiRange]);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-glow">Mercado</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Top 100 moedas com filtros de RSI e sinais em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside>
            <RsiFilterPanel
              onFilter={({ min, max }) => setRsiRange({ min, max })}
              activeTimeframe={activeTimeframe}
            />
          </aside>
          <div>
            <LiveCoinTable
              coins={filtered}
              title={`${filtered.length} moedas encontradas`}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
