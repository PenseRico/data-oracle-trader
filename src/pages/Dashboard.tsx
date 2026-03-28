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
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

  const handleCoinSelect = (symbol: string) => {
    navigate(`/dashboard/analysis/${symbol}USDT`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-[1600px] mx-auto pb-20 px-4 md:px-6 animate-fade-in">
        {/* Header Pulse */}
        <MarketPulse />

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            <div className="space-y-8">
              {/* Context Hero */}
              <DailyOracleInsight 
                signalsCount={enriched.filter(c => c.signal.total >= 5).length}
                marketSentiment={fearGreedValue || 50}
                topSignal={enriched[0] ? {
                  symbol: enriched[0].symbol,
                  score: enriched[0].signal.total,
                  confluence: enriched[0].signal.confluence
                } : undefined}
              />
              
              {/* Critical Stats */}
              <div className="glass-card rounded-xl p-4 border-primary/10">
                <MarketStats />
              </div>

              {/* High Intensity Radar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-1">
                    <Zap className="h-4 w-4 text-primary fill-primary/20 animate-pulse" />
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Radar de Captura (Snatch)</h2>
                  </div>
                </div>
                <SnatchAlertList onSelect={handleCoinSelect} />
              </div>

              {/* Signals Grid */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Confluência de Elite</h3>
                </div>
                <SignalEngineTable
                  coins={enriched.filter(c => c.signal.confluence === "High" || c.signal.isGoldenZone).slice(0, 8)}
                  title=""
                  isLoading={isLoading}
                  onSelect={handleCoinSelect}
                />
              </div>
            </div>

            {/* Side Intelligence */}
            <aside className="space-y-8">
               <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1 text-primary">
                    <Target className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest italic">Monitoramento Whale</span>
                  </div>
                  <div className="glass-card p-4 border-primary/20">
                     <WhaleOrderTable />
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1 text-muted-foreground/60">
                    <Activity className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">RSI Momentum</span>
                  </div>
                  <RsiHeatmap symbols={heatmapSymbols} />
               </div>

               <NewsPanel />
            </aside>
          </div>
        )}

        {/* Signals Tab (Full List) */}
        {activeTab === "signals" && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2 px-1">
              <List className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest italic">Análise Estratégica Completa</h3>
            </div>
            <SignalEngineTable
              coins={enriched}
              title=""
              isLoading={isLoading}
              onSelect={handleCoinSelect}
            />
          </div>
        )}

        {/* RSI Tab */}
        {activeTab === "rsi" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-2 px-1">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest italic">Heatmap RSI Detalhado</h3>
            </div>
            <RsiHeatmap symbols={heatmapSymbols} />
            <div className="glass-card p-6 border-primary/20 bg-black/40 text-[11px] text-muted-foreground leading-relaxed">
               <p className="italic uppercase tracking-widest text-primary/60 mb-2">Protocolo de Exaustão Master</p>
               Este heatmap monitora a exaustão estatística. Valores abaixo de 10 indicam "Zonas de Ouro" de compra institucional, enquanto valores acima de 85 marcam a iminente realização de lucros das baleias.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
