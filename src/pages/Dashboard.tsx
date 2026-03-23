import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MarketStats } from "@/components/dashboard/MarketStats";
import { CoinTable } from "@/components/dashboard/CoinTable";
import { mockCoins } from "@/data/mockCoins";

export default function Dashboard() {
  const buyOpportunities = mockCoins.filter(c => c.signal === 'buy');
  const sellSignals = mockCoins.filter(c => c.signal === 'sell');

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div>
          <h1 className="font-display font-bold text-2xl text-glow">Visão Geral do Mercado</h1>
          <p className="text-sm text-muted-foreground mt-1">Dados em tempo real do mercado cripto</p>
        </div>

        <MarketStats />

        {/* Buy opportunities */}
        {buyOpportunities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Oportunidades de Compra — RSI Sobrevendido
              </span>
            </div>
            <CoinTable coins={buyOpportunities} />
          </div>
        )}

        {/* Sell signals */}
        {sellSignals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
                Sinais de Venda — RSI Sobrecomprado
              </span>
            </div>
            <CoinTable coins={sellSignals} />
          </div>
        )}

        <CoinTable coins={mockCoins} title="Todas as Moedas" />
      </div>
    </DashboardLayout>
  );
}
