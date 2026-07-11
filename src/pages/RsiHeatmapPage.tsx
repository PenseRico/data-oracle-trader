import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RsiHeatmap } from "@/components/dashboard/RsiHeatmap";
import { useMarkets } from "@/lib/api/coingecko";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Filter, Zap } from "lucide-react";

export default function RsiHeatmapPage() {
  const { data: markets } = useMarkets(1, 100);

  const heatmapSymbols = useMemo(() => {
    if (!markets) return [];
    return Array.from(new Set(
      markets
        .slice(0, 50) // Analyze top 50
        .map(m => m.symbol?.toUpperCase())
        .filter(s => s && s.trim() !== "")
    )).map(s => `${s}USDT`); // Append USDT for Binance
  }, [markets]);

  return (
    <DashboardLayout fullHeight>
      <div className="flex flex-col h-full bg-background min-h-[calc(100vh-64px)] pb-20">
        
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-black/40 px-6 py-5 shrink-0 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 opacity-5">
             <Zap className="h-64 w-64 text-cyan-500" />
          </div>
          
          <div className="relative z-10 space-y-1">
            <h1 className="font-display font-black text-2xl text-glow tracking-tighter uppercase italic flex items-center gap-3">
              Heatmap Institucional <span className="text-primary text-xl">RSI</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
               Motor de Exaustão • Múltiplos Timeframes
            </p>
          </div>
          
          <div className="relative z-10 flex gap-3">
             <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary py-1.5 px-3 uppercase tracking-widest font-black text-[9px] shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                STREAMING ATIVO
             </Badge>
          </div>
        </div>

        {/* Global Stats Grid (Contextual Help) */}
        <div className="p-4 border-b border-white/5 bg-zinc-950/50">
           <div className="glass-card p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
               <Filter className="h-5 w-5 text-primary shrink-0 mt-0.5" />
               <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">Engenharia de Exaustão de Tendência</h4>
                  <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-mono">
                     Este painel mapeia o índice de Força Relativa através das camadas de tempo (5m até 1D). 
                     Cores em ciano brilhante representam super-venda extrema (potencial fundo de capitulação institucional). 
                     Cores em vermelho rádio alertam para euforia e alto risco de topo/despejo institucional. Procure por mercados alinhados verticalmente (Ex: Ciano em todas as colunas de um mesmo ativo denota o Setup Master Buy).
                  </p>
               </div>
            </div>
        </div>

        {/* Main RSI Grid */}
        <div className="flex-1 p-6 w-full lg:w-[800px] xl:w-[1000px] max-w-full">
           <RsiHeatmap symbols={heatmapSymbols} />
        </div>

      </div>
    </DashboardLayout>
  );
}
