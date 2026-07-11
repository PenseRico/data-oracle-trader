import { useGlobalLiquidations, LiquidationOrder } from "@/lib/api/liquidation";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Target, AlertCircle } from "lucide-react";
import { useMemo } from "react";

interface SnatchAlertListProps {
  onSelect?: (symbol: string) => void;
}

export function SnatchAlertList({ onSelect }: SnatchAlertListProps) {
  const liquidations = useGlobalLiquidations(200);

  const topSnaps = useMemo(() => {
    // Group by symbol and Side to find the most "impactful" recent events
    const summary: Record<string, { totalUsd: number; side: string; count: number }> = {};
    
    liquidations.forEach(l => {
      const key = `${l.symbol}-${l.side}`;
      if (!summary[key]) summary[key] = { totalUsd: 0, side: l.side, count: 0 };
      summary[key].totalUsd += l.usdValue;
      summary[key].count += 1;
    });

    return Object.entries(summary)
      .map(([key, val]) => ({ symbol: key.split("-")[0], ...val }))
      .sort((a, b) => b.totalUsd - a.totalUsd)
      .slice(0, 3);
  }, [liquidations]);

  if (topSnaps.length === 0) {
    return (
      <div className="glass-card p-5 border-white/5 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-amber-400/70 shrink-0 mt-0.5" />
        <div className="text-[11px] text-muted-foreground/80 font-mono leading-relaxed">
          Aguardando liquidações ao vivo da Binance Futures — o radar preenche assim que grandes
          posições alavancadas são liquidadas. Se ficar permanentemente vazio, a Binance pode estar
          bloqueada na sua rede/região (o stream <code>fstream.binance.com</code> precisa estar acessível).
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {topSnaps.map((snap, i) => (
        <div 
          key={i} 
          className="glass-card p-5 rounded-xl border-primary/20 bg-black/60 shadow-[0_4px_20px_rgba(235,94,40,0.1)] relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer"
          onClick={() => onSelect?.(snap.symbol)}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Zap className={`h-12 w-12 ${snap.side === "SELL" ? "text-red-500" : "text-cyan-400"}`} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className={`text-[10px] font-bold tracking-widest bg-primary/5 ${snap.side === "SELL" ? "text-red-400 border-red-500/20" : "text-cyan-400 border-cyan-500/20"}`}>
               {snap.side === "SELL" ? "LIMIT LONGS LIQUIDATED" : "LIMIT SHORTS LIQUIDATED"}
            </Badge>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-glow" />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-display font-black text-2xl tracking-tighter uppercase italic text-glow">
                {snap.symbol} <span className="text-primary">ORACLE GOLD</span>
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                 Sinal de Reversão de Liquidez
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-white/5 border border-white/5">
                <div className="text-[8px] text-muted-foreground uppercase">Volume Limpo</div>
                <div className="text-xs font-mono font-bold">${(snap.totalUsd / 1000).toFixed(1)}K</div>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/5">
                <div className="text-[8px] text-muted-foreground uppercase">Confirmação</div>
                <div className="text-xs font-mono font-bold">{snap.count}x Ordens</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
               <TrendingUp className="h-4 w-4 text-primary" />
               <div className="text-[10px] font-bold text-primary uppercase">
                 INFO PRONTA: {snap.side === "SELL" ? "Fundo Magnético atingido. DCA de Compra Liberado." : "Topo de Squeeze. Take Profit Recompensado."}
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
