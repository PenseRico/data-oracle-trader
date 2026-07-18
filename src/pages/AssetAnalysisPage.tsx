import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/dashboard/TradingViewChart";
import { MtfRsiPanel } from "@/components/dashboard/MtfRsiPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BarChart3, Activity, Tag, Maximize2, Zap, LayoutGrid } from "lucide-react";
import { useMarkets } from "@/lib/api/coingecko";

// Formatadores à prova de nulo (a CoinGecko devolve null em vários campos → evita crash)
const fmtUsd = (n?: number | null) =>
  n == null ? "—" : n < 1 ? `$${n.toFixed(6)}` : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const fmtBig = (n?: number | null) =>
  n == null ? "—" : n >= 1e9 ? `$${(n / 1e9).toFixed(2)} Bi` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)} Mi` : `$${n.toLocaleString("en-US")}`;
const fmtPct = (n?: number | null) => (n == null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`);
const fmtNum = (n?: number | null) => (n == null ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 0 }));

export default function AssetAnalysisPage() {
  const { symbol: rawSymbol = "BTCUSDT" } = useParams();
  const navigate = useNavigate();
  // Normaliza sempre p/ MAIÚSCULO (a CoinGecko devolve símbolo minúsculo → "btcUSDT" quebrava)
  const [selectedSymbol, setSelectedSymbol] = useState(rawSymbol.toUpperCase());

  // Use a larger limit so we can find any coin
  const { data: markets } = useMarkets(1, 250);

  useEffect(() => {
    setSelectedSymbol(rawSymbol.toUpperCase());
  }, [rawSymbol]);

  const handleSymbolChange = (newSym: string) => {
    const up = newSym.toUpperCase();
    setSelectedSymbol(up);
    navigate(`/dashboard/analysis/${up}`);
  };

  const currentCoinRaw = markets?.find(
    (m) => `${m.symbol?.toUpperCase()}USDT` === selectedSymbol,
  );

  // Lista dinâmica: top moedas do mercado + sempre inclui a moeda atual (mesmo fora do top)
  const symbols = useMemo(() => {
    const fromMarkets = (markets ?? []).slice(0, 40).map((m) => `${m.symbol?.toUpperCase()}USDT`);
    return Array.from(new Set([selectedSymbol, ...fromMarkets].filter(Boolean)));
  }, [markets, selectedSymbol]);

  return (
    <DashboardLayout fullHeight>
      <div className="flex flex-col h-full bg-background min-h-[calc(100vh-64px)]">
        
        {/* ─── Premium Header ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-black/40 px-6 py-4 shrink-0 shadow-lg relative z-20">
           
           <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 bg-white/5 hover:bg-white/10 hover:text-primary transition-colors rounded-full"
                onClick={() => navigate("/dashboard")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="h-6 w-[1px] bg-white/10" />

              <Select value={selectedSymbol} onValueChange={handleSymbolChange}>
                 <SelectTrigger className="w-[180px] h-10 bg-[#0B0E14] border-white/10 hover:border-primary/50 text-sm font-black font-mono tracking-tighter">
                    <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                    <SelectValue placeholder="Ativo" />
                 </SelectTrigger>
                 <SelectContent className="bg-zinc-950 border-white/10">
                    {symbols.map(s => (
                       <SelectItem key={s} value={s} className="text-xs font-mono font-bold cursor-pointer">
                          {s}
                       </SelectItem>
                    ))}
                 </SelectContent>
              </Select>
           </div>

           {/* Market Context Stats */}
           {currentCoinRaw && (
              <div className="flex items-center gap-8 bg-white/5 border border-white/5 rounded-xl px-4 py-2">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Preço Global</span>
                    <span className="text-base font-black text-white font-mono leading-none flex items-center gap-2">
                       {fmtUsd(currentCoinRaw.current_price)}
                       <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${(currentCoinRaw.price_change_percentage_24h_in_currency ?? 0) >= 0 ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-500'}`}>
                          {fmtPct(currentCoinRaw.price_change_percentage_24h_in_currency)}
                       </span>
                    </span>
                 </div>

                 <div className="h-8 w-[1px] bg-white/10" />

                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Market Cap</span>
                    <span className="text-sm font-black text-white font-mono leading-none mt-1">
                       {fmtBig(currentCoinRaw.market_cap)}
                    </span>
                 </div>

                 <div className="h-8 w-[1px] bg-white/10" />

                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Vol (24h)</span>
                    <span className="text-sm font-black text-white font-mono leading-none mt-1">
                       {fmtBig(currentCoinRaw.total_volume)}
                    </span>
                 </div>
              </div>
           )}

           <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,242,254,0.8)]" />
                 <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Full Stream</span>
              </div>
           </div>
        </div>

        {/* ─── Deep Analysis Stage ─── */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden w-full relative z-10">
           
           {/* Left Station: TradingView Chart + MTF RSI indicator pane */}
           <div className="flex-[1.8] flex flex-col h-full bg-[#0B0E14] border-r border-white/5 relative group">
              <div className="flex-1 min-h-0">
                <TradingViewChart
                  key={selectedSymbol}
                  symbol={`BINANCE:${selectedSymbol}`}
                  theme="dark"
                  interval="60"
                  autosize
                  showDrawingToolbar={true}
                  studies={[
                    "RSI@tv-basicstudies",
                    "MACD@tv-basicstudies",
                    "Volume@tv-basicstudies"
                  ]}
                />
              </div>
              {/* Seu indicador MTF RSI, nativo, acoplado ao gráfico */}
              <MtfRsiPanel symbol={selectedSymbol} />
           </div>

           {/* Right Station: Market Flow Data */}
           <aside className="w-full xl:w-[480px] h-full bg-[#101218] overflow-y-auto custom-scrollbar flex flex-col shrink-0">
               <div className="p-5 flex flex-col gap-6">

                  {/* Livro de ordens REAL vive na página dedicada (evita o mock aqui) */}
                  <button
                    onClick={() => navigate("/dashboard/orderbook")}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-colors group"
                  >
                     <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/90">Livro de Ordens Whale · Real</span>
                     </div>
                     <span className="text-[10px] font-mono text-primary group-hover:underline">abrir ↗</span>
                  </button>

                  {/* Dados da moeda (à prova de nulo) */}
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/90">Dados da Moeda</span>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Preço atual", value: fmtUsd(currentCoinRaw?.current_price) },
                          { label: "Variação 24h", value: fmtPct(currentCoinRaw?.price_change_percentage_24h_in_currency), tone: (currentCoinRaw?.price_change_percentage_24h_in_currency ?? 0) >= 0 ? "text-primary" : "text-rose-400" },
                          { label: "Market Cap", value: fmtBig(currentCoinRaw?.market_cap) },
                          { label: "Volume 24h", value: fmtBig(currentCoinRaw?.total_volume) },
                          { label: "Máxima histórica", value: fmtUsd(currentCoinRaw?.ath) },
                          { label: "Mínima histórica", value: fmtUsd(currentCoinRaw?.atl) },
                        ].map((m) => (
                          <div key={m.label} className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex flex-col justify-center items-center gap-1 text-center">
                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{m.label}</span>
                             <span className={`text-sm font-mono font-bold ${m.tone ?? "text-white"}`}>{m.value}</span>
                          </div>
                        ))}
                     </div>
                     {!currentCoinRaw && (
                        <p className="text-[10px] text-muted-foreground/50 text-center font-mono">Dados detalhados indisponíveis para este ativo no momento.</p>
                     )}
                  </div>

                  {/* Atalho on-chain */}
                  <button
                    onClick={() => navigate("/dashboard/on-chain")}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-colors group"
                  >
                     <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/90">Dados On-Chain do Ciclo</span>
                     </div>
                     <span className="text-[10px] font-mono text-primary group-hover:underline">abrir ↗</span>
                  </button>

                  {/* Como ler esta análise (dicas simples) */}
                  <div className="glass-card p-4 rounded-xl border border-primary/20 bg-primary/5">
                     <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-4 w-4 text-primary shrink-0" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Como ler esta análise</h4>
                     </div>
                     <ul className="space-y-2 text-[11px] text-muted-foreground/85 leading-relaxed">
                        <li className="flex gap-2"><span className="text-primary">1.</span><span><b className="text-white/90">Gráfico (esquerda):</b> use RSI, MACD e Volume já ligados pra confirmar a tendência antes de decidir.</span></li>
                        <li className="flex gap-2"><span className="text-primary">2.</span><span><b className="text-white/90">RSI Multi-Timeframe (abaixo do gráfico):</b> quando vários tempos apontam sobrevenda juntos, a chance de fundo é maior.</span></li>
                        <li className="flex gap-2"><span className="text-primary">3.</span><span><b className="text-white/90">Livro de baleias:</b> grandes ordens acima/abaixo marcam onde o preço tende a reagir — bons pontos de alvo e stop.</span></li>
                        <li className="flex gap-2"><span className="text-primary">4.</span><span>Troque de moeda no seletor lá em cima pra comparar rapidinho.</span></li>
                     </ul>
                     <p className="text-[9px] text-muted-foreground/40 mt-3 pt-2 border-t border-white/5 italic">Estudo de mercado — a decisão e o risco são sempre seus.</p>
                  </div>

               </div>
           </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
