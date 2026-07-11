import { useFearGreed } from "@/lib/api/coingecko";
import { AlertTriangle, TrendingUp, X, Zap } from "lucide-react";
import { useState } from "react";

export function MacroBanner() {
  const { data: fg } = useFearGreed();
  const [dismissed, setDismissed] = useState(false);

  const fgValue = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : null;

  if (dismissed || fgValue === null) return null;

  let banner: {
    type: "buy" | "sell" | null;
    bg: string;
    border: string;
    icon: typeof AlertTriangle;
    iconColor: string;
    title: string;
    subtitle: string;
    pulse: string;
  } | null = null;

  if (fgValue <= 25) {
    banner = {
      type: "buy",
      bg: "from-cyan-950/60 to-black/80",
      border: "border-cyan-500/30",
      icon: TrendingUp,
      iconColor: "text-cyan-400",
      title: "MEDO EXTREMO DETECTADO",
      subtitle: `Fear & Greed: ${fgValue} — Janela histórica de DCA institucional aberta. Estatisticamente, compras neste nível geram +40% em 90 dias.`,
      pulse: "bg-cyan-500",
    };
  } else if (fgValue >= 80) {
    banner = {
      type: "sell",
      bg: "from-red-950/60 to-black/80",
      border: "border-red-500/30",
      icon: AlertTriangle,
      iconColor: "text-red-400",
      title: "GANÂNCIA EXTREMA — ALERTA DE TOPO",
      subtitle: `Fear & Greed: ${fgValue} — Baleias distribuindo. Considere realizar parciais e reduzir alavancagem. Alta probabilidade de correção.`,
      pulse: "bg-red-500",
    };
  }

  if (!banner) return null;

  return (
    <div
      className={`w-full bg-gradient-to-r ${banner.bg} border ${banner.border} rounded-xl px-5 py-3 flex items-center justify-between gap-4 shadow-glow-sm animate-fade-in`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${banner.border} shrink-0`}>
          <banner.icon className={`h-4 w-4 ${banner.iconColor} animate-pulse`} />
        </div>
        <div className="flex items-center gap-4 min-w-0">
          <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${banner.iconColor} whitespace-nowrap shrink-0`}>
            {banner.title}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono leading-relaxed truncate hidden md:block">
            {banner.subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${banner.pulse} animate-ping opacity-75`} />
          <span className="text-[9px] text-muted-foreground/50 uppercase font-mono tracking-widest hidden sm:block">Live</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-white/10 transition-colors text-muted-foreground/40 hover:text-muted-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
