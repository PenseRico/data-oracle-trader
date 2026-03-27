import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LiveCoinTable } from "@/components/dashboard/LiveCoinTable";
import { RsiFilterPanel } from "@/components/dashboard/RsiFilterPanel";
import { useMarkets } from "@/lib/api/coingecko";
import { calculateRSI } from "@/lib/api/coingecko";
import { TimeFrame } from "@/data/mockCoins";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Filter, Globe2 } from "lucide-react";

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
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-fade-up">
        {/* Superior Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl text-glow tracking-tighter uppercase italic">
              Global <span className="text-primary">Market Matrix</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
               <Globe2 className="h-3 w-3 text-primary/60" />
               Scanning Top 100 Liquidity Pairs • RSI Layer Active
            </p>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase text-[8px] tracking-widest">{filtered.length} Ativos Conectados</Badge>
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-glow ml-2" />
          </div>
        </div>

        {/* Main Terminal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
          <aside className="space-y-6">
            <div className="flex items-center gap-2 px-1">
               <Filter className="h-4 w-4 text-primary/60" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Parametrização do Motor</span>
            </div>
            <div className="glass-card rounded-xl p-6 border-white/5 bg-white/[0.02]">
               <RsiFilterPanel
                 onFilter={({ min, max }) => setRsiRange({ min, max })}
                 activeTimeframe={activeTimeframe}
               />
            </div>

            <div className="glass-card p-5 rounded-xl border-primary/10 bg-primary/5">
                <p className="text-[10px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-3">
                   "O Market Matrix permite isolar ativos em zonas de exaustão extrema. Use o filtro RSI para buscar moedas abaixo de 10 — o ponto de maior confluência para operações de Snatch."
                </p>
            </div>
          </aside>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
               <BarChart3 className="h-4 w-4 text-primary" />
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] italic">Visual Data Stream — Top Liquidity Assets</h3>
            </div>
            <div className="glass-card rounded-xl overflow-hidden border-white/5 bg-black/40">
              <LiveCoinTable
                coins={filtered}
                title=""
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
