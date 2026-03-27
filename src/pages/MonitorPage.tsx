import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LineChart, Zap, Activity, Globe2, Target } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useCoinChart } from "@/lib/api/coingecko";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const watchlist = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "solana", name: "Solana", symbol: "SOL" },
];

const dayOptions = [
  { label: "1H", value: 1 / 24 },
  { label: "24H", value: 1 },
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
];

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(6)}`;
}

function CoinChart({ coinId, coinName, symbol }: { coinId: string; coinName: string; symbol: string }) {
  const [days, setDays] = useState(1);
  const { data: chartData, isLoading } = useCoinChart(coinId, days);

  const priceData = chartData?.prices?.map(([ts, price]) => ({
    time: new Date(ts).toLocaleString("pt-BR", {
      hour: "2-digit", minute: "2-digit",
      ...(days > 1 ? { day: "2-digit", month: "2-digit" } : {}),
    }),
    price,
  })) || [];

  return (
    <div className="glass-card rounded-xl p-5 space-y-4 border-white/5 bg-white/[0.02] shadow-2xl transition-all duration-300 hover:border-primary/30 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-glow" />
           <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{coinName}</h3>
              <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em]">{symbol}/USDT</div>
           </div>
        </div>
        <div className="flex gap-1 bg-black/40 p-1 rounded-md border border-white/5">
          {dayOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setDays(opt.value)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all uppercase tracking-tighter ${
                days === opt.value ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[220px] relative">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
             <div className="flex flex-col items-center gap-2">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Sincronizando...</span>
             </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id={`g-${coinId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip 
                 contentStyle={{ 
                   background: "rgba(10, 10, 12, 0.9)", 
                   border: "1px solid rgba(255, 255, 255, 0.05)", 
                   borderRadius: "8px", 
                   fontSize: "10px",
                   backdropFilter: "blur(12px)"
                 }} 
                 itemStyle={{ color: "hsl(var(--primary))", fontSize: "11px", fontWeight: "bold" }}
                 labelStyle={{ color: "rgba(255, 255, 255, 0.4)", marginBottom: "4px" }}
                 formatter={(v: number) => [formatPrice(v), "VALOR"]} 
              />
              <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={1.5} fill={`url(#g-${coinId})`} animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
         <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[8px] border-white/5 bg-white/5 text-muted-foreground px-1 uppercase tracking-tighter">Volatility: Avg</Badge>
            <Badge variant="outline" className="text-[8px] border-primary/20 bg-primary/5 text-primary px-1 uppercase tracking-tighter">Oracle Trace ON</Badge>
         </div>
         <div className="text-[10px] font-mono text-primary/60 font-bold tracking-tighter">
            {priceData.length > 0 ? formatPrice(priceData[priceData.length - 1].price) : "---"}
         </div>
      </div>
    </div>
  );
}

export default function MonitorPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-fade-up">
        {/* Superior Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl text-glow tracking-tighter uppercase italic">
              Global <span className="text-primary">Pulse Telemetry</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
               <Globe2 className="h-3 w-3 text-primary/60" />
               Live Market Stream • Network Latency 12ms
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">Stream Quality</div>
                <div className="text-xs font-black text-green-500 uppercase italic">lossless 4k</div>
             </div>
             <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
             <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary py-1 px-3 uppercase text-[8px] tracking-widest">Master Watchlist</Badge>
          </div>
        </div>

        {/* Intelligence Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass-card p-5 rounded-xl border-primary/20 bg-primary/5 flex items-start gap-4">
              <Zap className="h-5 w-5 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-primary tracking-widest">Telemetry Logic</div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">Monitoramento direto da Coinglass & Binance para detecção de anomalias de preço pré-liquidação.</p>
              </div>
           </div>
           <div className="glass-card p-5 rounded-xl border-white/5 bg-white/[0.02] flex items-start gap-4">
              <Target className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase text-foreground tracking-widest">Cross-Confluence</div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">Cruze estes gráficos com o **RSI Heatmap** para confirmal exaustão de força em níveis de suporte/resistência.</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {watchlist.map((coin) => (
            <CoinChart key={coin.id} coinId={coin.id} coinName={coin.name} symbol={coin.symbol} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
