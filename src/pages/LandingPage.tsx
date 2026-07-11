import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bot, Brain, Zap, BarChart3, Shield, Activity, TrendingUp, TrendingDown, ChevronRight, Star } from "lucide-react";

// ───────────────────────────────────────────────
// MINI ANIMATED CHART (SVG path)
// ───────────────────────────────────────────────
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const area = `M ${pts[0]} L ${pts.join(" L ")} L ${w},${h} L 0,${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ───────────────────────────────────────────────
// DATA
// ───────────────────────────────────────────────
const TICKERS = [
  { symbol: "BTC", price: "104,820", change: "+2.34%", bull: true,  data: [38,42,40,55,50,62,58,72,68,80,75,88] },
  { symbol: "ETH", price: "3,891",   change: "+1.87%", bull: true,  data: [30,35,32,45,40,50,48,60,55,65,62,70] },
  { symbol: "SOL", price: "182.4",   change: "-0.92%", bull: false, data: [80,75,78,65,70,60,62,50,55,45,48,40] },
  { symbol: "BNB", price: "715",     change: "+3.11%", bull: true,  data: [40,45,42,55,52,65,62,72,70,80,78,88] },
  { symbol: "XRP", price: "2.41",    change: "-1.05%", bull: false, data: [70,65,68,55,60,50,52,42,45,35,38,30] },
  { symbol: "AVAX", price: "39.7",   change: "+4.22%", bull: true,  data: [30,38,35,48,44,58,54,65,62,72,70,82] },
];

const MODULES = [
  {
    icon: Bot,
    badge: "NOVO",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    title: "Bot de Compra Inteligente",
    desc: "Executa ordens automaticamente com base nos sinais do motor de IA — entry, stop e take profit gerenciados sem esforço.",
    color: "#34d399",
    glow: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.15)",
  },
  {
    icon: Brain,
    badge: "IA",
    badgeColor: "text-violet-400 border-violet-500/30 bg-violet-500/10",
    title: "Score de Confluência IA",
    desc: "Motor proprietário que analisa RSI, MACD, Fibonacci, Bollinger, funding rate e sentimento on-chain em tempo real.",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.15)",
  },
  {
    icon: Activity,
    badge: "LIVE",
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    title: "On-Chain Live Feed",
    desc: "Fluxo de exchange, Open Interest, liquidações, endereços whale e ratio Long/Short atualizados em milissegundos.",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.12)",
    border: "rgba(34,211,238,0.15)",
  },
  {
    icon: BarChart3,
    badge: "PRO",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    title: "Heatmap de Liquidez",
    desc: "Visualize onde baleias têm posições abertas. Orderbook heatmap em tempo real com zonas de liquidação precisas.",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.15)",
  },
  {
    icon: TrendingUp,
    badge: "MULTI-TF",
    badgeColor: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    title: "RSI Multi-Timeframe",
    desc: "Heatmap RSI em 15m, 1h, 4h e 1D para identificar zonas de exaustão com máxima precisão estatística.",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.12)",
    border: "rgba(56,189,248,0.15)",
  },
  {
    icon: Shield,
    badge: "SEGURO",
    badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    title: "Simulador de Risco",
    desc: "Calcule alavancagem, liquidação e risco de portfólio antes de entrar. Proteja seu capital com precisão institucional.",
    color: "#fb7185",
    glow: "rgba(251,113,133,0.12)",
    border: "rgba(251,113,133,0.15)",
  },
];

const TESTIMONIALS = [
  { name: "Rafael M.", role: "Trader há 6 anos", text: "O bot de compra me economizou horas. Entro no sinal, saio no lucro.", stars: 5 },
  { name: "Camila T.", role: "Analista técnica", text: "O score de confluência é cirúrgico. Nunca vi algo assim em plataforma BR.", stars: 5 },
  { name: "Lucas O.", role: "Swing trader", text: "O heatmap de liquidez mudou como eu leio o mercado completamente.", stars: 5 },
];

// ───────────────────────────────────────────────
// COMPONENTS
// ───────────────────────────────────────────────
function TickerCard({ t }: { t: typeof TICKERS[0] }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">{t.symbol}</span>
          <span className={`text-[11px] font-mono font-bold ${t.bull ? "text-emerald-400" : "text-red-400"}`}>{t.change}</span>
        </div>
        <div className="text-white/40 text-[11px] font-mono mt-0.5">${t.price}</div>
      </div>
      <MiniChart data={t.data} color={t.bull ? "#34d399" : "#f87171"} />
    </div>
  );
}

function ModuleCard({ m }: { m: typeof MODULES[0] }) {
  return (
    <div className="group relative rounded-2xl border p-6 overflow-hidden cursor-default hover:-translate-y-1 transition-all duration-300"
      style={{ background: "#0b0d14", borderColor: m.border, boxShadow: `0 0 0 1px rgba(255,255,255,0.02)` }}>
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 0% 0%, ${m.glow}, transparent 60%)` }} />
      {/* Badge */}
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest mb-4 ${m.badgeColor}`}>
        {m.badge}
      </div>
      {/* Icon */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center border"
          style={{ background: `${m.color}15`, borderColor: `${m.color}25` }}>
          <m.icon className="h-5 w-5" style={{ color: m.color }} />
        </div>
        <h3 className="font-bold text-white text-[15px] leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {m.title}
        </h3>
      </div>
      <p className="text-[13px] text-white/40 leading-relaxed">{m.desc}</p>
      <div className="flex items-center gap-1 mt-4 text-[11px] font-medium transition-colors" style={{ color: m.color, opacity: 0.7 }}>
        Ver módulo <ChevronRight className="h-3 w-3" />
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// MAIN LANDING PAGE (replaces all sections)
// ───────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKERS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#07080d", fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes gridMove { from{background-position:0 0} to{background-position:0 60px} }
        @keyframes glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes scan { 0%{top:-2px;opacity:0} 10%{opacity:.6} 90%{opacity:.6} 100%{top:100%;opacity:0} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .anim-1{animation:fadeUp .7s ease .1s both}
        .anim-2{animation:fadeUp .7s ease .2s both}
        .anim-3{animation:fadeUp .7s ease .35s both}
        .anim-4{animation:fadeUp .7s ease .5s both}
        .anim-5{animation:fadeUp .7s ease .65s both}
        .mono{font-family:'JetBrains Mono','Courier New',monospace}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: "rgba(7,8,13,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-black text-sm"
              style={{ background: "linear-gradient(135deg, #22d3ee, #06b6d4)", boxShadow: "0 0 16px rgba(34,211,238,0.4)" }}>M</div>
            <span className="font-bold text-xl text-white tracking-tight">Matrix</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            {["Módulos", "IA & Bot", "Planos", "Comunidade"].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Entrar
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="text-sm font-bold text-black px-5 py-2 rounded-lg transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #22d3ee, #06b6d4)", boxShadow: "0 0 16px rgba(34,211,238,0.3)" }}>
              Começar Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* Glows */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />
        {/* Scan line */}
        <div className="absolute left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)", animation: "scan 8s linear infinite" }} />

        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="anim-1 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                style={{ borderColor: "rgba(34,211,238,0.2)", background: "rgba(34,211,238,0.05)" }}>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="mono text-[11px] text-cyan-400 tracking-widest">LIVE · 17.370 ATIVOS MONITORADOS</span>
              </div>

              {/* Headline */}
              <div className="anim-2 space-y-2">
                <h1 className="font-bold leading-[1] tracking-tight text-white"
                  style={{ fontSize: "clamp(3rem, 6vw, 5rem)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Veja o que o<br />
                  mercado <span style={{ color: "#22d3ee", textShadow: "0 0 50px rgba(34,211,238,0.5)" }}>esconde</span>
                </h1>
                <p className="text-white/40 text-lg font-light leading-relaxed max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Dados on-chain, sinal de IA, bot de compra automático e heatmap de liquidez — tudo em uma tela.
                </p>
              </div>

              {/* Feature pills */}
              <div className="anim-3 flex flex-wrap gap-2">
                {[
                  { label: "Bot IA de Compra", color: "#34d399" },
                  { label: "On-Chain Live", color: "#22d3ee" },
                  { label: "Score Confluência", color: "#a78bfa" },
                  { label: "Whale Tracker", color: "#fbbf24" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border"
                    style={{ borderColor: `${color}25`, background: `${color}0d`, color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="anim-4 flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate("/dashboard")}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-black text-sm transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", boxShadow: "0 8px 32px rgba(34,211,238,0.3)" }}>
                  Acessar o Terminal <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate("/dashboard")}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-white/70 text-sm border transition-all hover:bg-white/[0.05]"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  Ver Demonstração
                </button>
              </div>

              {/* Stats */}
              <div className="anim-5 flex items-center gap-8 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {[
                  { v: "8.2k+", l: "Traders Ativos" },
                  { v: "24/7", l: "Monitoramento" },
                  { v: "150+", l: "Indicadores" },
                  { v: "99.9%", l: "Uptime" },
                ].map(s => (
                  <div key={s.l}>
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk'" }}>{s.v}</div>
                    <div className="mono text-[10px] text-white/30 mt-0.5 uppercase tracking-widest">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Terminal preview */}
            <div className="relative flex justify-center anim-3" style={{ animation: "fadeUp .7s ease .4s both, float 4s ease-in-out 1s infinite" }}>
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.08) 0%, transparent 70%)" }} />

              <div className="w-full max-w-[420px] rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#0b0d14", boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 80px rgba(34,211,238,0.04)" }}>

                {/* Terminal header */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex items-center gap-2 mono text-[10px] text-white/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" style={{ animation: "blink 1.5s ease infinite" }} />
                    MATRIX TERMINAL · LIVE
                  </div>
                  <div className="mono text-[9px] text-white/20">BTC/USDT</div>
                </div>

                {/* Price */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="mono text-3xl font-bold text-white" style={{ textShadow: "0 0 20px rgba(34,211,238,0.2)" }}>
                        $104,820
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-emerald-400 text-sm font-bold mono">+2.34% ↑</span>
                        <span className="mono text-[10px] text-white/25">24h</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mono text-[10px] text-white/30">RSI 14</div>
                      <div className="mono text-lg font-bold text-amber-400">62.4</div>
                    </div>
                  </div>
                </div>

                {/* SVG chart */}
                <div className="px-4 pb-2">
                  <svg viewBox="0 0 320 80" className="w-full h-16">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,70 L35,55 L70,60 L105,40 L140,45 L175,25 L210,30 L245,15 L280,20 L320,8 L320,80 L0,80Z" fill="url(#chartGrad)" />
                    <path d="M0,70 L35,55 L70,60 L105,40 L140,45 L175,25 L210,30 L245,15 L280,20 L320,8" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
                    {/* Signal dot */}
                    <circle cx="245" cy="15" r="4" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
                  </svg>
                </div>

                {/* AI Signal box */}
                <div className="mx-4 mb-3 px-4 py-3 rounded-xl border" style={{ background: "rgba(34,211,238,0.06)", borderColor: "rgba(34,211,238,0.2)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-cyan-400" />
                      <span className="mono text-[11px] font-bold text-cyan-400 uppercase tracking-widest">IA · SINAL DE COMPRA</span>
                    </div>
                    <span className="mono text-[11px] font-bold text-white">+8 pts</span>
                  </div>
                  <div className="h-1.5 rounded-full mb-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full w-[74%]" style={{ background: "linear-gradient(90deg, #22d3ee, #06b6d4)", boxShadow: "0 0 8px rgba(34,211,238,0.5)" }} />
                  </div>
                  <div className="flex justify-between mono text-[9px] text-white/30">
                    <span>CONFLUÊNCIA</span><span className="text-cyan-400 font-bold">74% · ALTA</span>
                  </div>
                </div>

                {/* Bot status */}
                <div className="mx-4 mb-4 px-4 py-3 rounded-xl border flex items-center gap-3" style={{ background: "rgba(52,211,153,0.05)", borderColor: "rgba(52,211,153,0.15)" }}>
                  <Bot className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <div className="mono text-[10px] text-emerald-400 font-bold uppercase tracking-widest">BOT ATIVO</div>
                    <div className="text-[11px] text-white/40 mt-0.5">Ordem preparada · Entry: $104.200</div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-400" style={{ animation: "blink 1s ease infinite" }} />
                </div>

                {/* On-chain strip */}
                <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                  {[
                    { l: "Funding", v: "-0.010%", c: "#22d3ee" },
                    { l: "OI 24h",  v: "+3.94%",  c: "#34d399" },
                    { l: "Liq 24h", v: "$14.2M",  c: "#fbbf24" },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="rounded-lg px-2 py-2 text-center border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.04)" }}>
                      <div className="mono text-[8px] text-white/25 uppercase">{l}</div>
                      <div className="mono text-[12px] font-bold mt-0.5" style={{ color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom ticker */}
        <div className="absolute bottom-0 left-0 right-0 h-10 border-t flex items-center overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.5)" }}>
          <div className="flex gap-12 whitespace-nowrap" style={{ animation: "ticker 30s linear infinite" }}>
            {[...TICKERS, ...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
              <span key={i} className="flex items-center gap-2 mono text-[11px]">
                <span className="text-white/40">{t.symbol}/USDT</span>
                <span className="text-white font-bold">${t.price}</span>
                <span className={t.bull ? "text-emerald-400" : "text-red-400"}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKET TICKER CARDS ── */}
      <section className="py-16 border-b" style={{ background: "#09090f", borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mono">Mercado Agora</h2>
            <span className="flex items-center gap-2 mono text-[11px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {TICKERS.map(t => <TickerCard key={t.symbol} t={t} />)}
          </div>
        </div>
      </section>

      {/* ── MODULES / FEATURES ── */}
      <section id="modules" className="py-28" style={{ background: "#07080d" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mono text-[11px] text-violet-400 mb-6 uppercase tracking-widest"
              style={{ borderColor: "rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.05)" }}>
              <Zap className="h-3 w-3" /> 6 Módulos Exclusivos
            </div>
            <h2 className="font-bold text-white mb-4" style={{ fontSize: "clamp(2rem,4vw,3.5rem)", fontFamily: "'Space Grotesk'" }}>
              Tudo que um trader<br />
              <span style={{ color: "#a78bfa", textShadow: "0 0 40px rgba(167,139,250,0.4)" }}>profissional precisa</span>
            </h2>
            <p className="text-white/40 text-lg max-w-lg mx-auto">
              Cada módulo foi desenhado para substituir uma plataforma inteira.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map(m => <ModuleCard key={m.title} m={m} />)}
          </div>
        </div>
      </section>

      {/* ── AI BOT SECTION ── */}
      <section id="bot" className="py-28 border-y" style={{ background: "#09090f", borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left - copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mono text-[11px] text-emerald-400 uppercase tracking-widest"
                style={{ borderColor: "rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.05)" }}>
                <Bot className="h-3 w-3" /> Bot de Compra com IA
              </div>
              <h2 className="font-bold text-white leading-tight" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontFamily: "'Space Grotesk'" }}>
                Seu robô opera enquanto<br />
                <span style={{ color: "#34d399", textShadow: "0 0 40px rgba(52,211,153,0.4)" }}>você dorme</span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed">
                O bot lê o score de confluência da IA, aguarda a zona de entrada ideal e executa a ordem automaticamente — com stop e take profit já configurados.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Detecta zonas de sobre-venda no RSI", ok: true },
                  { label: "Confirma com Funding Rate negativo", ok: true },
                  { label: "Monitora Liquidações e Open Interest", ok: true },
                  { label: "Executa ordem e gerencia a posição", ok: true },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-white/60">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
                      <span className="text-emerald-400 text-[10px] font-black">✓</span>
                    </div>
                    {label}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #34d399, #10b981)", boxShadow: "0 8px 24px rgba(52,211,153,0.3)" }}>
                <Bot className="h-4 w-4" /> Ativar o Bot Agora
              </button>
            </div>
            {/* Right - bot status card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, rgba(52,211,153,0.07) 0%, transparent 70%)" }} />
              <div className="relative rounded-2xl overflow-hidden border p-6 space-y-4"
                style={{ background: "#0b0d14", borderColor: "rgba(52,211,153,0.15)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
                {/* Bot header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-emerald-400" />
                    <span className="mono text-xs font-bold text-emerald-400 uppercase tracking-widest">Matrix Bot v2.0</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full border text-emerald-400 mono text-[10px] font-bold uppercase"
                    style={{ borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.08)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animation: "blink 1s ease infinite" }} />
                    Ativo
                  </div>
                </div>
                {/* Divider */}
                <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                {/* Recent signals */}
                {[
                  { sym: "BTC", action: "COMPRA", price: "$103,200", pnl: "+4.2%", t: "2h atrás", bull: true },
                  { sym: "ETH", action: "COMPRA", price: "$3,810", pnl: "+2.8%", t: "5h atrás", bull: true },
                  { sym: "SOL", action: "AGUARD.", price: "$178", pnl: "—", t: "Próximo...", bull: null },
                ].map(({ sym, action, price, pnl, t, bull }) => (
                  <div key={sym} className="flex items-center justify-between rounded-xl px-4 py-3 border"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-[11px] text-black"
                        style={{ background: bull === true ? "#34d399" : bull === false ? "#f87171" : "#94a3b8" }}>
                        {sym[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{sym}</div>
                        <div className={`mono text-[10px] font-bold ${bull ? "text-emerald-400" : bull === false ? "text-red-400" : "text-white/30"}`}>{action}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mono text-[11px] text-white/60">{price}</div>
                      <div className={`mono text-[11px] font-bold ${pnl.startsWith("+") ? "text-emerald-400" : "text-white/30"}`}>{pnl}</div>
                    </div>
                    <div className="mono text-[10px] text-white/20">{t}</div>
                  </div>
                ))}
                {/* PnL Summary */}
                <div className="rounded-xl p-4 border" style={{ background: "rgba(52,211,153,0.05)", borderColor: "rgba(52,211,153,0.15)" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50">Retorno este mês</span>
                    <span className="text-2xl font-bold text-emerald-400 mono">+18.7%</span>
                  </div>
                  <div className="h-1.5 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full w-[65%]" style={{ background: "linear-gradient(90deg, #34d399, #10b981)", boxShadow: "0 0 8px rgba(52,211,153,0.4)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24" style={{ background: "#07080d" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-bold text-white text-3xl md:text-4xl" style={{ fontFamily: "'Space Grotesk'" }}>
              O que os traders falam
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl p-6 border" style={{ background: "#0b0d14", borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-white/30 text-xs mono">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden border-t" style={{ background: "#09090f", borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.05) 0%, transparent 60%)" }} />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-8">
          <h2 className="font-bold text-white leading-tight" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontFamily: "'Space Grotesk'" }}>
            Pare de perder operações.<br />
            <span style={{ color: "#22d3ee", textShadow: "0 0 40px rgba(34,211,238,0.4)" }}>Comece a operar com dados.</span>
          </h2>
          <p className="text-white/40 text-lg">Acesse o terminal completo. Sem cartão de crédito.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-black text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #22d3ee, #06b6d4)", boxShadow: "0 8px 32px rgba(34,211,238,0.35)" }}>
              Criar Conta Grátis <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-medium text-white/60 text-sm border transition-all hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              Ver o Dashboard <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-10" style={{ background: "#05060a", borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center font-black text-black text-xs"
              style={{ background: "linear-gradient(135deg, #22d3ee, #06b6d4)" }}>M</div>
            <span className="font-bold text-white">Matrix</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            {["Termos", "Privacidade", "Contato"].map(l => (
              <a key={l} href="#" className="hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
          <p className="mono text-[11px] text-white/20">© 2025 Matrix. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
