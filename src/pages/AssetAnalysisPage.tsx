import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/dashboard/TradingViewChart";
import { MtfRsiPanel } from "@/components/dashboard/MtfRsiPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BarChart3, Activity, Tag, Maximize2, Zap, LayoutGrid } from "lucide-react";
import { useMarkets } from "@/lib/api/coingecko";

export default function AssetAnalysisPage() {
  const { symbol: rawSymbol = "BTCUSDT" } = useParams();
  const navigate = useNavigate();
  // Normaliza sempre p/ MAIÚSCULO (a CoinGecko devolve símbolo minúsculo → "btcUSDT" quebrava)
  const [selectedSymbol, setSelectedSymbol] = useState(rawSymbol.toUpperCase());

  // Use a larger limit so we can find any coin
  const { data: markets } = useMarkets(1, 150);

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
                       ${currentCoinRaw.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                       <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${currentCoinRaw.price_change_percentage_24h_in_currency >= 0 ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-500'}`}>
                          {currentCoinRaw.price_change_percentage_24h_in_currency >= 0 ? '+' : ''}{currentCoinRaw.price_change_percentage_24h_in_currency.toFixed(2)}%
                       </span>
                    </span>
                 </div>
                 
                 <div className="h-8 w-[1px] bg-white/10" />
                 
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Market Cap</span>
                    <span className="text-sm font-black text-white font-mono leading-none mt-1">
                       ${(currentCoinRaw.market_cap / 1e9).toFixed(2)} Bi
                    </span>
                 </div>

                 <div className="h-8 w-[1px] bg-white/10" />

                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Vol (24h)</span>
                    <span className="text-sm font-black text-white font-mono leading-none mt-1">
                       ${(currentCoinRaw.total_volume / 1e9).toFixed(2)} Bi
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

                  {/* Component: Liquidity Magnet Warning */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/90">Métrica de Capital</span>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center gap-1 text-center hover:bg-white/10 transition-colors">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Highest Price (24h)</span>
                           <span className="text-sm font-mono font-bold text-white">${currentCoinRaw?.ath.toLocaleString() || "—"}</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center gap-1 text-center hover:bg-white/10 transition-colors">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lowest Price (24h)</span>
                           <span className="text-sm font-mono font-bold text-white">${currentCoinRaw?.atl.toLocaleString() || "—"}</span>
                        </div>
                     </div>
                  </div>

                  {/* Info Warning */}
                  <div className="glass-card p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                     <Zap className="h-6 w-6 text-primary shrink-0 mt-1" />
                     <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">Confluence Scanner Activo</h4>
                        <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-mono">
                           Nesta estação individual, utilize os indicadores do TradingView (lado esquerdo) para definir alvos baseados nas frentes institucionais listadas na tabela Whale Order (acima). O viés primário deve acompanhar as tendências do heatmap RSI antes de executar uma ordem.
                        </p>
                     </div>
                  </div>

               </div>
           </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
