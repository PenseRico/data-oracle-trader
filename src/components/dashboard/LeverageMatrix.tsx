import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  ShieldCheck, 
  Skull, 
  TrendingUp, 
  TrendingDown,
  Info,
  Activity,
  Zap
} from "lucide-react";

interface LeverageMatrixProps {
  initialMargin: number;
  entryPrice: number;
}

const LEVERAGES = [1, 5, 10, 20, 50, 100];
const PRICE_MOVES = [1, 2, 5, 10, 20, 50, 100];

export function LeverageMatrix({ initialMargin, entryPrice }: LeverageMatrixProps) {
  const [side, setSide] = useState<"LONG" | "SHORT">("LONG");

  const getRiskStatus = (lev: number, move: number, side: "LONG" | "SHORT") => {
    const isLoss = move < 0; 
    const marginBuffer = 100 / lev;
    const absMove = Math.abs(move);

    if (absMove >= marginBuffer) return { label: "LIQUIDADO", color: "bg-red-600 text-white animate-pulse", icon: Skull };
    if (absMove >= marginBuffer * 0.8) return { label: "RISCO CRÍTICO", color: "bg-red-500/20 text-red-500", icon: AlertTriangle };
    if (absMove >= marginBuffer * 0.5) return { label: "RISCO ALTO", color: "bg-orange-500/20 text-orange-500", icon: AlertTriangle };
    return { label: "SEGURO", color: "bg-green-500/20 text-green-500", icon: ShieldCheck };
  };

  return (
    <div className="glass-card p-6 rounded-2xl border-primary/20 bg-black/40 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Leverage Optimizer Matrix</h3>
        </div>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
           <button 
             onClick={() => setSide("LONG")}
             className={`px-4 py-1.5 text-[10px] font-black rounded-md transition-all ${side === "LONG" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"}`}
           >
             BULL (LONG)
           </button>
           <button 
             onClick={() => setSide("SHORT")}
             className={`px-4 py-1.5 text-[10px] font-black rounded-md transition-all ${side === "SHORT" ? "bg-destructive text-white" : "text-muted-foreground hover:text-foreground"}`}
           >
             BEAR (SHORT)
           </button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide border border-white/5 rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="p-4 text-left border-b border-white/10 bg-black/40 sticky left-0 z-10 w-32">
                 <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Move ↓ | Lev →</div>
              </th>
              {LEVERAGES.map(lev => (
                <th key={lev} className="p-4 text-center border-b border-white/10 border-l border-white/5 min-w-[120px]">
                   <span className="text-lg font-black font-display text-primary">{lev}x</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRICE_MOVES.map(move => (
              <tr key={move} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0 group">
                <td className="p-4 bg-black/40 border-r border-white/10 sticky left-0 z-10">
                   <div className="flex items-center gap-2">
                      {side === "LONG" ? <TrendingUp className="h-3 w-3 text-primary" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                      <span className="text-sm font-black font-mono">+{move}%</span>
                   </div>
                   <div className="text-[9px] text-muted-foreground uppercase tracking-tighter mt-1 opacity-60 group-hover:opacity-100 italic">
                      Price At: ${side === "LONG" ? (entryPrice * (1 + move/100)).toLocaleString() : (entryPrice * (1 - move/100)).toLocaleString()}
                   </div>
                </td>
                {LEVERAGES.map(lev => {
                  const pnlPct = move * lev;
                  const profitVal = initialMargin * (pnlPct / 100);
                  const risk = getRiskStatus(lev, -move, side); // Simulate negative move for risk

                  return (
                    <td key={lev} className="p-4 text-center border-l border-white/5">
                       <div className="space-y-2">
                          <div className={`text-sm font-black font-mono ${side === "LONG" ? "text-primary" : "text-destructive"}`}>
                            +${profitVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-[10px] font-bold opacity-60">+{pnlPct}% PnL</div>
                          
                          <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-white/5 mt-2">
                             <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${risk.color}`}>
                                <risk.icon className="h-2.5 w-2.5" />
                                {risk.label}
                             </div>
                             <div className="text-[8px] text-muted-foreground/40 font-mono italic">
                                Liq: ${(entryPrice * (side === "LONG" ? (1 - 0.95/lev) : (1 + 0.95/lev))).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                             </div>
                          </div>
                       </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-4 border-white/5 rounded-xl space-y-2 bg-white/[0.02]">
            <div className="flex items-center gap-2">
               <ShieldCheck className="h-4 w-4 text-primary" />
               <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Capital Control</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic">
               Simule com responsabilidade. Alavancagem acima de 20x exige uma precisão de entrada cirúrgica, pois o stop de liquidação é inferior a 5%.
            </p>
         </div>

         <div className="glass-card p-4 border-white/5 rounded-xl space-y-2 bg-white/[0.02]">
            <div className="flex items-center gap-2">
               <Activity className="h-4 w-4 text-yellow-500" />
               <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Volatilidade x Sobrevivência</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic">
               O 'Oracle Protocol' sugere alavancagem de 5x-10x em confluências de 4h para maximizar a sobrevivência sem comprometer o lucro.
            </p>
         </div>

         <div className="glass-card p-4 border-primary/20 rounded-xl space-y-1 bg-primary/5 flex flex-col justify-center">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1 italic">Confluência Ótima</div>
            <div className="text-xl font-black font-display text-white tracking-tighter">10x Leverage</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Suggested for Institutional Scalping</div>
         </div>
      </div>
    </div>
  );
}
