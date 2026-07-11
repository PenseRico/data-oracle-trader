import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { InfoHint } from "./InfoHint";
import { SignalScore } from "@/lib/signalEngine";
import { 
  Sparkles, 
  Target, 
  AlertTriangle,
  Zap,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  BarChart2
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
  
  const funnelAlert = useMemo(() => {
    // Logic to determine if we have an actionable setup right now
    if (marketSentiment <= 30 && topSignal && topSignal.score >= 5) {
      return { 
        type: "BUY_ALERT",
        title: "ZONA DE OPORTUNIDADE INSTITUCIONAL",
        tags: ["Medo Extremo", "RSI Sobrevendido", "Acumulação Whale"],
        color: "text-primary",
        bg: "bg-primary/10 border-primary/30",
        icon: Target,
        hintId: "zonaOportunidade"
      };
    } else if (marketSentiment >= 75 && topSignal && topSignal.score <= -5) {
      return { 
        type: "SELL_ALERT",
        title: "ALERTA DE DISTRIBUIÇÃO",
        tags: ["Ganância Extrema", "Divergência Bearish", "Realização de Lucro"],
        color: "text-rose-500",
        bg: "bg-rose-500/10 border-rose-500/30",
        icon: AlertTriangle,
        hintId: "alertaDistribuicao"
      };
    }
    
    // Default / Neutral scanning state
    return { 
      type: "SCANNING",
      title: "SCANNER INSTITUCIONAL ATIVO",
      tags: ["Consolidação", "Baixo Volume", "Aguardando Rompimento"],
      color: "text-yellow-400",
      bg: "bg-yellow-400/10 border-yellow-400/30",
      icon: Activity,
      hintId: "scannerInstitucional"
    };
  }, [marketSentiment, topSignal, signalsCount]);

  return (
    <div className={`glass-card p-6 rounded-2xl border ${funnelAlert.bg} shadow-glow-sm relative overflow-hidden group mb-6`}>
      {/* Background Pulse Aesthetic */}
      <div className={`absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-all duration-1000 ${funnelAlert.color}`}>
         <Sparkles className="h-48 w-48" />
      </div>
      
      <div className="relative z-10 flex flex-col xl:flex-row gap-6 items-center">
         
         {/* Alert Icon & Header */}
         <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center gap-3 mb-2">
               <div className={`h-12 w-12 rounded-xl flex items-center justify-center border shadow-glow-sm ${funnelAlert.bg}`}>
                  <funnelAlert.icon className={`h-6 w-6 ${funnelAlert.color} animate-pulse`} />
               </div>
               <div>
                  <div className="flex items-center gap-2">
                     <Badge variant="outline" className={`animate-pulse border-${funnelAlert.color.split('-')[1]} text-[9px] uppercase tracking-widest`}>
                       {funnelAlert.type === "SCANNING" ? "Monitorando" : "Sinal Crítico"}
                     </Badge>
                     <span className="text-[10px] text-muted-foreground font-mono uppercase">| Sinais: {signalsCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h2 className={`text-xl font-display font-black tracking-tight uppercase ${funnelAlert.color}`}>
                       {funnelAlert.title}
                    </h2>
                    <InfoHint id={funnelAlert.hintId} size={16} />
                  </div>
               </div>
            </div>

            {/* Visual Tags instead of long paragraph */}
            <div className="flex flex-wrap gap-2">
               {funnelAlert.tags.map((tag, i) => (
                 <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 border border-white/5 text-[10px] font-bold font-mono tracking-widest uppercase text-muted-foreground">
                   {i === 0 ? (funnelAlert.type === "BUY_ALERT" ? <TrendingDown className="h-3 w-3 text-red-500" /> : <TrendingUp className="h-3 w-3 text-green-500" />) : <BarChart2 className="h-3 w-3" />}
                   {tag}
                 </div>
               ))}
            </div>
         </div>

         {/* The Action Funnel */}
         {topSignal && funnelAlert.type !== "SCANNING" && (
           <div className="w-full xl:w-[400px] bg-black/60 rounded-xl p-4 border border-white/5 flex flex-col gap-3 shrink-0">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-2 border-b border-white/5">
                <span>Principal Oportunidade</span>
                <span className={funnelAlert.color}>Confluência Elite</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black font-mono text-white tracking-tighter">{topSignal.symbol}</div>
                  <div className={`text-[10px] py-1 px-2 rounded-md font-black uppercase tracking-widest border ${funnelAlert.bg} ${funnelAlert.color}`}>
                    {funnelAlert.type === "BUY_ALERT" ? "Setup Compra" : "Setup Venda"}
                  </div>
                </div>
              </div>
              
              <button className={`mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all hover:brightness-110 border ${funnelAlert.bg} ${funnelAlert.color}`}>
                Executar Análise <ArrowRight className="h-4 w-4" />
              </button>
           </div>
         )}
         
         {/* If just scanning, show simple stat box */}
         {funnelAlert.type === "SCANNING" && (
           <div className="w-full xl:w-[350px] bg-black/60 rounded-xl p-4 border border-white/5 flex flex-col justify-center items-center gap-3 shrink-0">
             <Activity className="h-8 w-8 text-yellow-400 opacity-50" />
             <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Buscando Setup Perfeito</span>
           </div>
         )}
      </div>
    </div>
  );
}
