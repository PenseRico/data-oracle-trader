import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { enrichCoins } from "@/lib/signalEngine";
import { TrendingDown, Target, Zap, Waves } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export default function SellSignals() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const { data: fg } = useFearGreed();
  const fgVal = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const sellCoins = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fgVal).filter((c) => c.signal.total <= 0).sort((a, b) => a.signal.total - b.signal.total);
  }, [markets, fgVal]);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-fade-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl text-glow tracking-tighter uppercase italic">
              Exhaustion <span className="text-destructive">Radar</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
               <TrendingDown className="h-3 w-3 text-destructive/60" />
               Scanning for Overbought Extremes • TP Zones Active
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-destructive/5 border-destructive/20 text-destructive py-1 px-3 uppercase text-[8px] tracking-widest">Exhaustion Mode</Badge>
             <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground py-1 px-3 uppercase tracking-widest text-[9px]">{sellCoins.length} Targets Detected</Badge>
          </div>
        </div>

        {/* Intelligence Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card p-5 rounded-xl border-destructive/20 bg-destructive/5 flex items-start gap-4">
              <Zap className="h-5 w-5 text-destructive shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-destructive tracking-widest">Distribution Logic</div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">Ativos com Score ≤ 0 apresentam exaustão compradora e provável início de distribuição institucional.</p>
              </div>
           </div>
           <div className="glass-card p-5 rounded-xl border-white/5 bg-white/[0.02] flex items-start gap-4">
              <Target className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-foreground tracking-widest">Liquidity Flush</div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">Fique atento a "picos de calor" ciano no Liquidity Magnet — indicam liquidação de shorts e reversão iminente.</p>
              </div>
           </div>
           <div className="glass-card p-5 rounded-xl border-white/5 bg-white/[0.02] flex items-start gap-4">
              <Waves className="h-5 w-5 text-primary/60 shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-foreground tracking-widest">Profit Harvesting</div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">Este radar foca em zonas de "Take Profit" e exaustão de momentum para proteção de ganhos.</p>
              </div>
           </div>
        </div>

        {/* Signals Table Area */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <TrendingDown className="h-4 w-4 text-destructive" />
             <h3 className="text-xs font-bold uppercase tracking-[0.3em] italic">Strategic Sell & Exhaustion Zones</h3>
          </div>
          <div className="glass-card rounded-xl overflow-hidden border-white/5 bg-black/40">
            <SignalEngineTable coins={sellCoins} title="" isLoading={isLoading} />
            {!isLoading && sellCoins.length === 0 && (
              <div className="p-12 text-center text-muted-foreground border-t border-white/5 italic text-sm">
                Aguardando sinais de exaustão compradora...
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
