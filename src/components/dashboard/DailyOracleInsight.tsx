import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { SignalScore } from "@/lib/signalEngine";
import { 
  Sparkles, 
  Target, 
  ArrowRightLeft, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Zap,
  Waves
} from "lucide-react";

interface DailyOracleInsightProps {
  signalsCount: number;
  marketSentiment: number; // Fear & Greed
  topSignal?: {
    symbol: string;
    score: number;
    confluence: string;
  };
}

export function DailyOracleInsight({ signalsCount, marketSentiment, topSignal }: DailyOracleInsightProps) {
  const dateStr = new Date().toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' });

  const oracleVerdict = useMemo(() => {
    if (marketSentiment <= 25) return { type: "BUY", label: "CAPITULAÇÃO MÁXIMA", detail: "O medo extremo abre janelas de reversão institucional." };
    if (marketSentiment >= 75) return { type: "SELL", label: "DISTRIBUIÇÃO IMINENTE", detail: "Ganância excessiva. Hora de proteger lucros e buscar shorts." };
    return { type: "NEUTRAL", label: "CONFLUÊNCIA EM FORMAÇÃO", detail: "Aguardando rompimento de canais de volatilidade (Bollinger)." };
  }, [marketSentiment]);

  return (
    <div className="glass-card p-6 rounded-2xl border-primary/30 bg-primary/5 shadow-glow relative overflow-hidden group">
      {/* Background Oracle Aesthetic */}
      <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
         <Sparkles className="h-40 w-40 text-primary" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
         <div className="space-y-4 max-w-[500px]">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
                  <Zap className="h-6 w-6 text-black" />
               </div>
               <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary italic">Daily Oracle Insight</h2>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-mono">
                     <Clock className="h-3 w-3" />
                     Data: {dateStr} • Oracle V5.0
                  </div>
               </div>
            </div>

            <div className="space-y-1">
               <h3 className="text-xl font-display font-black tracking-tighter uppercase italic leading-tight">
                  Veredito do Dia: <span className={oracleVerdict.type === "BUY" ? "text-green-500" : oracleVerdict.type === "SELL" ? "text-red-500" : "text-primary"}>
                    {oracleVerdict.label}
                  </span>
               </h3>
               <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                  "{oracleVerdict.detail} Monitorando {signalsCount} ativos em confluência transversal."
               </p>
            </div>

            <div className="flex flex-wrap gap-3">
               <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-3 py-1 uppercase text-[9px] tracking-widest">
                  Macro: STABLE
               </Badge>
               <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground px-3 py-1 uppercase text-[9px] tracking-widest">
                  Volatility: HIGH
               </Badge>
            </div>
         </div>

         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="glass-card p-4 rounded-xl border-white/10 bg-black/40 space-y-3 shadow-2xl">
               <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Oportunidade Sniper</span>
               </div>
               <div className="flex items-end justify-between">
                  <div className="text-2xl font-black font-mono tracking-tighter text-glow-sm">{topSignal?.symbol || "N/A"}</div>
                  <Badge variant="outline" className="bg-primary/20 text-primary text-[10px] border-primary/30 mb-1">CONFLUENCE: {topSignal?.confluence || "---"}</Badge>
               </div>
               <div className="text-[10px] text-muted-foreground italic border-t border-white/5 pt-2">
                  Ativo atingiu o **Golden Pocket (0.618)** + RSI em exaustão. Configuração 'Ouro Mastigado'.
               </div>
            </div>

            <div className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02] flex flex-col justify-center gap-3">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-green-500/60" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Risk Guard Mode</span>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                     <span className="text-muted-foreground">Stop Loss Protection</span>
                     <span className="text-primary font-bold">ACTIVE</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-3/4 shadow-glow-sm" />
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 opacity-50">
         <div className="flex gap-4">
            <div className="flex items-center gap-1.5 grayscale"><ArrowRightLeft className="h-3 w-3" /> <span className="text-[9px] font-black uppercase tracking-widest">Exch: GLOBAL</span></div>
            <div className="flex items-center gap-1.5 grayscale"><AlertCircle className="h-3 w-3" /> <span className="text-[9px] font-black uppercase tracking-widest">VIX: SENSITIVE</span></div>
            <div className="flex items-center gap-1.5 grayscale"><Waves className="h-3 w-3" /> <span className="text-[9px] font-black uppercase tracking-widest">Liquidity: DEEP</span></div>
         </div>
         <div className="text-[9px] font-mono uppercase tracking-[0.2em]">Oracle Protocol Terminal</div>
      </div>
    </div>
  );
}
