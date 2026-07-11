import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { useRsiHeatmapData, useDerivativeData } from "@/lib/api/binance";
import { enrichCoins } from "@/lib/signalEngine";
import { Zap, Globe, TrendingUp, Anchor, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export default function LongTermSetup() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const { data: fg } = useFearGreed();
  const fgVal = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const symbols = useMemo(() => markets?.map(m => `${m.symbol.toUpperCase()}USDT`) || [], [markets]);
  // Long term uses higher timeframes (1D, 4h)
  const { data: multiRsiData } = useRsiHeatmapData(symbols);
  const { data: derivativeData } = useDerivativeData(symbols);

  const longTermCoins = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fgVal, multiRsiData, derivativeData)
      .filter((c) => c.longTerm?.isActive)
      .sort((a, b) => (b.longTerm?.confidence || 0) - (a.longTerm?.confidence || 0));
  }, [markets, fgVal, multiRsiData, derivativeData]);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-fade-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl text-glow tracking-tighter uppercase italic">
              Setup <span className="text-secondary text-cyan-400">Longo Prazo</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
               <Globe className="h-3.5 w-3.5 text-cyan-500/60" />
               Position & Swing Trade • MAs 50, 100, 200 • Macro Tendency
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-cyan-500/5 border-cyan-500/20 text-cyan-400 py-1 px-3 uppercase text-[9px]">INSTITUTIONAL ACCUMULATION</Badge>
             <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground py-1 px-3 uppercase tracking-widest text-[9px]">
               {longTermCoins.length} Ativos em Alvo
             </Badge>
          </div>
        </div>

        {/* Strategy Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
           <div className="glass-card p-5 rounded-xl border-cyan-500/20 bg-cyan-500/5 flex items-start gap-4">
              <Anchor className="h-6 w-6 text-cyan-400 shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Base de Preço Institucional</div>
                 <p className="text-xs text-muted-foreground leading-relaxed italic">
                    Focado em detectar ativos que voltaram para descansar na **MA200 (Média de 200 períodos)** do Diário. 
                    Operações aqui visam semanas de duração com alvos em fractais superiores.
                 </p>
              </div>
           </div>
           <div className="glass-card p-5 rounded-xl border-white/5 bg-white/[0.02] flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-emerald-500/60 shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-foreground tracking-widest">Gestão de Swing</div>
                 <p className="text-xs text-muted-foreground leading-relaxed italic">
                    Confirmação via RSI Diário abaixo de 35 e retorno ao Golden Pocket (0.618 Fib). 
                    A paciência nesta tela é a sua maior aliada.
                 </p>
              </div>
           </div>
        </div>

        {/* Signals Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <TrendingUp className="h-4 w-4 text-cyan-400 animate-pulse" />
             <h3 className="text-xs font-bold uppercase tracking-[0.3em] italic text-white/80">Rastreio Position Macro (Global)</h3>
          </div>
          <div className="glass-card rounded-xl overflow-hidden border-white/5 bg-black/40">
            <SignalEngineTable 
              coins={longTermCoins} 
              title="" 
              isLoading={isLoading} 
              onSelect={(symbol) => window.location.href = `/dashboard/analysis/${symbol.toUpperCase()}USDT`}
            />
            {!isLoading && longTermCoins.length === 0 && (
              <div className="p-20 text-center space-y-3 border-t border-white/5">
                <div className="text-muted-foreground italic text-sm">Nenhum ativo gigante em zona de compra macro no momento...</div>
                <div className="text-[10px] uppercase tracking-widest text-cyan-500/40">Aguardando correção para médias institucionais</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
