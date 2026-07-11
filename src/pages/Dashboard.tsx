import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MarketOverviewTerminal } from "@/components/dashboard/MarketOverviewTerminal";
import { HomeHero } from "@/components/dashboard/HomeHero";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { RsiHeatmap } from "@/components/dashboard/RsiHeatmap";
import { NewsPanel } from "@/components/dashboard/NewsPanel";
import { InfoHint } from "@/components/dashboard/InfoHint";
import { DailyOracleInsight } from "@/components/dashboard/DailyOracleInsight";
import { CoinglassWhaleBoard } from "@/components/dashboard/CoinglassWhaleBoard";
import { MacroBanner } from "@/components/dashboard/MacroBanner";
import { DailyTopSetups } from "@/components/dashboard/DailyTopSetups";
import { LiveLiquidationTicker } from "@/components/dashboard/LiveLiquidationTicker";
import { useNavigate } from "react-router-dom";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { useRsiHeatmapData, useDerivativeData } from "@/lib/api/binance";
import { enrichCoins } from "@/lib/signalEngine";
import { buildTradePlans, isStablecoin } from "@/lib/tradePlan";
import { TradePlanCard } from "@/components/dashboard/TradePlanCard";
import { useMemo, useState, useEffect } from "react";
import { List, Sparkles, Target, Activity, Crosshair } from "lucide-react";

interface DashboardProps {
  initialTab?: "overview" | "signals";
}

export default function Dashboard({ initialTab = "overview" }: DashboardProps) {
  const { data: markets, isLoading } = useMarkets(1, 50);
  const { data: fg } = useFearGreed();
  const [activeTab, setActiveTab] = useState<"overview" | "signals" | "rsi">(
    initialTab === "signals" ? "signals" : "overview"
  );
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab as "overview" | "signals" | "rsi");
  }, [initialTab]);

  const fearGreedValue = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const heatmapSymbols = useMemo(() => {
    if (!markets) return [];
    const syms = markets
      .slice(0, 20)
      .map((m) => m.symbol?.toUpperCase())
      .filter((s) => s && s.trim() !== "");
    return Array.from(new Set(syms)).slice(0, 15);
  }, [markets]);

  const { data: multiRsiData } = useRsiHeatmapData(heatmapSymbols);
  const { data: derivativeData } = useDerivativeData(heatmapSymbols);

  const enriched = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fearGreedValue, multiRsiData, derivativeData);
  }, [markets, fearGreedValue, multiRsiData, derivativeData]);

  // Melhor sinal de verdade (maior score p/ compra; menor score p/ venda em ganância) —
  // não o enriched[0] (que é só o BTC, maior market cap).
  // Exclui stablecoins das listas de sinais — "comprar USDT com alvo $1.09" não faz sentido.
  const tradeable = useMemo(() => enriched.filter((c) => !isStablecoin(c.symbol)), [enriched]);

  const topSignalCoin = useMemo(() => {
    if (!tradeable.length) return undefined;
    const sorted = [...tradeable].sort((a, b) => b.signal.total - a.signal.total);
    return fearGreedValue !== undefined && fearGreedValue >= 75 ? sorted[sorted.length - 1] : sorted[0];
  }, [tradeable, fearGreedValue]);

  const tradePlans = useMemo(() => buildTradePlans(tradeable, 4), [tradeable]);

  const handleCoinSelect = (symbol: string) => {
    navigate(`/dashboard/analysis/${symbol.toUpperCase()}USDT`);
  };

  return (
    <DashboardLayout>
      {/* Live Liquidation Ticker — full width top bar */}
      <LiveLiquidationTicker />

      <div className="space-y-5 max-w-[1500px] mx-auto pb-20 px-4 md:px-6 w-full animate-fade-in relative overflow-x-hidden">

        {/* Macro Alert Banner (only shows on extreme F&G) */}
        <MacroBanner />

        {/* ================================
            OVERVIEW TAB
        ================================ */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6 w-full">

            {/* HERO — gráfico BTC + índices visuais + principais mercados/volume (topo da primeira tela) */}
            <HomeHero />

            {/* 0. PLANOS DE TRADE PRONTOS — a entrega: compra/venda mastigados (entrada, alvo, stop) */}
            {tradePlans.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Crosshair className="h-4 w-4 text-primary animate-pulse" />
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">
                    Planos de Trade Prontos
                  </h2>
                  <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest ml-auto">
                    compra &amp; venda mastigados · entrada · alvo · stop
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {tradePlans.map((p) => (
                    <TradePlanCard key={p.symbol} plan={p} />
                  ))}
                </div>
              </div>
            )}

            {/* 1. Visão de Mercado — terminal denso (regime, macro, movers, desempenho, altseason) */}
            <MarketOverviewTerminal fearGreed={fearGreedValue} />

            {/* 2. Daily Top Setups — hero section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Target className="h-4 w-4 text-primary animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">
                  Melhores Oportunidades do Dia
                </h2>
                <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest ml-auto">
                  filtrado por scoring engine
                </span>
              </div>
              <DailyTopSetups coins={tradeable} isLoading={isLoading} />
            </div>

            {/* 3. Oracle Daily Insight  */}
            <DailyOracleInsight
              signalsCount={tradeable.filter((c) => c.signal.total >= 5).length}
              marketSentiment={fearGreedValue || 50}
              topSignal={
                topSignalCoin
                  ? {
                      symbol: topSignalCoin.symbol,
                      score: topSignalCoin.signal.total,
                      confluence: topSignalCoin.signal.confluence,
                    }
                  : undefined
              }
            />

            {/* Confluência de Elite — largura total (sem caixa de rolagem) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-[0.3em] font-display text-white italic">
                  Confluência de Elite
                </h3>
                <InfoHint id="confluencia" />
              </div>
              <SignalEngineTable
                coins={
                  tradeable.filter((c) => c.signal.confluence === "High" || c.signal.isGoldenZone).length > 0
                    ? tradeable.filter((c) => c.signal.confluence === "High" || c.signal.isGoldenZone).slice(0, 12)
                    : tradeable.slice(0, 12)
                }
                title=""
                isLoading={isLoading}
                onSelect={handleCoinSelect}
              />
            </div>

            {/* Monitoramento Whale — livro REAL (Binance Spot depth), largura total */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1 text-primary">
                <Target className="h-4 w-4" />
                <span className="text-[11px] font-black uppercase tracking-widest italic">
                  Monitoramento Whale · Livro Real (Binance)
                </span>
                <InfoHint id="whale" />
              </div>
              <CoinglassWhaleBoard />
            </div>
            <NewsPanel />
          </div>
        )}

        {/* ================================
            SIGNALS TAB
        ================================ */}
        {activeTab === "signals" && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2 px-1">
              <List className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest italic">
                Análise Estratégica Completa
              </h3>
            </div>
            <SignalEngineTable
              coins={tradeable}
              title=""
              isLoading={isLoading}
              onSelect={handleCoinSelect}
            />
          </div>
        )}

        {/* ================================
            RSI TAB
        ================================ */}
        {activeTab === "rsi" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-2 px-1">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest italic">
                Heatmap RSI Detalhado
              </h3>
            </div>
            <RsiHeatmap symbols={heatmapSymbols} />
            <div className="glass-card p-6 border-primary/20 bg-black/40 text-[11px] text-muted-foreground leading-relaxed">
              <p className="italic uppercase tracking-widest text-primary/60 mb-2">
                Protocolo de Exaustão Master
              </p>
              Este heatmap monitora a exaustão estatística. Valores abaixo de 10 indicam "Zonas de
              Ouro" de compra institucional, enquanto valores acima de 85 marcam a iminente
              realização de lucros das baleias.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
