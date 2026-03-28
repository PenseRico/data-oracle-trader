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
import { MarketPulse } from "@/components/dashboard/MarketPulse";
import { DailyOracleInsight } from "@/components/dashboard/DailyOracleInsight";
import { WhaleOrderTable } from "@/components/dashboard/WhaleOrderTable";
import InteractiveOrderFlowChart from "@/components/dashboard/InteractiveOrderFlowChart";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { useRsiHeatmapData, useDerivativeData } from "@/lib/api/binance";
import { enrichCoins } from "@/lib/signalEngine";
import { useMemo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Sparkles, Coins, Zap, Target, Activity, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  initialTab?: "overview" | "signals";
}

export default function Dashboard({ initialTab = "overview" }: DashboardProps) {
  const { data: markets, isLoading } = useMarkets(1, 50);
  const { data: fg } = useFearGreed();
  const [activeTab, setActiveTab ] = useState<"overview" | "signals" | "rsi">(initialTab === "signals" ? "signals" : "overview");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTCUSDT");

  // Sync state with prop in case of navigation
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fearGreedValue = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const heatmapSymbols = useMemo(() => {
    if (!markets) return [];
    const syms = markets
      .slice(0, 20)
      .map(m => m.symbol?.toUpperCase())
      .filter(s => s && s.trim() !== "");
    
    return Array.from(new Set(syms)).slice(0, 15);
  }, [markets]);

  const { data: multiRsiData } = useRsiHeatmapData(heatmapSymbols);
  const { data: derivativeData } = useDerivativeData(heatmapSymbols);

  const enriched = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fearGreedValue, multiRsiData, derivativeData);
  }, [markets, fearGreedValue, multiRsiData, derivativeData]);

  const selectedCoinForAI = enriched[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-20 px-4 md:px-6">
        {/* Step 1: Market Pulse Header (High Intensity) */}
        <div className="flex flex-col gap-4">
          <MarketPulse />
          <div className="glass-card rounded-xl p-2 border-primary/10">
            <MarketStats />
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="flex flex-col gap-6 animate-fade-up">
            {/* Step 2: Hero Section (Context & Sniper Alert) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
              <DailyOracleInsight 
                signalsCount={enriched.filter(c => c.signal.total >= 5).length}
                marketSentiment={fearGreedValue || 50}
                topSignal={enriched[0] ? {
                  symbol: enriched[0].symbol,
                  score: enriched[0].signal.total,
                  confluence: enriched[0].signal.confluence
                } : undefined}
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                     <Zap className="h-4 w-4 text-primary fill-primary/20 animate-pulse" />
                     <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Alertas Snatch</h2>
                  </div>
                  <Badge variant="outline" className="text-[8px] bg-primary/5 border-primary/20 text-primary uppercase">Live</Badge>
                </div>
                <SnatchAlertList />
              </div>
            </div>

            {/* Step 3: COMMAND CENTER (Central Focus V8.2) */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
              {/* Left Column: Interactive Technical Station */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <LineChart className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Estação de Análise de Fluxo — {selectedSymbol}</span>
                  </div>
                  <InteractiveOrderFlowChart initialSymbol={selectedSymbol} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 px-1">
                        <Activity className="h-4 w-4 text-primary/60" />
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Vetor de Momentum (Heatmap RSI)</span>
                     </div>
                     <div className="overflow-x-auto pb-2 scrollbar-hide">
                        <RsiHeatmap symbols={heatmapSymbols} />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 px-1">
                        <Target className="h-4 w-4 text-primary/60" />
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Clusters de Liquidez (Snatch)</span>
                     </div>
                     <div className="overflow-x-auto pb-2 scrollbar-hide">
                        <LiquiditySnatchMap />
                     </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sidebar Intelligence (Whale & AI Agent) */}
              <aside className="space-y-6">
                <div className="space-y-3">
                   <div className="flex items-center gap-2 px-1">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Rastro de Baleias (Whale Stats)</span>
                   </div>
                   <div className="glass-card p-4 bg-sidebar-accent/30">
                      <WhaleOrderTable />
                   </div>
                </div>

                {selectedCoinForAI && (
                  <AIOraAgent 
                    coinId={selectedCoinForAI.id}
                    symbol={selectedCoinForAI.symbol}
                    price={selectedCoinForAI.current_price}
                    indicators={selectedCoinForAI.indicators}
                  />
                )}
                
                <NewsPanel />
              </aside>
            </div>

            {/* Step 4: Final Signal Feed (Bottom Deck) */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 px-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Confluência de Elite Instucional</h3>
              </div>
              <SignalEngineTable
                coins={enriched.filter(c => c.signal.confluence === "High" || c.signal.isGoldenZone).slice(0, 10)}
                title=""
                isLoading={isLoading}
                onSelect={(s) => setSelectedSymbol(`${s}USDT`)}
              />
            </div>
          </div>
        )}

        {/* Other Tabs content logic (signals/rsi) follows the same clean structure */}
        {activeTab === "signals" && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest italic">Análise Estratégica de Elite</h3>
              </div>
            </div>
            <SignalEngineTable
              coins={enriched}
              title=""
              isLoading={isLoading}
              onSelect={(s) => setSelectedSymbol(`${s}USDT`)}
            />
          </div>
        )}

        {activeTab === "rsi" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-2 px-1 focus:outline-none">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Heatmap Pro Detalhado</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <RsiHeatmap symbols={heatmapSymbols} />
              <div className="glass-card p-6 border-primary/20 rounded-xl bg-black/40">
                 <div className="text-[10px] text-primary font-black uppercase tracking-widest mb-4">Metodologia RSI Master</div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-muted-foreground">
                    <div className="space-y-2 border-l border-white/5 pl-4">
                       <div className="text-cyan-400 font-bold uppercase tracking-tighter">Golden Area ({"<"} 10)</div>
                       <p>Ponto de reversão estatística de altíssima probabilidade.</p>
                    </div>
                    <div className="space-y-2 border-l border-white/5 pl-4">
                       <div className="text-foreground font-bold uppercase tracking-tighter">Neutral (30-70)</div>
                       <p>Equilíbrio entre compradores e vendedores. Ideal para rompimentos.</p>
                    </div>
                    <div className="space-y-2 border-l border-white/5 pl-4">
                       <div className="text-red-400 font-bold uppercase tracking-tighter">Exhaustion ({">"} 85)</div>
                       <p>Exaustão compradora iminente. Risco de queda brusca.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
