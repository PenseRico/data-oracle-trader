import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  BarChart3, Bell, LineChart, Shield, Zap, Activity,
  TrendingUp, Eye, Layers, Target
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "On-Chain Live",
    description: "Funding Rate, Open Interest, fluxo de exchange, liquidações e endereços whale — atualizado em tempo real.",
    accent: "cyan",
    tag: "On-Chain",
  },
  {
    icon: Target,
    title: "Score de Confluência",
    description: "Motor de sinais proprietário que une RSI, MACD, Fibonacci, Bandas de Bollinger e sentimento em um único score.",
    accent: "violet",
    tag: "IA",
  },
  {
    icon: Bell,
    title: "Alertas Mastigados",
    description: "Sinais de compra e venda prontos, com nível de confluência, motivos técnicos e sugestão de entrada.",
    accent: "amber",
    tag: "Automação",
  },
  {
    icon: Layers,
    title: "Heatmap de Liquidez",
    description: "Visualize zonas de liquidação no orderbook, identifique onde as baleias têm posições abertas.",
    accent: "cyan",
    tag: "Liquidez",
  },
  {
    icon: Eye,
    title: "Monitoramento Whale",
    description: "Rastreamento de ordens acima de $5M em tempo real nas principais exchanges globais.",
    accent: "emerald",
    tag: "Whale",
  },
  {
    icon: TrendingUp,
    title: "Multi-Timeframe RSI",
    description: "Heatmap RSI em múltiplos timeframes (15m, 1h, 4h, 1D) para identificar zonas de exaustão com precisão.",
    accent: "rose",
    tag: "Técnico",
  },
];

const ACCENT: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  cyan:   { text: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   glow: "rgba(34,211,238,0.15)" },
  violet: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "rgba(139,92,246,0.15)" },
  amber:  { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  glow: "rgba(251,191,36,0.15)" },
  emerald:{ text: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",glow: "rgba(52,211,153,0.15)" },
  rose:   { text: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/20",   glow: "rgba(251,113,133,0.15)" },
};

export function FeaturesSection() {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section id="features" className="relative py-28 bg-[#07080d]">
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Top rule */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-[11px] font-mono text-cyan-400 mb-6 uppercase tracking-widest"
            style={isVisible ? { animation: "fadeInUp 0.5s ease both" } : { opacity: 0 }}
          >
            <Zap className="h-3 w-3" /> Módulos do Sistema
          </div>
          <h2
            className="font-black text-4xl md:text-5xl tracking-[-0.02em] text-white leading-tight"
            style={isVisible ? { animation: "fadeInUp 0.5s ease 0.1s both" } : { opacity: 0 }}
          >
            Inteligência que o mercado
            <br />
            <span className="text-cyan-400" style={{ textShadow: "0 0 30px rgba(34,211,238,0.3)" }}>não te dá de graça</span>
          </h2>
          <p
            className="mt-4 text-white/40 text-lg font-light"
            style={isVisible ? { animation: "fadeInUp 0.5s ease 0.2s both" } : { opacity: 0 }}
          >
            Cada módulo foi construído com base em como traders institucionais operam.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const a = ACCENT[f.accent] || ACCENT.cyan;
            return (
              <div
                key={f.title}
                className={`group relative rounded-2xl border bg-[#0d0f17] p-6 overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1 ${a.border}`}
                style={isVisible ? {
                  animation: `fadeInUp 0.5s ease ${0.1 + i * 0.07}s both`,
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.03)`,
                } : { opacity: 0 }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at top left, ${a.glow}, transparent 70%)` }}
                />

                {/* Tag */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${a.border} ${a.text} ${a.bg}`}>
                    {f.tag}
                  </span>
                </div>

                {/* Icon */}
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 border ${a.border} ${a.bg}`}>
                  <f.icon className={`h-5 w-5 ${a.text}`} />
                </div>

                <h3 className="font-black text-white text-lg mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">{f.description}</p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-6 right-6 h-px ${a.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
