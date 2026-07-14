import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bot, Brain, Shield, Activity, CheckCircle2, Wallet, BarChart3 } from "lucide-react";

function Typewriter({ words }: { words: string[] }) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[idx % words.length];
    const t = setTimeout(() => {
      if (!del) {
        setText(word.slice(0, text.length + 1));
        if (text.length + 1 === word.length) setTimeout(() => setDel(true), 2200);
      } else {
        setText(word.slice(0, text.length - 1));
        if (text.length - 1 === 0) {
          setDel(false);
          setIdx((i) => i + 1);
        }
      }
    }, del ? 24 : 48);
    return () => clearTimeout(t);
  }, [text, del, idx, words]);
  return (
    <span>
      {text}
      <span style={{ display: "inline-block", width: 2, height: "0.85em", background: "#10B981", marginLeft: 3, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite", boxShadow: "0 0 10px #10B981" }} />
    </span>
  );
}

function LiveChart({ id = "a", delay = 0 }: { id?: string; delay?: number }) {
  const ref = useRef<SVGPathElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setOn(true);
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const D = "M0,90 L70,80 L140,86 L210,52 L280,60 L350,26 L420,32 L490,10 L560,2";
  return (
    <svg viewBox="0 0 560 100" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id={`fg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[25, 50, 75].map((y) => (
        <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      <path d={D} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="5 5" />
      {on && (
        <path d={`${D} L560,100 L0,100 Z`} fill={`url(#fg-${id})`} style={{ animation: "fadein 0.8s ease both", animationDelay: `${delay + 0.8}s`, opacity: 0 }} />
      )}
      <path
        ref={ref}
        d={D}
        fill="none"
        stroke="#10B981"
        strokeWidth="2.8"
        strokeLinecap="round"
        filter={`url(#glow-${id})`}
        style={{
          strokeDasharray: 1300,
          strokeDashoffset: on ? 0 : 1300,
          transition: on ? `stroke-dashoffset 2.6s cubic-bezier(0.4,0,0.2,1) ${delay}s` : "none"
        }}
      />
      {on && (
        <>
          <circle cx="210" cy="52" r="5" fill="#10B981" style={{ animation: `pop 0.3s ${delay + 1.1}s both`, opacity: 0 }} />
          <text
            x="220"
            y="57"
            fill="#6EE7B7"
            fontSize="9"
            fontWeight="700"
            fontFamily="monospace"
            letterSpacing="0.09em"
            style={{ animation: `pop 0.3s ${delay + 1.1}s both`, opacity: 0 }}
          >
            LONG ENTRY
          </text>
          <circle cx="560" cy="2" r="5" fill="#fff" style={{ animation: `pop 0.3s ${delay + 2.7}s both`, opacity: 0 }} />
          <text
            x="462"
            y="8"
            fill="#fff"
            fontSize="9"
            fontWeight="700"
            fontFamily="monospace"
            letterSpacing="0.09em"
            style={{ animation: `pop 0.3s ${delay + 2.7}s both`, opacity: 0 }}
          >
            TAKE PROFIT
          </text>
        </>
      )}
    </svg>
  );
}

const TICKERS = [
  { s: "BTC/USDT", p: "$104,820", c: "+2.34%", up: true },
  { s: "ETH/USDT", p: "$3,891", c: "+1.87%", up: true },
  { s: "SOL/USDT", p: "$182.40", c: "−0.92%", up: false },
  { s: "BNB/USDT", p: "$715", c: "+3.11%", up: true },
  { s: "XRP/USDT", p: "$2.41", c: "−1.05%", up: false },
  { s: "AVAX/USDT", p: "$39.70", c: "+4.22%", up: true }
];

const FEATURES = [
  { icon: Bot, label: "Bot Executor", desc: "Entra, gerencia e sai de posições por API. Zero intervenção humana." },
  { icon: Brain, label: "Score Confluência", desc: "40+ indicadores destilados num único número de decisão ao vivo." },
  { icon: Activity, label: "On-Chain ao Vivo", desc: "Open interest, liquidações e fluxo institucional em tempo real." },
  { icon: Wallet, label: "IA Portfolio", desc: "Audita cada moeda sua e emite alertas antes de quedas expressivas." },
  { icon: BarChart3, label: "RSI Multi-Timeframe", desc: "Alinhamento de tendência do M5 ao Weekly em um único painel." },
  { icon: Shield, label: "Simulação de Risco", desc: "Calcula drawdown e margem de segurança antes de cada execução." }
];

const WORDS = [
  "A IA encontra o fundo exato para você comprar.",
  "Liquida posições antes de qualquer despejo institucional.",
  "Gerencia toda sua carteira sem emoções.",
  "Transforma dados on-chain em sinais cirúrgicos."
];

export function LandingPage() {
  const nav = useNavigate();
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "#03040A", color: "#fff", width: "100%", height: "100%", overflowX: "hidden", overflowY: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@500;700&display=swap');

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

        .mono { font-family: 'JetBrains Mono', monospace; }
        .tag  { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }

        @keyframes blink   { 50%{ opacity:0; } }
        @keyframes fadein  { from{opacity:0} to{opacity:1} }
        @keyframes pop     { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes slideup { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes orb1    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.1)} }
        @keyframes orb2    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(0.9)} }
        @keyframes orb3    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,20px) scale(1.05)} }
        @keyframes scanline{ 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes border-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes float   { 0%,100%{transform:perspective(1000px) rotateX(6deg) rotateY(-1deg) translateY(0)} 50%{transform:perspective(1000px) rotateX(5deg) rotateY(1deg) translateY(-10px)} }
        @keyframes pulse-em{ 0%,100%{opacity:1;box-shadow:0 0 8px currentColor} 50%{opacity:0.35;box-shadow:none} }
        @keyframes gridmove{ from{background-position:0 0} to{background-position:0 60px} }

        .su  { animation: slideup 0.75s cubic-bezier(0.16,1,0.3,1) both; }
        .d1  { animation-delay:0.05s; } .d2{animation-delay:0.15s;} .d3{animation-delay:0.25s;} .d4{animation-delay:0.38s;} .d5{animation-delay:0.52s;}

        /* animated grid bg */
        .hero-grid {
          position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.038) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.038) 1px, transparent 1px);
          background-size:60px 60px;
          animation: gridmove 12s linear infinite;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 80%);
        }

        /* orbs */
        .orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }

        /* scanline sweep */
        .scanline {
          position:absolute; left:0; right:0; height:2px; z-index:1;
          background:linear-gradient(90deg,transparent,rgba(16,185,129,0.25),transparent);
          animation: scanline 8s ease-in-out infinite;
          pointer-events:none;
        }

        /* terminal perspective */
        .terminal-3d {
          animation: float 7s ease-in-out infinite;
          will-change: transform;
        }

        /* glowing border on terminal using pseudo via wrapper */
        .term-glow-wrap {
          position:relative; border-radius:20px; padding:1px;
          background: linear-gradient(135deg, rgba(16,185,129,0.4), rgba(99,102,241,0.2) 40%, rgba(16,185,129,0.1) 80%, rgba(16,185,129,0.35));
          background-size:200% 200%;
          animation: shimmer 6s ease infinite;
        }

        /* pill */
        .pill { display:inline-flex; align-items:center; gap:8px; border-radius:99px; padding:6px 16px; }

        /* feat card */
        .fc {
          background:rgba(255,255,255,0.022);
          border:1px solid rgba(255,255,255,0.065);
          border-radius:16px; padding:28px;
          transition:all 0.25s;
        }
        .fc:hover {
          background:rgba(255,255,255,0.042);
          border-color:rgba(16,185,129,0.28);
          transform:translateY(-4px);
          box-shadow:0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(16,185,129,0.1);
        }

        /* pricing */
        .price-free {
          background:rgba(255,255,255,0.022);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:22px; padding:40px;
          transition:all 0.25s;
        }
        .price-free:hover { transform:translateY(-5px); box-shadow:0 28px 70px rgba(0,0,0,0.5); }

        .price-pro {
          border-radius:22px; padding:40px; position:relative; overflow:hidden;
          background:linear-gradient(145deg,#0B1E15 0%,#050B0E 100%);
          border:1px solid rgba(16,185,129,0.32);
          box-shadow:0 0 0 1px rgba(16,185,129,0.07), 0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06);
          transition:all 0.25s;
        }
        .price-pro:hover { transform:translateY(-5px); box-shadow:0 0 0 1px rgba(16,185,129,0.25), 0 40px 100px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.08); }

        /* btn */
        .btn-primary {
          display:inline-flex; align-items:center; justify-content:center; gap:9px;
          padding:15px 30px; border-radius:13px; font-weight:700; font-size:15px;
          background:linear-gradient(135deg,#10B981,#059669); color:#fff; border:none; cursor:pointer;
          box-shadow:0 0 30px rgba(16,185,129,0.4), 0 4px 16px rgba(0,0,0,0.35);
          transition:transform 0.18s, box-shadow 0.18s; white-space:nowrap;
        }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 0 45px rgba(16,185,129,0.6), 0 8px 24px rgba(0,0,0,0.45); }

        .btn-ghost {
          display:inline-flex; align-items:center; justify-content:center; gap:9px;
          padding:15px 30px; border-radius:13px; font-weight:600; font-size:15px;
          background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.75);
          border:1px solid rgba(255,255,255,0.12); cursor:pointer;
          transition:all 0.18s; white-space:nowrap;
        }
        .btn-ghost:hover { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.22); transform:translateY(-2px); }

        .divider { border:none; border-top:1px solid rgba(255,255,255,0.055); margin:0; }
      `}</style>
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 62,
        background: "rgba(3,4,10,0.6)",
        backdropFilter: "blur(28px) saturate(200%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.04)",
        display: "flex",
        alignItems: "center"
      }}>
        <div style={{ maxWidth: 1320, width: "100%", margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => nav("/")}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: "linear-gradient(135deg,#10B981,#059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 16,
              color: "#fff",
              boxShadow: "0 0 22px rgba(16,185,129,0.5)"
            }}>M</div>
            <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.035em" }}>Matrix</span>
          </div>
          <div style={{ display: "flex", gap: 36, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.42)" }}>
            {[["#hero", "Início"], ["#tecnologia", "Tecnologia"], ["#ia-carteira", "IA Carteira"], ["#recursos", "Recursos"], ["#precos", "Preços"]].map(
              ([h, l]) => (
                <a
                  key={l}
                  href={h}
                  style={{ color: "inherit", textDecoration: "none", transition: "color 0.18s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}
                >
                  {l}
                </a>
              )
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => nav("/dashboard")}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.42)", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "8px 10px", transition: "color 0.18s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}
            >
              Acessar
            </button>
            <button onClick={() => nav("/dashboard")} className="btn-primary" style={{ padding: "10px 22px", fontSize: 13, borderRadius: 10 }}>Matrix PRO</button>
          </div>
        </div>
      </nav>
      <section id="hero" style={{ position: "relative", overflow: "hidden", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 82 }}>
        <div className="hero-grid" />
        <div className="scanline" />
        <div className="orb" style={{
          width: 700,
          height: 700,
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle,rgba(16,185,129,0.16),transparent 65%)",
          animation: "orb1 10s ease-in-out infinite"
        }} />
        <div className="orb" style={{
          width: 500,
          height: 500,
          bottom: "10%",
          left: "-10%",
          background: "radial-gradient(circle,rgba(99,102,241,0.12),transparent 65%)",
          animation: "orb2 13s ease-in-out infinite"
        }} />
        <div className="orb" style={{
          width: 400,
          height: 400,
          top: "20%",
          right: "-8%",
          background: "radial-gradient(circle,rgba(6,182,212,0.09),transparent 65%)",
          animation: "orb3 9s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          pointerEvents: "none",
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 860, width: "100%", padding: "0 32px", textAlign: "center" }}>
          <div className="su d1 pill" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.22)", color: "#FDA4AF", marginBottom: 28, display: "inline-flex", backdropFilter: "blur(8px)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F43F5E", animation: "pulse-em 2s infinite", color: "#F43F5E", flexShrink: 0 }} />
            <span className="tag" style={{ color: "#FDA4AF" }}>Medo Extremo · Índice 12/100 · Oportunidade Detectada</span>
          </div>
          <h1 className="su d2" style={{ fontSize: "clamp(2.6rem,4.8vw,4.6rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.06, marginBottom: 0, color: "#fff" }}>Todo o caos do mercado,</h1>
          <h1 className="su d2" style={{
            fontSize: "clamp(2.6rem,4.8vw,4.6rem)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 1.06,
            marginBottom: 0,
            backgroundImage: "linear-gradient(120deg,#10B981 5%,#34D399 50%,#6EE7B7 95%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite"
          }}>mastigado para você.</h1>
          <p className="su d3 mono" style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: "16px auto 24px", lineHeight: 1.65, maxWidth: 600, minHeight: 22 }}>
            <Typewriter words={WORDS} />
          </p>
          <div className="su d4" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => nav("/dashboard")} className="btn-primary">
              Começar Gratuitamente <ArrowRight size={16} />
            </button>
            <button onClick={() => nav("/dashboard")} className="btn-ghost">
              Conhecer Plano PRO <ArrowRight size={16} />
            </button>
          </div>
          <div className="su d5" style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
            {[
              "IA com Score ao vivo",
              "Bot executor automático",
              "Análise On-Chain em tempo real",
              "Alertas de Dump no Telegram"
            ].map((v) => (
              <div key={v} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
                {v}
              </div>
            ))}
          </div>
        </div>
        <div className="su d5" style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 870, padding: "18px 32px 0" }}>
          <div className="term-glow-wrap">
            <div className="terminal-3d" style={{
              borderRadius: 19,
              overflow: "hidden",
              background: "rgba(6,8,18,0.92)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)"
            }}>
              <div style={{
                background: "rgba(0,0,0,0.45)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                padding: "13px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                    <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}` }} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", animation: "pulse-em 2s infinite", color: "#10B981" }} />
                  <span className="tag" style={{ color: "rgba(255,255,255,0.3)" }}>MATRIX TERMINAL · CONFLUENCE SCANNER LIVE</span>
                </div>
                <span className="tag" style={{ color: "rgba(255,255,255,0.18)" }}>v8.4</span>
              </div>
              <div style={{ padding: "26px 28px 22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginBottom: 22 }}>
                  <div style={{ paddingRight: 24, borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="tag" style={{ color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>Ativo · BTC/USDT</div>
                    <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.045em", marginBottom: 8 }}>$104,820</div>
                    <div style={{
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      borderRadius: 7,
                      padding: "4px 10px"
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>+2.34%</span>
                      <span className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.28)" }}>Vol: 42.1B</span>
                    </div>
                  </div>
                  <div style={{ padding: "0 24px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="tag" style={{ color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>Sentimento Global</div>
                    <div style={{
                      fontSize: 34,
                      fontWeight: 900,
                      color: "#F43F5E",
                      letterSpacing: "-0.04em",
                      marginBottom: 8,
                      textShadow: "0 0 24px rgba(244,63,94,0.45)"
                    }}>
                      12
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.22)", fontWeight: 500 }}>/100</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                      <div style={{
                        width: "12%",
                        height: "100%",
                        background: "linear-gradient(90deg,#BE123C,#F43F5E)",
                        borderRadius: 99,
                        boxShadow: "0 0 10px #F43F5E"
                      }} />
                    </div>
                    <div className="tag" style={{ color: "#FDA4AF" }}>Panic Sell · Zona de Compra</div>
                  </div>
                  <div style={{ paddingLeft: 24, textAlign: "right" }}>
                    <div className="tag" style={{ color: "#10B981", marginBottom: 10 }}>Matrix IA Score</div>
                    <div style={{
                      fontSize: 44,
                      fontWeight: 900,
                      color: "#10B981",
                      letterSpacing: "-0.04em",
                      textShadow: "0 0 28px rgba(16,185,129,0.5)",
                      marginBottom: 6
                    }}>
                      94
                      <span style={{ fontSize: 18 }}>%</span>
                    </div>
                    <div style={{
                      display: "inline-block",
                      background: "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      borderRadius: 7,
                      padding: "4px 10px"
                    }}>
                      <span className="tag" style={{ color: "#34D399" }}>Sinal Confirmado: Comprar</span>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span className="tag" style={{ color: "rgba(255,255,255,0.22)" }}>Projeção Neural Algorítmica</span>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>▲ Target $118,400</span>
                  </div>
                  <div style={{ height: 80 }}>
                    <LiveChart id="hero" delay={0.3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "linear-gradient(to bottom,transparent,rgba(3,4,10,0.6))",
          pointerEvents: "none",
          zIndex: 10
        }} />
      </section>
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.055)",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
        background: "rgba(0,0,0,0.4)",
        height: 42,
        overflow: "hidden",
        display: "flex",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", gap: 64, whiteSpace: "nowrap", animation: "ticker 36s linear infinite" }}>
          {[...TICKERS, ...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
            <div key={i} className="mono" style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>{t.s}</span>
              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.82)" }}>{t.p}</span>
              <span style={{ fontWeight: 700, color: t.up ? "#10B981" : "#F43F5E" }}>{t.c}</span>
            </div>
          ))}
        </div>
      </div>
      <section id="tecnologia" style={{ padding: "96px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          right: -60,
          top: -60,
          width: 480,
          height: 480,
          background: "radial-gradient(circle,rgba(16,185,129,0.08),transparent)",
          pointerEvents: "none"
        }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
              background: "rgba(16,185,129,0.07)",
              border: "1px solid rgba(16,185,129,0.18)",
              borderRadius: 9,
              padding: "7px 14px"
            }}>
              <Bot size={13} style={{ color: "#10B981" }} />
              <span className="tag" style={{ color: "#6EE7B7" }}>Execução sem emoções</span>
            </div>
            <h2 style={{ fontSize: "clamp(2.2rem,3.5vw,3.2rem)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.1, marginBottom: 20 }}>
              A matemática trabalha.{" "}
              <span style={{ backgroundImage: "linear-gradient(120deg,#10B981,#34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Você lucra.</span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.44)", lineHeight: 1.78, marginBottom: 28 }}>Conecte a Matrix à sua corretora via API. O bot atua 24h com stop e alvo definidos dinamicamente — sem que você precise apertar um botão sequer.</p>
            {["Gerencia múltiplos pares de forma simultânea.", "Zero FOMO — o bot não sente medo ou ganância.", "Stop Loss e Take Profit adaptativos por IA."].map(
              (t, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  background: "rgba(255,255,255,0.022)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 11,
                  padding: "13px 18px",
                  marginBottom: 10
                }}>
                  <CheckCircle2 size={17} style={{ color: "#10B981", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{t}</span>
                </div>
              )
            )}
          </div>
          <div
            style={{
              background: "rgba(6,8,18,0.88)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: 34,
              boxShadow: "0 28px 70px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.045)",
              transition: "transform 0.3s ease",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 260,
              height: 260,
              background: "radial-gradient(circle,rgba(16,185,129,0.07),transparent)",
              pointerEvents: "none"
            }} />
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              paddingBottom: 20,
              borderBottom: "1px solid rgba(255,255,255,0.055)"
            }}>
              <div>
                <div className="tag" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 5 }}>Módulo Execução IA</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>ETH/USDT · Posição em Curso</div>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.22)",
                borderRadius: 8,
                padding: "5px 11px"
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "pulse-em 2s infinite", color: "#10B981" }} />
                <span className="tag" style={{ color: "#34D399" }}>Gerenciando</span>
              </div>
            </div>
            <div style={{ height: 190 }}>
              <LiveChart id="bot" delay={0.2} />
            </div>
          </div>
        </div>
      </section>
      <hr className="divider" />
      <section id="ia-carteira" style={{ padding: "96px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          left: -60,
          bottom: -60,
          width: 440,
          height: 440,
          background: "radial-gradient(circle,rgba(99,102,241,0.09),transparent)",
          pointerEvents: "none"
        }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
          <div
            style={{
              background: "rgba(6,8,18,0.88)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: 34,
              boxShadow: "0 28px 70px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.045)",
              transition: "transform 0.3s ease",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 260,
              height: 260,
              background: "radial-gradient(circle,rgba(99,102,241,0.07),transparent)",
              pointerEvents: "none"
            }} />
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 22,
              paddingBottom: 18,
              borderBottom: "1px solid rgba(255,255,255,0.055)"
            }}>
              <div>
                <div className="tag" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 5 }}>Auditor de Portfólio IA</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Hot Wallet · 6 Ativos</div>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.22)",
                borderRadius: 8,
                padding: "5px 11px"
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818CF8", animation: "pulse-em 2s infinite", color: "#818CF8" }} />
                <span className="tag" style={{ color: "#A5B4FC" }}>Escaneando</span>
              </div>
            </div>
            {[
              { sym: "₿", n: "Bitcoin", sub: "Acumulação Institucional", a: "SEGURAR", ac: "#10B981", bg: "rgba(16,185,129,0.06)", br: "rgba(16,185,129,0.12)" },
              { sym: "S", n: "Solana", sub: "RSI 88 · Sobrecomprado", a: "VENDER AGORA", ac: "#F43F5E", bg: "rgba(244,63,94,0.05)", br: "rgba(244,63,94,0.2)" },
              { sym: "E", n: "Ethereum", sub: "Testando suporte", a: "COMPRAR MAIS", ac: "#10B981", bg: "rgba(16,185,129,0.04)", br: "rgba(255,255,255,0.07)" }
            ].map(
              (r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: r.bg,
                    border: `1px solid ${r.br}`,
                    borderRadius: 13,
                    padding: "15px 18px",
                    marginBottom: 10,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = r.bg.replace("0.0", "0.0").replace("rgba", "rgba"))}
                  onMouseLeave={(e) => (e.currentTarget.style.background = r.bg)}
                >
                  <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 15
                    }}>{r.sym}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.n}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>{r.sub}</div>
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: r.ac, letterSpacing: "0.08em" }}>{r.a}</span>
                </div>
              )
            )}
            <div style={{
              marginTop: 14,
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.18)",
              borderRadius: 13,
              padding: "16px 18px"
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <Brain size={13} style={{ color: "#818CF8" }} />
                <span className="tag" style={{ color: "#A5B4FC" }}>Diretriz da IA</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", lineHeight: 1.65 }}>Realize lucro em SOL. ETH mantém estrutura de alta — adicione posição com target em $4.800.</p>
            </div>
          </div>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
              background: "rgba(99,102,241,0.07)",
              border: "1px solid rgba(99,102,241,0.18)",
              borderRadius: 9,
              padding: "7px 14px"
            }}>
              <Wallet size={13} style={{ color: "#818CF8" }} />
              <span className="tag" style={{ color: "#A5B4FC" }}>Gestão Inteligente</span>
            </div>
            <h2 style={{ fontSize: "clamp(2.2rem,3.5vw,3.2rem)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.1, marginBottom: 20 }}>
              A IA gerencia o que{" "}
              <span style={{ backgroundImage: "linear-gradient(120deg,#818CF8,#C4B5FD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>você já comprou.</span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.44)", lineHeight: 1.78, marginBottom: 28 }}>O maior erro do trader é não saber quando vender. A Matrix rastreia cada ativo em tempo real e avisa antes de qualquer despejo institucional.</p>
            {["Monitora múltiplas moedas 24h por dia.", "Alerta no Telegram antes de correções severas.", "Indica o preço ideal para recompor posições."].map(
              (t, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  background: "rgba(255,255,255,0.022)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 11,
                  padding: "13px 18px",
                  marginBottom: 10
                }}>
                  <CheckCircle2 size={17} style={{ color: "#818CF8", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{t}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>
      <hr className="divider" />
      <section id="recursos" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.045em", marginBottom: 14 }}>A suíte completa de inteligência.</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto" }}>Seis ferramentas que substituem tudo que você paga hoje — num único painel ultrarrápido.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="fc">
                  <div className="tag" style={{ color: "rgba(255,255,255,0.25)", marginBottom: 18 }}>Módulo 0{i + 1}</div>
                  <Icon size={22} style={{ color: "#10B981", marginBottom: 14, filter: "drop-shadow(0 0 7px rgba(16,185,129,0.55))" }} />
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>{f.label}</div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section id="precos" style={{ padding: "96px 40px", background: "rgba(0,0,0,0.35)", borderTop: "1px solid rgba(255,255,255,0.055)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.045em", marginBottom: 14 }}>Escolha seu ponto de entrada.</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto" }}>Comece de graça ou desbloqueie toda a infraestrutura com o PRO.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 940, margin: "0 auto" }}>
            <div className="price-free">
              <div className="tag" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 22 }}>Gratuito</div>
              <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1, marginBottom: 8 }}>R$ 0</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 30 }}>Acesso vitalício · sem cartão de crédito</div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: 26 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 30 }}>
                {["Dashboard de mercado ao vivo", "Ticker de preços em tempo real", "1 par de moedas monitorado", "Sinais básicos de tendência"].map(
                  (t, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
                      <CheckCircle2 size={15} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                      {t}
                    </div>
                  )
                )}
              </div>
              <button onClick={() => nav("/dashboard")} className="btn-ghost" style={{ width: "100%", padding: "15px", borderRadius: 13 }}>Começar Grátis</button>
            </div>
            <div className="price-pro">
              <div style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "70%",
                height: 1,
                background: "linear-gradient(90deg,transparent,rgba(16,185,129,0.7),transparent)"
              }} />
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)" }}>
                <div className="tag" style={{
                  background: "linear-gradient(135deg,#10B981,#059669)",
                  color: "#fff",
                  padding: "5px 20px",
                  borderRadius: 99,
                  boxShadow: "0 4px 20px rgba(16,185,129,0.55)"
                }}>Mais Popular</div>
              </div>
              <div style={{
                position: "absolute",
                top: -50,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                height: 200,
                background: "radial-gradient(ellipse, rgba(16,185,129,0.12), transparent)",
                pointerEvents: "none"
              }} />
              <div className="tag" style={{ color: "#10B981", marginBottom: 22 }}>Matrix PRO</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, marginBottom: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.45)", paddingBottom: 7 }}>R$</span>
                <span style={{ fontSize: 76, fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1, color: "#fff" }}>15</span>
                <span style={{ fontSize: 36, fontWeight: 800, color: "rgba(255,255,255,0.4)", paddingBottom: 5 }}>,90</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", paddingBottom: 9, marginLeft: 2 }}>/mês</span>
              </div>
              <div className="tag" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 24 }}>Ou R$ 129 à vista anual · economize 32%</div>
              <div style={{ borderTop: "1px solid rgba(16,185,129,0.18)", marginBottom: 26 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 30 }}>
                {["Tudo do plano gratuito", "IA Score de Confluência ao vivo", "Heatmap de Liquidez Institucional", "Bot Executor via API (sem limite)", "Análise IA da sua Carteira Física", "Alertas no Telegram (Dump / Sinal)", "Grupo Alpha Privado exclusivo"].map(
                  (t, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, color: "rgba(255,255,255,0.82)" }}>
                      <CheckCircle2 size={15} style={{ color: "#10B981", flexShrink: 0, filter: "drop-shadow(0 0 4px rgba(16,185,129,0.6))" }} />
                      {t}
                    </div>
                  )
                )}
              </div>
              <button onClick={() => nav("/dashboard")} className="btn-primary" style={{ width: "100%", padding: "16px", borderRadius: 13, fontSize: 15 }}>
                Desbloquear Acesso Total <ArrowRight size={16} />
              </button>
              <p className="tag" style={{ textAlign: "center", marginTop: 14, color: "rgba(255,255,255,0.2)" }}>Cancele a qualquer momento · Suporte prioritário</p>
            </div>
          </div>
        </div>
      </section>
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.055)", padding: "36px 40px", background: "#020308" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg,#10B981,#059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 14,
              color: "#fff"
            }}>M</div>
            <span className="mono" style={{ fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>MATRIX INFRASTRUCTURE</span>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {[["Termos de Uso", "/termos"], ["Privacidade", "/privacidade"], ["Manual", "/manual"]].map(([l, href]) => (
              <a
                key={l}
                href={href}
                className="tag"
                style={{ color: "rgba(255,255,255,0.22)", textDecoration: "none", transition: "color 0.18s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
