import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LeverageMatrix } from "@/components/dashboard/LeverageMatrix";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMarkets } from "@/lib/api/coingecko";
import { 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight,
  Zap,
  Activity,
  DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LeveragePage() {
  const { data: markets } = useMarkets(1, 10);
  const btcPrice = markets?.[0]?.current_price || 65000;

  const [margin, setMargin] = useState(1000);
  const [price, setPrice] = useState(btcPrice);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-[1400px] mx-auto pb-20 px-4 md:px-0">
        
        {/* Header & Simulation Input */}
        <div className="flex flex-col lg:flex-row gap-8 items-end justify-between">
           <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                 <Calculator className="h-5 w-5 text-primary" />
                 <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Leverage & Risk Simulator</h2>
              </div>
              <h1 className="text-3xl font-display font-black tracking-tighter uppercase italic leading-tight">
                 Otimizador de Capital <span className="text-primary italic">Pro</span>
              </h1>
              <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-lg italic">
                 Analise cenários de alavancagem de 1x a 50x e descubra onde o seu risco se torna insustentável antes de entrar na operação.
              </p>
           </div>

           <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <div className="space-y-2 flex-1 min-w-[180px]">
                 <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Capital Inicial (Margem)</Label>
                 <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input 
                      type="number" 
                      value={margin} 
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="bg-black/40 border-primary/20 pl-10 h-12 text-lg font-black font-mono shadow-glow-sm transition-all focus:border-primary/50"
                    />
                 </div>
              </div>

              <div className="space-y-2 flex-1 min-w-[180px]">
                 <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Preço de Entrada ($)</Label>
                 <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="bg-black/40 border-primary/20 pl-10 h-12 text-lg font-black font-mono shadow-glow-sm transition-all focus:border-primary/50"
                    />
                 </div>
                 <div className="flex justify-between mt-1">
                    <span className="text-[8px] uppercase font-bold text-muted-foreground/40 italic">Ativo Sincronizado</span>
                    <button 
                      onClick={() => setPrice(btcPrice)}
                      className="text-[8px] uppercase font-bold text-primary hover:underline italic"
                    >
                      Reset para BTC: ${btcPrice.toLocaleString()}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* The Matrix */}
        <div className="animate-fade-up">
           <LeverageMatrix initialMargin={margin} entryPrice={price} />
        </div>

        {/* Insights & Strategy */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <InsightCard 
             icon={Zap} 
             title="Alavancagem 5x" 
             desc="Margin of error de 20%. Ideal para swing trades de confluência Diária." 
           />
           <InsightCard 
             icon={TrendingUp} 
             title="Alavancagem 10x" 
             desc="Margin of error de 10%. Padrão ouro para trades institucionais agressivos." 
           />
           <InsightCard 
             icon={Activity} 
             title="High Leverage (20x+)" 
             desc="Zonas críticas. Risco de liquidação imediata em flash crashes." 
           />
           <InsightCard 
             icon={ShieldCheck} 
             title="Risk Management" 
             desc="Nunca comprometa mais de 3% do seu capital total em uma única margem." 
           />
        </div>

      </div>
    </DashboardLayout>
  );
}

function InsightCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="glass-card p-5 border-white/5 bg-black/40 rounded-xl space-y-3 group hover:border-primary/20 transition-all">
       <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
             <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{title}</span>
       </div>
       <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic border-l border-white/10 pl-3">
          {desc}
       </p>
    </div>
  );
}
