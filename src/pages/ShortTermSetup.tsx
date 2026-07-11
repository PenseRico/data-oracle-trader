import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { useRsiHeatmapData, useDerivativeData } from "@/lib/api/binance";
import { enrichCoins } from "@/lib/signalEngine";
import { Zap, Activity, TrendingDown, Clock, ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export default function ShortTermSetup() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const { data: fg } = useFearGreed();
  const fgVal = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  // We need multi-tf data for the short term logic (5m, 15m, etc)
  const symbols = useMemo(() => markets?.map(m => `${m.symbol.toUpperCase()}USDT`) || [], [markets]);
  const { data: multiRsiData } = useRsiHeatmapData(symbols);
  const { data: derivativeData } = useDerivativeData(symbols);

  const shortTermCoins = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fgVal, multiRsiData, derivativeData)
      .filter((c) => c.shortTerm?.isActive)
      .sort((a, b) => (b.shortTerm?.confidence || 0) - (a.shortTerm?.confidence || 0));
  }, [markets, fgVal, multiRsiData, derivativeData]);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-fade-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl text-glow tracking-tighter uppercase italic">
              Setup <span className="text-primary">Curto Prazo</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
               <Clock className="h-3.5 w-3.5 text-primary/60" />
               Intraday Scalping • MAs 10, 20, 80 • 5m/15m/1h Flow
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary py-1 px-3">SCALPING ENGINE</Badge>
             <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground py-1 px-3 uppercase tracking-widest text-[9px]">
               {shortTermCoins.length} Oportunidades
             </Badge>
          </div>
        </div>

        {/* Strategy Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
           <div className="glass-card p-5 rounded-xl border-primary/20 bg-primary/5 flex items-start gap-4">
              <Zap className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-primary tracking-widest">Lógica de Ignição</div>
                 <p className="text-xs text-muted-foreground leading-relaxed italic">
                    Busca por **Pullbacks** em tendências explosivas dentro das médias de 10 e 20 períodos, com confluência de RSI em 15m. 
                    Ideal para operações rápidas de 1h a 4h de duração.
                 </p>
              </div>
           </div>
           <div className="glass-card p-5 rounded-xl border-white/5 bg-white/[0.02] flex items-start gap-4">
              <ShieldAlert className="h-6 w-6 text-yellow-500/60 shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-foreground tracking-widest">Proteção de Capital</div>
                 <p className="text-xs text-muted-foreground leading-relaxed italic">
                    Stop loss deve ser posicionado logo abaixo da média de 80 (MA80). 
                    Se o preço perder a MA80 no intraday, o setup é invalidado.
                 </p>
              </div>
           </div>
        </div>

        {/* Signals Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <Activity className="h-4 w-4 text-primary animate-pulse" />
             <h3 className="text-xs font-bold uppercase tracking-[0.3em] italic text-white/80">Monitor de Scalp Institucional</h3>
          </div>
          <div className="glass-card rounded-xl overflow-hidden border-white/5 bg-black/40">
            <SignalEngineTable 
              coins={shortTermCoins} 
              title="" 
              isLoading={isLoading} 
              onSelect={(symbol) => window.location.href = `/dashboard/analysis/${symbol.toUpperCase()}USDT`}
            />
            {!isLoading && shortTermCoins.length === 0 && (
              <div className="p-20 text-center space-y-3 border-t border-white/5">
                <div className="text-muted-foreground italic text-sm">Aguardando gatilhos de exaustão intraday...</div>
                <div className="text-[10px] uppercase tracking-widest text-primary/40">Rastreando 50+ moedas via Binance API</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
