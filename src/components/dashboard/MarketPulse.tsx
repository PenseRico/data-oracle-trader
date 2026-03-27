import { useGlobalData, useFearGreed } from "@/lib/api/coingecko";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Globe2, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  PieChart, 
  BarChart3,
  Waves
} from "lucide-react";

interface MacroItemProps {
  label: string;
  value: string | number;
  change?: number;
  icon: any;
  color?: string;
}

function MacroItem({ label, value, change, icon: Icon, color = "text-primary" }: MacroItemProps) {
  return (
    <div className="flex flex-col gap-1 px-4 py-2 border-r border-white/5 last:border-0">
      <div className="flex items-center gap-1.5 grayscale opacity-60">
        <Icon className={`h-3 w-3 ${color}`} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-sm font-black font-mono tracking-tighter">{value}</span>
        {change !== undefined && (
          <span className={`text-[9px] font-bold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function MarketPulse() {
  const { data: global } = useGlobalData();
  const { data: fg } = useFearGreed();

  const btcDominance = global?.data?.market_cap_percentage?.btc?.toFixed(1) || "52.4";
  const ethDominance = global?.data?.market_cap_percentage?.eth?.toFixed(1) || "16.8";
  const fgValue = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : 50;
  const fgLabel = fg?.data?.[0]?.value_classification || "Neutral";

  const getFgColor = (val: number) => {
    if (val <= 25) return "bg-red-600";
    if (val <= 45) return "bg-orange-500";
    if (val <= 55) return "bg-yellow-500";
    if (val <= 75) return "bg-green-500";
    return "bg-green-400";
  };

  return (
    <div className="glass-card overflow-hidden border-primary/20 bg-black/60 shadow-glow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1fr] divide-x divide-white/10">
        
        {/* Macro & TradFi Segment */}
        <div className="flex flex-wrap items-center">
          <MacroItem label="DOM BTC" value={`${btcDominance}%`} icon={PieChart} color="text-orange-400" />
          <MacroItem label="DOM ETH" value={`${ethDominance}%`} icon={Activity} color="text-blue-400" />
          <MacroItem label="S&P 500" value="5.241" change={0.84} icon={Globe2} color="text-cyan-400" />
          <MacroItem label="NASDAQ" value="16.428" change={1.22} icon={TrendingUp} color="text-primary" />
          <MacroItem label="OURO (XAU)" value="$2.174" change={-0.12} icon={BarChart3} color="text-yellow-500" />
          <MacroItem label="VIX" value="13.1" change={-4.5} icon={Waves} color="text-red-400" />
        </div>

        {/* Fear & Greed Segment */}
        <div className="flex flex-col justify-center px-6 py-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500/20" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sentimento do Mercado</span>
            </div>
            <Badge variant="outline" className={`text-[8px] h-4 px-1 ${getFgColor(fgValue)} text-black border-none font-black uppercase`}>
              {fgLabel.replace("Fear", "Medo").replace("Extreme Greed", "Ganância Extrema").replace("Greed", "Ganância").replace("Neutral", "Neutro")}
            </Badge>
          </div>
          <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
             <div 
               className={`absolute left-0 top-0 h-full transition-all duration-1000 ${getFgColor(fgValue)} shadow-glow`}
               style={{ width: `${fgValue}%` }}
             />
             <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 -translate-x-1/2" />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
             <span>Medo Extremo</span>
             <span>Ganância Extrema</span>
          </div>
        </div>

        {/* Global Exchange Volume */}
        <div className="flex flex-col justify-center px-6 py-2 border-l border-white/5">
           <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-3 w-3 text-primary/60" />
              <span className="text-[9px] font-black uppercase tracking-widest">Aggregated Vol (24H)</span>
           </div>
           <div className="text-xl font-black font-mono tracking-tighter text-glow-sm">
             $84.2B <span className="text-[10px] text-green-500">+14%</span>
           </div>
           <div className="flex gap-2 mt-1">
              <div className="h-0.5 flex-1 bg-primary/20 rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-2/3" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
