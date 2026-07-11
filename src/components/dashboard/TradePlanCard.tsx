import { useNavigate } from "react-router-dom";
import { TradePlan } from "@/lib/tradePlan";
import { TrendingUp, TrendingDown, Target, ShieldAlert, ArrowRight, Crosshair } from "lucide-react";

function fmt(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
}

export function TradePlanCard({ plan }: { plan: TradePlan }) {
  const navigate = useNavigate();
  const isBuy = plan.direction === "COMPRA";
  const accent = isBuy ? "emerald" : "rose";

  return (
    <div
      className={`glass-card rounded-xl border bg-black/60 overflow-hidden flex flex-col ${
        isBuy ? "border-emerald-500/30" : "border-rose-500/30"
      }`}
    >
      {/* faixa direção */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${isBuy ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
        <div className="flex items-center gap-2">
          <img src={plan.image} alt="" className="h-6 w-6 rounded-full" />
          <span className="font-black tracking-wide text-white text-sm">{plan.symbol}</span>
          <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${isBuy ? "text-emerald-300" : "text-rose-300"}`}>
            {isBuy ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {plan.direction}
          </span>
        </div>
        <div className="text-right">
          <div className={`text-sm font-black font-mono ${isBuy ? "text-emerald-300" : "text-rose-300"}`}>{plan.confidence}%</div>
          <div className="text-[8px] uppercase tracking-widest text-muted-foreground/50 font-mono">confiança</div>
        </div>
      </div>

      {/* níveis prontos */}
      <div className="p-4 space-y-2">
        <Level icon={Crosshair} label="Entrada" value={fmt(plan.entry)} tone="text-white" />
        <Level icon={Target} label="Alvo 1" value={fmt(plan.target1)} tone="text-emerald-300" />
        <Level icon={Target} label="Alvo 2" value={fmt(plan.target2)} tone="text-emerald-300" />
        <Level icon={ShieldAlert} label="Stop" value={fmt(plan.stop)} tone="text-rose-300" />

        <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5 text-[10px] font-mono">
          <span className="text-muted-foreground/70">
            Risco <span className="text-rose-300 font-bold">{plan.riskPct.toFixed(1)}%</span>
          </span>
          <span className="text-muted-foreground/70">
            R:R <span className={`font-bold ${isBuy ? "text-emerald-300" : "text-rose-300"}`}>{plan.rr}:1</span>
          </span>
          <span className="text-muted-foreground/70 uppercase tracking-wider">{plan.timeframe}</span>
        </div>
      </div>

      {/* motivo + ação */}
      <div className="mt-auto px-4 pb-4 space-y-2">
        <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-mono border-l-2 border-white/10 pl-2">
          <span className={`font-bold uppercase tracking-wider mr-1 ${isBuy ? "text-emerald-300/80" : "text-rose-300/80"}`}>Por quê:</span>
          {plan.reason}
        </p>
        <button
          onClick={() => navigate(`/dashboard/analysis/${plan.symbol}USDT`)}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all hover:brightness-110 border ${
            isBuy ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          Ver análise completa <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Level({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 font-mono">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <span className={`text-sm font-black font-mono ${tone}`}>{value}</span>
    </div>
  );
}
