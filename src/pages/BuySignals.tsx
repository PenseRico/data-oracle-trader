import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { enrichCoins } from "@/lib/signalEngine";
import { TrendingUp, Target, Zap, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export default function BuySignals() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const { data: fg } = useFearGreed();
  const fgVal = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const buyCoins = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fgVal).filter((c) => c.signal.total >= 5).sort((a, b) => b.signal.total - a.signal.total);
  }, [markets, fgVal]);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-fade-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl text-glow tracking-tighter uppercase italic">
              Opportunity <span className="text-primary">Radar</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
               <TrendingUp className="h-3 w-3 text-primary/60" />
               Scanning for High Confluence Buys • Score ≥ 5 Active
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary py-1 px-3">CONFLUENCE MODE</Badge>
             <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground py-1 px-3 uppercase tracking-widest text-[9px]">{buyCoins.length} Signals Detected</Badge>
          </div>
        </div>

        {/* Intelligence Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card p-5 rounded-xl border-primary/20 bg-primary/5 flex items-start gap-4">
              <Zap className="h-5 w-5 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-primary tracking-widest">Entry Logic</div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">Ativos com Score ≥ 5 apresentam cruzamento de RSI Oversold com volume de compra crescente.</p>
              </div>
           </div>
           <div className="glass-card p-5 rounded-xl border-white/5 bg-white/[0.02] flex items-start gap-4">
              <Target className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-foreground tracking-widest">Magnet Confluence</div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">Verifique se o ativo está próximo a uma zona amarela no Liquidity Magnet antes de entrar.</p>
              </div>
           </div>
           <div className="glass-card p-5 rounded-xl border-white/5 bg-white/[0.02] flex items-start gap-4">
              <ShieldCheck className="h-5 w-5 text-green-500/60 shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-foreground tracking-widest">Risk Management</div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">Mantenha stop loss abaixo da mínima do candle de 4h para proteção de capital.</p>
              </div>
           </div>
        </div>

        {/* Signals Table Area */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <Zap className="h-4 w-4 text-primary" />
             <h3 className="text-xs font-bold uppercase tracking-[0.3em] italic">High Probability Buy Signals</h3>
          </div>
          <div className="glass-card rounded-xl overflow-hidden border-white/5 bg-black/40">
            <SignalEngineTable coins={buyCoins} title="" isLoading={isLoading} />
            {!isLoading && buyCoins.length === 0 && (
              <div className="p-12 text-center text-muted-foreground border-t border-white/5 italic text-sm">
                Aguardando confluência de sinais... varredura em andamento.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
