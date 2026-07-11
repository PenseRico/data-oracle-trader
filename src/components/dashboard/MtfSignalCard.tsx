import { MtfSignal } from "@/lib/mtfRsiEngine";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  signal: MtfSignal;
  side: "long" | "short";
}

// Paleta de força do indicador original: 3+ forte, 2 médio, 1 fraco.
const STRENGTH = {
  forte: { label: "FORTE", color: "#ff2929", bg: "rgba(255,41,41,0.12)" },
  medio: { label: "MÉDIO", color: "#ff8800", bg: "rgba(255,136,0,0.12)" },
  fraco: { label: "FRACO", color: "#ffe600", bg: "rgba(255,230,0,0.10)" },
  nenhum: { label: "—", color: "#71717a", bg: "rgba(113,113,122,0.1)" },
};

function rsiColor(v: number) {
  if (v <= 30) return "text-cyan-300";
  if (v >= 70) return "text-rose-300";
  return "text-zinc-400";
}

export function MtfSignalCard({ signal, side }: Props) {
  const navigate = useNavigate();
  const isLong = side === "long";
  const score = isLong ? signal.scoreLong : signal.scoreShort;
  const fired = isLong ? signal.triggerLong : signal.triggerShort;
  const str = STRENGTH[signal.strength];

  return (
    <button
      onClick={() => navigate(`/dashboard/analysis/${signal.base}USDT`)}
      className={`group w-full text-left glass-card rounded-xl border bg-black/50 p-3 transition-all hover:-translate-y-0.5 ${
        fired
          ? isLong
            ? "border-emerald-500/40 shadow-[0_0_18px_-6px_rgba(16,185,129,0.5)]"
            : "border-rose-500/40 shadow-[0_0_18px_-6px_rgba(244,63,94,0.5)]"
          : "border-white/[0.06]"
      }`}
    >
      {/* Topo: ativo + score + força */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {isLong ? (
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-rose-400" />
          )}
          <span className="font-black tracking-widest text-sm text-white group-hover:text-primary transition-colors">
            {signal.base}
          </span>
          {fired && (
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest"
              style={{ background: str.bg, color: str.color }}>
              <Zap className="h-2.5 w-2.5" /> Gatilho
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest"
            style={{ background: str.bg, color: str.color }}
          >
            {str.label}
          </span>
          <div className="text-right">
            <span className={`text-lg font-black font-mono leading-none ${isLong ? "text-emerald-300" : "text-rose-300"}`}>{score}</span>
            <span className="text-[9px] text-muted-foreground/50 font-mono">/6</span>
          </div>
        </div>
      </div>

      {/* Mini-tabela MTF (espelho do seu indicador) */}
      <div className="grid grid-cols-4 gap-1">
        {signal.legs.map((leg) => {
          const aligned = isLong ? leg.alignedLong : leg.alignedShort;
          const isGate = leg.tf === "5m";
          return (
            <div
              key={leg.tf}
              className={`rounded-md border px-1 py-1 text-center transition-colors ${
                aligned
                  ? isLong
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-rose-500/40 bg-rose-500/10"
                  : "border-white/5 bg-black/30"
              }`}
            >
              <div className="text-[8px] uppercase tracking-widest text-muted-foreground/60 font-mono flex items-center justify-center gap-0.5">
                {leg.tf}
                {!isGate && <span className="text-primary/60">·{leg.pts}</span>}
                {isGate && <Zap className="h-2 w-2 text-amber-400/70" />}
              </div>
              <div className={`text-[11px] font-black font-mono ${rsiColor(leg.rsi)}`}>
                {Math.round(leg.rsi)}
              </div>
            </div>
          );
        })}
      </div>
    </button>
  );
}
