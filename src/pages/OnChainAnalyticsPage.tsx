import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OnChainMetricCard } from "@/components/dashboard/OnChainMetricCard";
import { ONCHAIN_METRICS } from "@/lib/api/onchain";
import { Badge } from "@/components/ui/badge";
import { Link2, Activity } from "lucide-react";

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

        {/* Cards empilhados */}
        <div className="flex-1 p-4 sm:p-6 space-y-5 max-w-5xl w-full mx-auto">
          {metrics.map((m) => (
            <OnChainMetricCard key={m.id} metric={m} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
