import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EnrichedCoin, getClassBg } from "@/lib/signalEngine";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, Minus, Target, Zap, Clock,
  ArrowRight, BarChart3, Activity
} from "lucide-react";

interface DailyTopSetupsProps {
  coins: EnrichedCoin[];
  isLoading?: boolean;
  timeframe?: "24h" | "7d" | "30d";
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function ConfidenceRing({ value }: { value: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 70 ? "#22d3ee" : value >= 45 ? "#facc15" : "#f87171";

  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="26" cy="26" r={r} fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
      <text x="26" y="26" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="900" fill={color} fontFamily="monospace">
        {value}%
      </text>
    </svg>
  );
}

export function DailyTopSetups({ coins, isLoading, timeframe = "24h" }: DailyTopSetupsProps) {
  const navigate = useNavigate();

  const topSetups = useMemo(() => {
    if (!coins.length) return [];

    // Top 3 buys
    const buys = coins
      .filter(c => c.signal.total >= 4)
      .sort((a, b) => b.signal.total - a.signal.total)
      .slice(0, 2);

    // Top 1 sell
    const sells = coins
      .filter(c => c.signal.total <= -2)
      .sort((a, b) => a.signal.total - b.signal.total)
      .slice(0, 1);

    return [...buys, ...sells].slice(0, 3);
  }, [coins]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="glass-card h-52 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!topSetups.length) {
    return (
      <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center gap-3 border-white/5">
        <Activity className="h-8 w-8 text-muted-foreground/30" />
        <span className="text-xs text-muted-foreground/50 uppercase tracking-widest font-mono">
          Aguardando setups de alta probabilidade...
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {topSetups.map((coin) => {
        const isBuy = coin.signal.total >= 0;
        const change24h = coin.price_change_percentage_24h_in_currency ?? 0;
        const topReasons = coin.signal.reasons.slice(0, 3);

        // Confidence mapped from score
        const rawScore = coin.signal.total;
        const confidence = Math.min(100, Math.max(0, Math.round(((rawScore + 12) / 24) * 100)));

        const borderGlow = isBuy
          ? "border-cyan-500/25 shadow-[0_4px_30px_rgba(34,211,238,0.08)]"
          : "border-red-500/25 shadow-[0_4px_30px_rgba(248,113,113,0.08)]";

        const accentColor = isBuy ? "text-cyan-400" : "text-red-400";
        const accentBg = isBuy ? "bg-cyan-500/10" : "bg-red-500/10";

        const setupLabel = isBuy
          ? (coin.signal.total >= 8 ? "COMPRA INSTITUCIONAL" : "ALTA TÉCNICA")
          : "DISTRIBUIÇÃO";

        const Icon = isBuy ? TrendingUp : TrendingDown;

        return (
          <div
            key={coin.id}
            className={`glass-card rounded-2xl p-5 border ${borderGlow} relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300`}
            onClick={() => navigate(`/dashboard/analysis/${coin.symbol.toUpperCase()}USDT`)}
          >
            {/* Background accent */}
            <div className={`absolute -top-8 -right-8 h-28 w-28 rounded-full ${accentBg} blur-3xl opacity-40 group-hover:opacity-70 transition-opacity`} />

            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full ring-1 ring-white/10" />
                <div>
                  <div className="font-black text-lg font-mono tracking-tighter leading-none">{coin.symbol.toUpperCase()}</div>
                  <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">{coin.name}</div>
                </div>
              </div>
              <ConfidenceRing value={confidence} />
            </div>

            {/* Signal badge + price */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] font-black px-2 py-1 uppercase tracking-widest ${accentBg} ${accentColor} border-none`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {setupLabel}
                </Badge>
                {coin.signal.confluence === "High" && (
                  <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20 uppercase font-bold h-5">
                    Alta Confluência
                  </Badge>
                )}
              </div>
            </div>

            {/* Price info */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="font-black text-xl font-mono">{formatPrice(coin.current_price)}</div>
              <span className={`text-sm font-mono font-bold ${change24h >= 0 ? "text-cyan-400" : "text-red-400"}`}>
                {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
              </span>
            </div>

            {/* Key metrics row */}
            <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
              <div className="rounded-lg bg-black/40 border border-white/5 p-2 text-center">
                <div className="text-[8px] text-muted-foreground/60 uppercase tracking-widest mb-0.5">RSI</div>
                <div className={`text-xs font-mono font-black ${coin.rsi <= 30 ? "text-cyan-400" : coin.rsi >= 70 ? "text-red-400" : "text-muted-foreground"}`}>
                  {Math.round(coin.rsi)}
                </div>
              </div>
              <div className="rounded-lg bg-black/40 border border-white/5 p-2 text-center">
                <div className="text-[8px] text-muted-foreground/60 uppercase tracking-widest mb-0.5">Score</div>
                <div className={`text-xs font-mono font-black ${accentColor}`}>
                  {rawScore > 0 ? "+" : ""}{rawScore}
                </div>
              </div>
              <div className="rounded-lg bg-black/40 border border-white/5 p-2 text-center">
                <div className="text-[8px] text-muted-foreground/60 uppercase tracking-widest mb-0.5">FR</div>
                <div className={`text-xs font-mono font-black ${coin.indicators.fundingRate !== undefined && coin.indicators.fundingRate < 0 ? "text-cyan-400" : "text-muted-foreground/60"}`}>
                  {coin.indicators.fundingRate !== undefined ? `${(coin.indicators.fundingRate * 100).toFixed(3)}%` : "—"}
                </div>
              </div>
            </div>

            {/* Top reasons */}
            <div className="space-y-1.5 mb-4 relative z-10">
              {topReasons.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <span className={`font-mono font-bold w-6 text-right shrink-0 ${r.points > 0 ? "text-cyan-400" : "text-red-400"}`}>
                    {r.points > 0 ? "+" : ""}{r.points}
                  </span>
                  <span className="text-muted-foreground/70 truncate">{r.description}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:brightness-125 relative z-10 ${accentBg} ${accentColor} border-current/20`}
              onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/analysis/${coin.symbol.toUpperCase()}USDT`); }}
            >
              Analisar Ativo <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
