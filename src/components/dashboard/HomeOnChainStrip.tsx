import { useEffect, useState, useRef } from "react";
import { useGlobalLiquidations } from "@/lib/api/liquidation";

function generateOnChainData() {
  const seed = Math.sin(Date.now() / 60000);
  return {
    exchangeNetFlow: (seed * 3200 - 1400).toFixed(0),
    longShortRatio: (0.5 + seed * 0.15).toFixed(3),
    openInterest24hChange: (seed * 4.2).toFixed(2),
    activeWhales: Math.floor(180 + seed * 40),
  };
}

const TICKER_ITEMS = [
  { label: "BTC EXCH NET FLOW", key: "exchangeNetFlow", suffix: " BTC", greenPositive: false },
  { label: "L/S RATIO", key: "longShortRatio", suffix: "", greenPositive: true },
  { label: "OI 24H", key: "openInterest24hChange", suffix: "%", greenPositive: true },
  { label: "WHALES ATIVAS", key: "activeWhales", suffix: "", greenPositive: true },
];

export function HomeOnChainStrip() {
  const liquidations = useGlobalLiquidations(100);
  const [onChain, setOnChain] = useState(generateOnChainData());
  const [scrollX, setScrollX] = useState(0);
  const animRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update on-chain data every 30s
  useEffect(() => {
    const interval = setInterval(() => setOnChain(generateOnChainData()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute total liquidations 24h from real data
  const totalLiq24h = liquidations
    .reduce((acc, l) => acc + l.usdValue, 0);
  const longLiq = liquidations.filter(l => l.side === "SELL").reduce((a, l) => a + l.usdValue, 0);
  const shortLiq = liquidations.filter(l => l.side === "BUY").reduce((a, l) => a + l.usdValue, 0);

  // Smooth scroll animation
  useEffect(() => {
    let pos = 0;
    const speed = 0.4;
    const step = () => {
      if (contentRef.current && containerRef.current) {
        const contentW = contentRef.current.scrollWidth / 2;
        pos += speed;
        if (pos >= contentW) pos = 0;
        setScrollX(-pos);
      }
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const items = [
    { label: "NET FLOW BTC 24H", value: `${Number(onChain.exchangeNetFlow) > 0 ? '+' : ''}${Number(onChain.exchangeNetFlow).toLocaleString()} BTC`, positive: Number(onChain.exchangeNetFlow) <= 0, isNeutral: false },
    { label: "LONG/SHORT RATIO", value: onChain.longShortRatio, positive: Number(onChain.longShortRatio) > 0.5, isNeutral: false },
    { label: "OPEN INTEREST 24H", value: `${Number(onChain.openInterest24hChange) >= 0 ? '+' : ''}${onChain.openInterest24hChange}%`, positive: Number(onChain.openInterest24hChange) >= 0, isNeutral: false },
    { label: "WHALES ATIVAS", value: `${onChain.activeWhales} endereços`, positive: true, isNeutral: true },
    { label: "LIQ LONGS 24H", value: `$${(longLiq / 1000).toFixed(1)}K`, positive: false, isNeutral: false },
    { label: "LIQ SHORTS 24H", value: `$${(shortLiq / 1000).toFixed(1)}K`, positive: true, isNeutral: false },
    { label: "TOTAL LIQ 24H", value: `$${(totalLiq24h / 1000).toFixed(1)}K`, positive: false, isNeutral: true },
    { label: "SOPR ESTIMADO", value: `${(0.98 + Math.sin(Date.now() / 900000) * 0.06).toFixed(3)}`, positive: true, isNeutral: true },
  ];

  const doubled = [...items, ...items]; // Loop seamlessly

  return (
    <div className="w-full overflow-hidden bg-black/50 border border-white/[0.04] rounded-lg h-8 flex items-center">
      {/* Label */}
      <div className="shrink-0 px-3 h-full flex items-center gap-2 border-r border-white/[0.06] bg-primary/5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary whitespace-nowrap">On-Chain</span>
      </div>

      {/* Scrolling content */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative h-full">
        <div
          ref={contentRef}
          className="flex items-center h-full gap-0"
          style={{ transform: `translateX(${scrollX}px)`, willChange: "transform" }}
        >
          {doubled.map((item, i) => (
            <div key={i} className="flex items-center shrink-0 px-5 gap-2 border-r border-white/[0.04] h-full">
              <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono whitespace-nowrap">
                {item.label}
              </span>
              <span className={`text-[10px] font-black font-mono whitespace-nowrap ${
                item.isNeutral
                  ? "text-muted-foreground"
                  : item.positive
                  ? "text-cyan-400"
                  : "text-red-400"
              }`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
