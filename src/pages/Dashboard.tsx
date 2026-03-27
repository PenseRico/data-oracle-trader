import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MarketStats } from "@/components/dashboard/MarketStats";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { RsiHeatmap } from "@/components/dashboard/RsiHeatmap";
import { ScoreSummaryCards } from "@/components/dashboard/ScoreSummaryCards";
import { AIOraAgent } from "@/components/dashboard/AIOraAgent";
import { NewsPanel } from "@/components/dashboard/NewsPanel";
import { TrendingCoins } from "@/components/dashboard/TrendingCoins";
import { SnatchAlertList } from "@/components/dashboard/SnatchAlertList";
import { LiquiditySnatchMap } from "@/components/dashboard/LiquiditySnatchMap";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { enrichCoins } from "@/lib/signalEngine";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Sparkles, Coins, Zap, Target } from "lucide-react";

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
               High Frequency AI & Liquidity Engine • V2.5 Gold
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

        {/* Global Snatch Alerts - "THE GOLD" */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <Zap className="h-4 w-4 text-primary fill-primary/20" />
             <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Oracle Snatch Entry Alerts</h2>
          </div>
          <SnatchAlertList />
        </div>

        <MarketStats />
        
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            {activeTab === "overview" ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RsiHeatmap symbols={heatmapSymbols} />
                  <LiquiditySnatchMap />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedCoinForAI && (
                    <AIOraAgent 
                      coinId={selectedCoinForAI.id}
                      symbol={selectedCoinForAI.symbol}
                      price={selectedCoinForAI.current_price}
                      indicators={selectedCoinForAI.indicators}
                    />
                  )}
                  <ScoreSummaryCards coins={enriched} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Moedas em Destaque (Confluência Ouro)</h3>
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
            
            <div className="glass-card p-5 rounded-xl border-primary/30 bg-primary/5 shadow-glow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Operacional V2.5</div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                O motor agora cruza **Liquidez Global** com {"**RSI < 10**"}. Quando uma bolha ciano surge no mapa coincidindo com o fundo do RSI, o sinal de "Snatch" é confirmado.
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                 <span className="text-[9px] uppercase font-mono text-muted-foreground">Status: MONITORANDO...</span>
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
