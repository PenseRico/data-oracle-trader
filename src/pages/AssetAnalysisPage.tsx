import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import LiquidityHeatmapChart from "@/components/dashboard/LiquidityHeatmapChart";
import { WhaleOrderTable } from "@/components/dashboard/WhaleOrderTable";
import { AIOraAgent } from "@/components/dashboard/AIOraAgent";
import { MarketPulse } from "@/components/dashboard/MarketPulse";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Maximize2, Crosshair, BarChart3, Target, Activity } from "lucide-react";
import { useMarkets } from "@/lib/api/coingecko";
import { EnrichedCoin } from "@/lib/signalEngine";

export default function AssetAnalysisPage() {
  const { symbol = "BTCUSDT" } = useParams();
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const { data: markets } = useMarkets(1, 100);

  // Sync state with URL
  useEffect(() => {
    setSelectedSymbol(symbol);
  }, [symbol]);

  const handleSymbolChange = (newSym: string) => {
    setSelectedSymbol(newSym);
    navigate(`/dashboard/analysis/${newSym}`);
  };

  const currentCoinRaw = markets?.find(m => `${m.symbol?.toUpperCase()}USDT` === selectedSymbol);
  // Cast to EnrichedCoin because the CoinDetails/Analysis expects indicator metadata
  const currentCoin = currentCoinRaw as unknown as EnrichedCoin;

  const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT", "DOGEUSDT"];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-black/60 animate-fade-in">
        
        {/* Institutional Header (Analysis Context) */}
        <div className="p-4 border-b border-white/[0.04] bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between">
           <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-white/5"
                onClick={() => navigate("/dashboard")}
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              <div className="h-4 w-[1px] bg-white/10" />

              <div className="flex items-center gap-4">
                 <Select value={selectedSymbol} onValueChange={handleSymbolChange}>
                    <SelectTrigger className="w-[180px] h-9 bg-primary/5 border-primary/20 text-xs font-black font-mono tracking-tighter shadow-glow-sm">
                       <BarChart3 className="h-3.5 w-3.5 mr-2 text-primary" />
                       <SelectValue placeholder="Escolher Ativo" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                       {symbols.map(s => (
                          <SelectItem key={s} value={s} className="text-xs font-mono">{s}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>

                 {currentCoin && (
                    <div className="flex items-center gap-4 animate-fade-up">
                       <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Real-Time Price</span>
                          <span className="text-sm font-black text-foreground">
                             ${currentCoin.current_price.toLocaleString()}
                          </span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">24h Change</span>
                          <span className={`text-sm font-black ${currentCoin.price_change_percentage_24h_in_currency >= 0 ? 'text-cyan-400' : 'text-rose-500'}`}>
                             {currentCoin.price_change_percentage_24h_in_currency.toFixed(2)}%
                          </span>
                       </div>
                    </div>
                 )}
              </div>
           </div>

           <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-cyan-400/5 border border-cyan-400/20 flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-glow" />
                 <span className="text-[9px] font-black uppercase text-cyan-400 tracking-[0.2em]">Deep Liquidity Stream Active</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                 <Maximize2 className="h-4 w-4" />
              </Button>
           </div>
        </div>

        {/* Main Immersive Stage */}
        <div className="flex-1 flex overflow-hidden">
           
           {/* Primary Analysis Station (Full Graph) */}
           <div className="flex-1 h-full p-4 overflow-hidden flex flex-col gap-4 relative">
              <div className="flex-1 glass-card border-white/5 bg-black/20 relative overflow-hidden">
                 <LiquidityHeatmapChart symbol={selectedSymbol} height={800} />
              </div>
              
              {/* Floating Pulse (Bottom Overlay) */}
              <div className="absolute bottom-8 left-8 right-8 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
                 <div className="bg-zinc-950/80 backdrop-blur-md rounded-xl p-4 border border-white/5 pointer-events-auto shadow-2xl">
                    <MarketPulse />
                 </div>
              </div>
           </div>

           {/* Precision Sidebar (Intelligence & Order Flow) */}
           <aside className="w-[400px] h-full border-l border-white/[0.04] bg-zinc-950/20 backdrop-blur-md p-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
              
              <div className="space-y-3">
                 <div className="flex items-center gap-2 px-1 text-primary">
                    <Target className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest italic">Order Flow Deep Flow</span>
                 </div>
                 <div className="glass-card p-4 border-primary/20 bg-black/40">
                    <WhaleOrderTable />
                 </div>
              </div>

              {currentCoin && currentCoin.indicators && (
                 <AIOraAgent 
                    coinId={currentCoin.id}
                    symbol={currentCoin.symbol}
                    price={currentCoin.current_price}
                    indicators={currentCoin.indicators}
                 />
              )}

              <div className="space-y-3">
                 <div className="flex items-center gap-2 px-1 text-muted-foreground/40">
                    <Activity className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Protocol Intelligence</span>
                 </div>
                 <div className="glass-card p-4 border-white/5 text-[10px] text-muted-foreground leading-relaxed italic uppercase font-mono tracking-tighter">
                    O sistema de "Deep Liquidity" processa ordens institucionais em tempo real. Padrões de "Clusters" detectados na {selectedSymbol} sugerem movimentação iminente de baleias.
                 </div>
              </div>

           </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
