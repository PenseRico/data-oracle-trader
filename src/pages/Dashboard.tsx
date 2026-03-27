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
import { useMemo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Sparkles, Coins, Zap, Target, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  initialTab?: "overview" | "signals";
}

export default function Dashboard({ initialTab = "overview" }: DashboardProps) {
  const { data: markets, isLoading } = useMarkets(1, 50);
  const { data: fg } = useFearGreed();
  const [activeTab, setActiveTab ] = useState<"overview" | "signals" | "rsi">(initialTab);

  // Sync state with prop in case of navigation
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fearGreedValue = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const enriched = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fearGreedValue);
  }, [markets, fearGreedValue]);

  const heatmapSymbols = useMemo(() => {
    if (!markets) return [];
    const syms = markets
      .slice(0, 20) // Get more to account for potential binance mismatches
      .map(m => m.symbol?.toUpperCase())
      .filter(s => s && s.trim() !== "");
    
    // Deduplicate
    return Array.from(new Set(syms)).slice(0, 15);
  }, [markets]);

  const selectedCoinForAI = enriched[0];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-[1600px] mx-auto pb-20 px-4 md:px-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Zap className="h-5 w-5 text-primary fill-primary/20 animate-pulse" />
                   <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Oracle Snatch Intelligence</h2>
                </div>
                <Badge variant="outline" className="text-[9px] bg-primary/5 border-primary/20 text-primary">REAL-TIME MONITOR ACTIVE</Badge>
              </div>
              <SnatchAlertList />
            </div>
          </div>
        )}

        <div className="glass-card rounded-xl p-4 border-primary/10">
          <MarketStats />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-6">
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 px-1">
                        <Activity className="h-4 w-4 text-primary/60" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Momentum Vector (RSI Heatmap)</span>
                     </div>
                     <RsiHeatmap symbols={heatmapSymbols} />
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 px-1">
                        <Target className="h-4 w-4 text-primary/60" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Liquidity Snatch Clusters</span>
                     </div>
                     <LiquiditySnatchMap />
                  </div>
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
                  <div className="flex items-center gap-2 px-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Ativos em Confluência Crítica</h3>
                  </div>
                  <SignalEngineTable
                    coins={enriched.filter(c => c.signal.confluence === "High" || c.signal.isGoldenZone).slice(0, 10)}
                    title=""
                    isLoading={isLoading}
                  />
                </div>
              </>
            )}

            {activeTab === "signals" && (
              <div className="space-y-4 animate-fade-up">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest italic">Análise Estratégica Completa</h3>
                  </div>
                </div>
                <SignalEngineTable
                  coins={enriched}
                  title=""
                  isLoading={isLoading}
                />
              </div>
            )}

            {activeTab === "rsi" && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex items-center gap-2 px-1">
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
                           <p>Ponto de reversão estatística de altíssima probabilidade. O preço atingiu exaustão máxima vendedora.</p>
                        </div>
                        <div className="space-y-2 border-l border-white/5 pl-4">
                           <div className="text-foreground font-bold uppercase tracking-tighter">Neutral (30-70)</div>
                           <p>Equilíbrio entre compradores e vendedores. Ideal para aguardar o rompimento de canais.</p>
                        </div>
                        <div className="space-y-2 border-l border-white/5 pl-4">
                           <div className="text-red-400 font-bold uppercase tracking-tighter">Exhaustion ({">"} 85)</div>
                           <p>Exaustão compradora iminente. Risco de queda brusca por realização de lucros institucional.</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Insight Column */}
          <aside className="space-y-6">
            <TrendingCoins />
            <NewsPanel />
            
            <div className="glass-card p-5 rounded-xl border-primary/30 bg-primary/5 shadow-glow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                 <Target className="h-16 w-16" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-glow" />
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Master Intelligence V3</div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                O Core "The Oracle Protocol" está integrando agora o **Mapa de Calor Temporal**. Busque as "Zonas Magnéticas" onde a liquidez massiva encontra o RSI inferior a 10 para entradas de altíssima precisão.
              </p>
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                 <span className="text-[9px] uppercase font-mono text-muted-foreground/60 tracking-widest">Protocolo: ATIVO</span>
                 <Badge variant="outline" className="text-[8px] border-green-500/20 text-green-400 bg-green-500/5 uppercase">High-Density Mode</Badge>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
