import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LiquiditySnatchMap } from "@/components/dashboard/LiquiditySnatchMap";
import { SnatchAlertList } from "@/components/dashboard/SnatchAlertList";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, ArrowRightLeft, Info } from "lucide-react";

export default function LiquidityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12 animate-fade-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl text-glow tracking-tighter uppercase italic">
              Liquidity <span className="text-primary">Magnet</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
               <span className="h-1 w-1 bg-primary rounded-full animate-pulse" />
               Global Liquidation Density Matrix • Protocol V3
            </p>
          </div>
          <div className="flex gap-3">
             <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary py-1 px-3">MODEL 3 ENABLED</Badge>
             <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground py-1 px-3 uppercase tracking-widest text-[9px]">24H Temporal View</Badge>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
           {[
             { label: "Long Liquidation Vol", val: "$1.4B", icon: ArrowRightLeft, color: "text-pink-500" },
             { label: "Short Liquidation Vol", val: "$892M", icon: Target, color: "text-cyan-400" },
             { label: "Critical Heat Zones", val: "14 Levels", icon: Zap, color: "text-yellow-400" },
             { label: "Magnet Strength", val: "HIGH", icon: Info, color: "text-primary" },
           ].map((stat, i) => (
             <div key={i} className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                   <stat.icon className={`h-3 w-3 ${stat.color}`} />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-xl font-black font-mono tracking-tighter">{stat.val}</div>
             </div>
           ))}
        </div>

        {/* Main Cinema-Mode Heatmap */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 px-1">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Temporal Density Matrix (Full View)</h2>
           </div>
           <LiquiditySnatchMap symbol="BTCUSDT" height={600} />
        </div>

        {/* Alert Stream & Intelligence */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
           <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <Target className="h-4 w-4 text-primary" />
                 <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Critical Entry Signals (Magnet Confluence)</h2>
              </div>
              <SnatchAlertList />
           </div>

           <div className="glass-card p-6 rounded-xl border-white/10 bg-black/40 space-y-4">
              <div className="text-[10px] font-black uppercase text-primary tracking-widest border-b border-white/5 pb-3">Estratégia Magnet V3</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4">
                "Procure por aglomerados de cor **AMARELA** no mapa. Estes representam níveis de preços onde o volume de ordens liquidadas está em pico histórico para o período. Quando o preço se aproxima dessas zonas com RSI em exaustão, a probabilidade de um 'Snatch' (reversão violenta) é de 85%."
              </p>
              <div className="pt-2 text-[9px] text-muted-foreground/60 uppercase font-mono">
                 Update Frequency: Real-Time Stream via Oracle Intelligence
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
