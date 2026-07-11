import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, TrendingDown, Zap, Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// Animated candlestick data
const CANDLES = [
  { open: 40, close: 65, high: 72, low: 35, bull: true },
  { open: 65, close: 58, high: 70, low: 52, bull: false },
  { open: 58, close: 78, high: 85, low: 55, bull: true },
  { open: 78, close: 70, high: 82, low: 65, bull: false },
  { open: 70, close: 88, high: 94, low: 68, bull: true },
  { open: 88, close: 76, high: 91, low: 72, bull: false },
  { open: 76, close: 92, high: 98, low: 73, bull: true },
  { open: 92, close: 84, high: 96, low: 80, bull: false },
  { open: 84, close: 96, high: 100, low: 81, bull: true },
  { open: 96, close: 88, high: 99, low: 84, bull: false },
];

// Live ticker items
const TICKERS = [
  { symbol: "BTC", price: "104,820", change: "+2.34%", bull: true },
  { symbol: "ETH", price: "3,891", change: "+1.87%", bull: true },
  { symbol: "SOL", price: "182.4", change: "-0.92%", bull: false },
  { symbol: "BNB", price: "715", change: "+3.11%", bull: true },
  { symbol: "XRP", price: "2.41", change: "-1.05%", bull: false },
  { symbol: "AVAX", price: "39.7", change: "+4.22%", bull: true },
];

function MiniCandles() {
  return (
    <div className="flex items-end gap-[3px] h-[120px]">
      {CANDLES.map((c, i) => {
        const scale = 120;
        const bodyTop = Math.min(c.open, c.close);
        const bodyBot = Math.max(c.open, c.close);
        const bodyH = Math.max(2, ((bodyBot - bodyTop) / 100) * scale);
        const bodyOffset = ((100 - bodyBot) / 100) * scale;
        const wickTop = ((100 - c.high) / 100) * scale;
        const wickBot = ((100 - c.low) / 100) * scale;
        const color = c.bull ? "#22d3ee" : "#f87171";
        const glow = c.bull ? "rgba(34,211,238,0.5)" : "rgba(248,113,113,0.5)";

        return (
          <div
            key={i}
            className="relative flex flex-col items-center"
            style={{
              width: 14,
              height: scale,
              animation: `fadeInUp 0.4s ease ${i * 0.06}s both`,
            }}
          >
            {/* Wick */}
            <div
              className="absolute w-[1px]"
              style={{
                background: color,
                top: wickTop,
                height: wickBot - wickTop,
                left: "50%",
                transform: "translateX(-50%)",
                opacity: 0.6,
              }}
            />
            {/* Body */}
            <div
              className="absolute rounded-[2px] w-[10px]"
              style={{
                background: color,
                top: bodyOffset,
                height: bodyH,
                boxShadow: `0 0 6px ${glow}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function FloatingTicker({ symbol, price, change, bull, delay }: { symbol: string; price: string; change: string; bull: boolean; delay: number }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-sm text-xs font-mono"
      style={{ animation: `floatY 3s ease-in-out ${delay}s infinite alternate` }}
    >
      <span className="font-black text-white">{symbol}</span>
      <span className="text-muted-foreground">${price}</span>
      <span className={bull ? "text-cyan-400 font-bold" : "text-red-400 font-bold"}>
        {bull ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
        {change}
      </span>
    </div>
  );
}

function GridLines() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export function HeroSection() {
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % TICKERS.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-[#07080d]">
      <style>{`
        @keyframes floatY { from { transform: translateY(0px); } to { transform: translateY(-10px); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rotateSlow { from { transform: rotateY(0deg) rotateX(8deg); } to { transform: rotateY(360deg) rotateX(8deg); } }
        @keyframes scanLine { 0%,100% { top: 0; opacity:0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity: 0.3; } }
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      <GridLines />

      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/[0.05] rounded-full blur-[120px] pointer-events-none" />

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" style={{ animation: "scanLine 6s linear infinite" }} />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ─── LEFT: COPY ─── */}
          <div className="space-y-8" style={{ animation: "fadeInUp 0.6s ease 0.1s both" }}>
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-mono text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              LIVE · Mercado Aberto · +17.370 Ativos
            </div>

            <div>
              <h1 className="font-black text-5xl md:text-6xl lg:text-7xl tracking-[-0.03em] leading-[0.95] text-white">
                Veja o que
                <br />
                o mercado{" "}
                <span
                  className="relative inline-block"
                  style={{ color: "#22d3ee", textShadow: "0 0 40px rgba(34,211,238,0.4)" }}
                >
                  esconde
                </span>
              </h1>
              <p className="mt-6 text-lg text-white/50 max-w-md leading-relaxed font-light">
                Dados on-chain, fluxo de baleias, liquidações, RSI multi-timeframe e sinais de alta probabilidade — tudo mastigado, em tempo real.
              </p>
            </div>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Zap, label: "Sinais Automáticos" },
                { icon: Activity, label: "On-Chain Live" },
                { icon: Shield, label: "Score de Confluência" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-xs text-white/60 font-mono"
                >
                  <Icon className="h-3 w-3 text-cyan-400" />
                  {label}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                style={{ background: "linear-gradient(135deg, #22d3ee, #06b6d4)", boxShadow: "0 0 20px rgba(34,211,238,0.25)" }}
              >
                Entrar no Terminal
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-bold text-white/70 hover:bg-white/[0.08] transition-all"
              >
                Ver Demo
              </button>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 pt-2 border-t border-white/[0.05]">
              {[
                { value: "24/7", label: "Monitoramento" },
                { value: "150+", label: "Indicadores" },
                { value: "8.2k", label: "Traders" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-white" style={{ textShadow: "0 0 20px rgba(34,211,238,0.3)" }}>{s.value}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── RIGHT: 3D VISUAL ─── */}
          <div className="relative flex items-center justify-center" style={{ animation: "fadeInUp 0.6s ease 0.3s both" }}>
            {/* Floating tickers */}
            <div className="absolute -top-4 -left-4 z-20" style={{ animation: "floatY 3.2s ease-in-out 0s infinite alternate" }}>
              <FloatingTicker {...TICKERS[0]} delay={0} />
            </div>
            <div className="absolute top-8 -right-6 z-20" style={{ animation: "floatY 2.8s ease-in-out 0.5s infinite alternate" }}>
              <FloatingTicker {...TICKERS[1]} delay={0.5} />
            </div>
            <div className="absolute bottom-4 -left-8 z-20" style={{ animation: "floatY 3.5s ease-in-out 1s infinite alternate" }}>
              <FloatingTicker {...TICKERS[2]} delay={1} />
            </div>
            <div className="absolute -bottom-2 right-0 z-20" style={{ animation: "floatY 2.5s ease-in-out 0.3s infinite alternate" }}>
              <FloatingTicker {...TICKERS[3]} delay={0.3} />
            </div>

            {/* Main terminal card */}
            <div
              className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d0f17] overflow-hidden relative"
              style={{
                boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(34,211,238,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
                transform: "perspective(1000px) rotateY(-8deg) rotateX(4deg)",
              }}
            >
              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-black/30">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  MATRIX · LIVE FEED
                </div>
                <div className="text-[10px] text-white/20 font-mono">BTC/USDT 1H</div>
              </div>

              {/* Price header */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white font-mono" style={{ textShadow: "0 0 20px rgba(34,211,238,0.3)" }}>
                    $104,820
                  </span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">+2.34%</span>
                </div>
                <div className="text-[10px] text-white/30 font-mono mt-1">RSI(14): 62.4 · MACD: +240 · BB: MID</div>
              </div>

              {/* Candlestick chart */}
              <div className="px-4 pb-4">
                <MiniCandles />
                {/* Volume bars */}
                <div className="flex items-end gap-[3px] h-[28px] mt-1">
                  {CANDLES.map((c, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-[1px]"
                      style={{
                        height: `${20 + Math.random() * 80}%`,
                        background: c.bull ? "rgba(34,211,238,0.2)" : "rgba(248,113,113,0.2)",
                        animation: `fadeInUp 0.4s ease ${i * 0.06 + 0.5}s both`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Signal indicator */}
              <div className="mx-4 mb-4 p-3 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400">COMPRA INSTITUCIONAL</span>
                  </div>
                  <span className="text-[11px] font-mono font-black text-white">Score +8</span>
                </div>
                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 w-[72%]" style={{ boxShadow: "0 0 8px rgba(34,211,238,0.5)" }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] text-white/30 font-mono">CONFLUÊNCIA</span>
                  <span className="text-[8px] text-cyan-400 font-mono font-black">72%</span>
                </div>
              </div>

              {/* On-chain mini strip */}
              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Funding", value: "-0.010%", neg: true },
                  { label: "OI 24h", value: "+3.94%", neg: false },
                  { label: "Liq 24h", value: "$14M", neg: false },
                ].map(({ label, value, neg }) => (
                  <div key={label} className="text-center bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">
                    <div className="text-[8px] text-white/30 uppercase font-mono">{label}</div>
                    <div className={`text-[11px] font-mono font-black mt-0.5 ${neg ? "text-cyan-400" : "text-white/80"}`}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Scan effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" style={{ animation: "scanLine 4s linear 1s infinite" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ticker scroll */}
      <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-white/[0.04] bg-black/60 overflow-hidden flex items-center">
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: "tickerScroll 30s linear infinite" }}>
          {[...TICKERS, ...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-white/50">{t.symbol}/USDT</span>
              <span className="text-white font-bold">${t.price}</span>
              <span className={t.bull ? "text-cyan-400" : "text-red-400"}>{t.change}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
