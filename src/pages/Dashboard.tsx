import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MarketStats } from "@/components/dashboard/MarketStats";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { RsiHeatmap } from "@/components/dashboard/RsiHeatmap";
import { ScoreSummaryCards } from "@/components/dashboard/ScoreSummaryCards";
import { AIOraAgent } from "@/components/dashboard/AIOraAgent";
import { NewsPanel } from "@/components/dashboard/NewsPanel";
import { TrendingCoins } from "@/components/dashboard/TrendingCoins";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { enrichCoins } from "@/lib/signalEngine";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { data: markets, isLoading } = useMarkets(1, 50);
  const { data: fg } = useFearGreed();
  const [activeTab, setActiveTab ] = useState("overview");

  const fearGreedValue = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const enriched = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fearGreedValue);
  }, [markets, fearGreedValue]);

  const heatmapSymbols = useMemo(() => {
    if (!markets) return [];
    return markets.slice(0, 15).map(m => m.symbol.toUpperCase());
  }, [markets]);

  const selectedCoinForAI = enriched[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl text-glow tracking-tighter uppercase italic">
              Oracle <span className="text-primary">Command</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
               <span className="h-1 w-1 bg-primary rounded-full animate-pulse" />
               Live Market Intelligence • High Frequency Analysis
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-black/40 border border-white/5 p-1 h-10">
              <TabsTrigger value="overview" className="gap-2 text-[10px] uppercase font-bold tracking-widest">
                <LayoutGrid className="h-3 w-3" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="signals" className="gap-2 text-[10px] uppercase font-bold tracking-widest">
                <List className="h-3 w-3" /> Sinais Detalhados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <MarketStats />
        <ScoreSummaryCards coins={enriched} />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            {activeTab === "overview" ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RsiHeatmap symbols={heatmapSymbols} />
                  {selectedCoinForAI && (
                    <AIOraAgent 
                      coinId={selectedCoinForAI.id}
                      symbol={selectedCoinForAI.symbol}
                      price={selectedCoinForAI.current_price}
                      indicators={selectedCoinForAI.indicators}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Moedas em Destaque (Confluência High)</h3>
                  </div>
                  <SignalEngineTable
                    coins={enriched.filter(c => c.signal.confluence === "High" || c.signal.isGoldenZone).slice(0, 10)}
                    title=""
                    isLoading={isLoading}
                  />
                </div>
              </>
            ) : (
              <SignalEngineTable
                coins={enriched}
                title="Sinais Estratégicos — Multi-Fatorial"
                isLoading={isLoading}
              />
            )}
          </div>

          <aside className="space-y-6">
            <TrendingCoins />
            <NewsPanel />
            
            <div className="glass-card p-4 rounded-xl border-white/5 bg-primary/5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Setup "10-85" Activo</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                O motor está rastreando exaustão extrema de RSI. Moedas abaixo de 10 são marcadas com "Golden Zone" para compras rápidas.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
