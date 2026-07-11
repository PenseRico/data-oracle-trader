import { useMultiRsi } from "@/lib/api/binance";
import { computeMtfSignal, DEFAULT_MTF_CONFIG } from "@/lib/mtfRsiEngine";
import { InfoHint } from "./InfoHint";
import { Activity, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";

const { oversold: OS, overbought: OB } = DEFAULT_MTF_CONFIG;

const ROWS: { tf: "1d" | "4h" | "1h" | "5m"; label: string; pts: number }[] = [
  { tf: "1d", label: "Diário", pts: 3 },
  { tf: "4h", label: "4h", pts: 2 },
  { tf: "1h", label: "1h", pts: 1 },
  { tf: "5m", label: "5m (gatilho)", pts: 0 },
];

function rsiColor(v: number) {
  if (v <= OS) return "#22d3ee";
  if (v >= OB) return "#f43f5e";
  return "#a1a1aa";
}

function RsiBar({ label, pts, rsi }: { label: string; pts: number; rsi: number }) {
  const color = rsiColor(rsi);
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0 flex items-center gap-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">{label}</span>
        {pts > 0 && <span className="text-[8px] font-mono text-primary/60">·{pts}pt</span>}
      </div>
      <div className="relative flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden">
        {/* zonas OS/OB */}
        <div className="absolute inset-y-0 left-0 bg-cyan-500/10" style={{ width: `${OS}%` }} />
        <div className="absolute inset-y-0 right-0 bg-rose-500/10" style={{ width: `${100 - OB}%` }} />
        {/* linha 50 */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/15" />
        {/* marcador RSI */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-full shadow"
          style={{ left: `calc(${Math.max(0, Math.min(100, rsi))}% - 3px)`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <span className="w-9 text-right text-[11px] font-black font-mono" style={{ color }}>
        {Math.round(rsi)}
      </span>
    </div>
  );
}

export function MtfRsiPanel({ symbol }: { symbol: string }) {
  const { data: rsiByTf, isLoading } = useMultiRsi(symbol);
  const base = symbol.replace("USDT", "");
  const sig = rsiByTf ? computeMtfSignal(symbol, rsiByTf, DEFAULT_MTF_CONFIG) : null;

  const dir = sig?.direction ?? "NEUTRAL";
  const score = dir === "LONG" ? sig?.scoreLong ?? 0 : dir === "SHORT" ? sig?.scoreShort ?? 0 : 0;
  const verdict =
    dir === "LONG"
      ? { txt: sig?.triggerLong ? "COMPRA · GATILHO" : "VIÉS DE COMPRA", cls: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30", Icon: TrendingUp }
      : dir === "SHORT"
      ? { txt: sig?.triggerShort ? "VENDA · GATILHO" : "VIÉS DE VENDA", cls: "text-rose-300 bg-rose-500/10 border-rose-500/30", Icon: TrendingDown }
      : { txt: "SEM CONFLUÊNCIA", cls: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", Icon: Minus };
  const { Icon } = verdict;

  return (
    <div className="bg-[#0B0E14] border-t border-white/5 px-5 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
            MTF RSI Confluence · {base}
          </span>
          <InfoHint id="mtfConfluence" />
        </div>
        <div className={`flex items-center gap-2 rounded-md border px-2.5 py-1 ${verdict.cls}`}>
          <Icon className="h-3.5 w-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">{verdict.txt}</span>
          {dir !== "NEUTRAL" && <span className="text-[11px] font-black font-mono">{score}/6</span>}
        </div>
      </div>

      {isLoading || !rsiByTf ? (
        <div className="flex items-center justify-center gap-2 text-muted-foreground/60 text-[11px] font-mono py-6">
          <Loader2 className="h-4 w-4 animate-spin" /> calculando RSI multi-timeframe…
        </div>
      ) : (
        <div className="space-y-2">
          {ROWS.map((r) => (
            <RsiBar key={r.tf} label={r.label} pts={r.pts} rsi={rsiByTf[r.tf] ?? 50} />
          ))}
          <div className="flex items-center justify-between pt-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground/40">
            <span className="text-cyan-400/60">◄ sobrevendido {OS}</span>
            <span>neutro 50</span>
            <span className="text-rose-400/60">sobrecomprado {OB} ►</span>
          </div>
        </div>
      )}
    </div>
  );
}
