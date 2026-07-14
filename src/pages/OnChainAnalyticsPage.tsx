import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OnChainMetricCard } from "@/components/dashboard/OnChainMetricCard";
import { ONCHAIN_METRICS, useOnChainSnapshot, TONE_SCORE, type ZoneTone } from "@/lib/api/onchain";
import { Badge } from "@/components/ui/badge";
import { Link2, Activity, Gauge } from "lucide-react";

const TONE_DOT: Record<ZoneTone, string> = {
  buy: "bg-emerald-400", accumulate: "bg-teal-300", neutral: "bg-zinc-400", caution: "bg-amber-400", sell: "bg-rose-400",
};
const TONE_TEXT: Record<ZoneTone, string> = {
  buy: "text-emerald-400", accumulate: "text-teal-300", neutral: "text-zinc-400", caution: "text-amber-400", sell: "text-rose-400",
};

function CycleConsensus() {
  const { data, isLoading } = useOnChainSnapshot();
  const items = (data ?? []).filter((i) => i.zone && i.value != null);
  if (isLoading && !items.length) return <div className="glass-card rounded-xl border border-white/5 bg-black/40 h-32 animate-pulse" />;
  if (!items.length) return null;

  const avg = items.reduce((s, i) => s + TONE_SCORE[i.zone!.tone], 0) / items.length;
  const buyCount = items.filter((i) => i.zone!.tone === "buy" || i.zone!.tone === "accumulate").length;
  const topCount = items.filter((i) => i.zone!.tone === "sell" || i.zone!.tone === "caution").length;
  const verdict =
    avg <= -1.2 ? { label: "FUNDO / COMPRA", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" }
    : avg <= -0.4 ? { label: "ACUMULAÇÃO", cls: "text-teal-300 border-teal-500/30 bg-teal-500/10" }
    : avg < 0.4 ? { label: "NEUTRO", cls: "text-zinc-300 border-zinc-500/30 bg-zinc-500/10" }
    : avg < 1.2 ? { label: "CAUTELA", cls: "text-amber-400 border-amber-500/30 bg-amber-500/10" }
    : { label: "TOPO / DISTRIBUIÇÃO", cls: "text-rose-400 border-rose-500/30 bg-rose-500/10" };

  return (
    <div className="glass-card rounded-xl border border-white/[0.06] bg-black/40 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Posição no Ciclo</h3>
          <span className="text-[9px] font-mono text-muted-foreground/50">{items.length} indicadores on-chain</span>
        </div>
        <span className={`text-xs font-black uppercase tracking-widest rounded-lg border px-3 py-1 ${verdict.cls}`}>{verdict.label}</span>
      </div>
      <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
        <span className="text-white/90 font-bold">{buyCount} de {items.length}</span> indicadores em zona de compra/acúmulo
        {topCount > 0 && <> · <span className="text-white/90 font-bold">{topCount}</span> em cautela/topo</>}. Leitura macro de longo prazo — não é gatilho de curto prazo.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {items.map((i) => (
          <div key={i.metric.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${TONE_DOT[i.zone!.tone]}`} />
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/70 truncate">{i.metric.label}</span>
            </div>
            <div className="text-sm font-black font-mono text-white">{i.value!.toFixed(i.metric.precision)}</div>
            <div className={`text-[9px] font-bold truncate ${TONE_TEXT[i.zone!.tone]}`}>{i.zone!.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORIES = [
  { id: "btc", label: "Bitcoin On-Chain", enabled: true },
  { id: "defi", label: "DeFi & Stablecoins", enabled: false },
  { id: "whale", label: "Whale Tracker", enabled: false },
  { id: "network", label: "Network Health", enabled: false },
  { id: "etf", label: "ETFs Crypto", enabled: false },
];

export default function OnChainAnalyticsPage() {
  const [active, setActive] = useState("btc");
  const metrics = ONCHAIN_METRICS.filter((m) => m.category === "btc");

  return (
    <DashboardLayout fullHeight>
      <div className="flex flex-col h-full bg-background min-h-[calc(100vh-64px)] pb-24">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-black/40 px-6 py-5 shrink-0 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 opacity-5">
            <Link2 className="h-64 w-64 text-cyan-500" />
          </div>
          <div className="relative z-10 space-y-1">
            <h1 className="font-display font-black text-2xl text-glow tracking-tighter uppercase italic flex items-center gap-3">
              Dados On-Chain <span className="text-primary text-xl">Analytics</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono">
              Smart Money • Ciclo Macro • Lucro & Prejuízo da Rede
            </p>
          </div>
          <div className="relative z-10 flex gap-3">
            <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-300 py-1.5 px-3 uppercase tracking-widest font-black text-[9px]">
              <Activity className="h-3 w-3 mr-1" /> Dado real • BGeometrics
            </Badge>
          </div>
        </div>

        {/* Sub-abas de categoria */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-white/5 bg-zinc-950/50 px-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              disabled={!c.enabled}
              onClick={() => c.enabled && setActive(c.id)}
              className={`relative whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-widest font-mono transition-colors ${
                active === c.id
                  ? "text-primary"
                  : c.enabled
                  ? "text-muted-foreground/70 hover:text-white"
                  : "text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              {c.label}
              {!c.enabled && <span className="ml-1.5 text-[8px] text-muted-foreground/40">em breve</span>}
              {active === c.id && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary shadow-[0_0_8px_rgba(45,212,191,0.6)]" />}
            </button>
          ))}
        </div>

        {/* Contexto pedagógico */}
        <div className="p-4 border-b border-white/5 bg-zinc-950/40">
          <div className="glass-card p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
            <Link2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-mono">
              Cada métrica mostra a faixa <span className="text-emerald-300">verde (lucro)</span> e{" "}
              <span className="text-rose-300">vermelha (prejuízo)</span> em relação à linha de equilíbrio da rede.
              O badge à direita traduz o valor atual em um veredito — <span className="text-emerald-300">fundo</span>,{" "}
              <span className="text-cyan-300">acumular</span> ou <span className="text-rose-300">topo</span> —
              para você pegar a leitura mastigada sem precisar interpretar o gráfico.
            </p>
          </div>
        </div>

        {/* Consenso de ciclo + cards empilhados */}
        <div className="flex-1 p-4 sm:p-6 space-y-5 max-w-5xl w-full mx-auto">
          <CycleConsensus />
          {metrics.map((m) => (
            <OnChainMetricCard key={m.id} metric={m} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
