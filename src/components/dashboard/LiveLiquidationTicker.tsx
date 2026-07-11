import { useEffect, useRef, useState } from "react";
import { useGlobalLiquidations } from "@/lib/api/liquidation";

export function LiveLiquidationTicker() {
  const liquidations = useGlobalLiquidations(50);
  const [scrollX, setScrollX] = useState(0);
  const animRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let pos = 0;
    const speed = 0.7;
    const step = () => {
      if (contentRef.current) {
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

  if (!liquidations.length) return null;

  const items = [...liquidations, ...liquidations].slice(0, 40);

  return (
    <div className="w-full h-7 flex items-center bg-black/70 border-b border-white/[0.03] overflow-hidden">
      {/* Label */}
      <div className="shrink-0 h-full flex items-center gap-2 px-3 border-r border-white/[0.06] bg-red-500/5">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-red-400 whitespace-nowrap">Liquidações Live</span>
      </div>

      {/* Scroll area */}
      <div ref={containerRef} className="flex-1 overflow-hidden h-full relative">
        <div
          ref={contentRef}
          className="flex items-center h-full"
          style={{ transform: `translateX(${scrollX}px)`, willChange: "transform" }}
        >
          {[...items, ...items].map((liq, i) => (
            <div key={i} className="flex items-center shrink-0 px-4 gap-1.5 border-r border-white/[0.03] h-full">
              <span className={`text-[8px] font-black font-mono ${liq.side === "SELL" ? "text-red-400" : "text-cyan-400"}`}>
                {liq.side === "SELL" ? "🔴" : "🟢"} {liq.symbol}
              </span>
              <span className="text-[8px] text-muted-foreground/60 font-mono">
                {liq.side === "SELL" ? "LONG" : "SHORT"} ${(liq.usdValue / 1000).toFixed(1)}K
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
