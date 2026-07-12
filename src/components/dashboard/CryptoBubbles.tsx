import { useEffect, useMemo, useRef } from "react";
import { useMarkets, type CoinGeckoMarket } from "@/lib/api/coingecko";
import { useNavigate } from "react-router-dom";
import { Circle } from "lucide-react";
import { InfoHint } from "./InfoHint";

interface Body {
  x: number; y: number; vx: number; vy: number; r: number;
}

/**
 * Crypto Bubbles nativo — bolhas FLUTUANDO (física: paredes + colisão) numa caixa contida.
 * Tamanho = market cap · Cor = variação 24h. Dado real CoinGecko. Clique abre a análise.
 */
export function CryptoBubbles({ count = 40 }: { count?: number }) {
  const { data: markets } = useMarkets(1, 100);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const bodiesRef = useRef<Body[]>([]);
  const elsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const top = useMemo<CoinGeckoMarket[]>(() => (markets ? markets.slice(0, count) : []), [markets, count]);
  const maxCap = useMemo(() => Math.max(...top.map((c) => c.market_cap ?? 0), 1), [top]);
  const sizes = useMemo(() => top.map((c) => 30 + Math.sqrt((c.market_cap ?? 0) / maxCap) * 80), [top, maxCap]);

  // chave estável: só re-semeia posições quando a LISTA de moedas muda (não a cada refetch de preço)
  const idsKey = useMemo(() => top.map((c) => c.id).join(","), [top]);

  const bubbleColor = (chg: number) => {
    const a = Math.min(0.85, 0.28 + Math.abs(chg) / 14);
    return chg >= 0 ? `rgba(16,185,129,${a})` : `rgba(244,63,94,${a})`;
  };
  const borderColor = (chg: number) => (chg >= 0 ? "rgba(16,185,129,0.65)" : "rgba(244,63,94,0.65)");

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !top.length) return;
    const W = el.clientWidth || 800;
    const H = el.clientHeight || 440;

    // posições iniciais espalhadas (determinístico por índice p/ não pular no primeiro frame)
    bodiesRef.current = top.map((_, i) => {
      const r = sizes[i] / 2;
      const gx = ((i * 137) % Math.max(1, Math.floor(W - 2 * r))) + r;
      const gy = (((i * 89) % Math.max(1, Math.floor(H - 2 * r))) + r);
      const ang = (i * 0.618) * Math.PI * 2;
      return { r, x: gx, y: gy, vx: Math.cos(ang) * 0.35, vy: Math.sin(ang) * 0.35 };
    });

    // posiciona já no lugar certo (evita flash no canto)
    bodiesRef.current.forEach((p, i) => {
      const e = elsRef.current[i];
      if (e) e.style.transform = `translate(${p.x - p.r}px, ${p.y - p.r}px)`;
    });

    let running = true;
    const step = () => {
      if (!running) return;
      const w = el.clientWidth || W;
      const h = el.clientHeight || H;
      const b = bodiesRef.current;

      for (const p of b) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x - p.r < 0) { p.x = p.r; p.vx = Math.abs(p.vx); }
        if (p.x + p.r > w) { p.x = w - p.r; p.vx = -Math.abs(p.vx); }
        if (p.y - p.r < 0) { p.y = p.r; p.vy = Math.abs(p.vy); }
        if (p.y + p.r > h) { p.y = h - p.r; p.vy = -Math.abs(p.vy); }
      }

      // colisão simples (empurra + troca componente normal)
      for (let i = 0; i < b.length; i++) {
        for (let j = i + 1; j < b.length; j++) {
          const a = b[i], c = b[j];
          const dx = c.x - a.x, dy = c.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const min = a.r + c.r + 2;
          if (dist < min) {
            const overlap = (min - dist) / 2;
            const nx = dx / dist, ny = dy / dist;
            a.x -= nx * overlap; a.y -= ny * overlap;
            c.x += nx * overlap; c.y += ny * overlap;
            const avn = a.vx * nx + a.vy * ny;
            const cvn = c.vx * nx + c.vy * ny;
            a.vx += (cvn - avn) * nx; a.vy += (cvn - avn) * ny;
            c.vx += (avn - cvn) * nx; c.vy += (avn - cvn) * ny;
          }
        }
      }

      for (let i = 0; i < b.length; i++) {
        const p = b[i];
        // leve deriva p/ nunca parar de flutuar
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;
        const sp = Math.hypot(p.vx, p.vy);
        const maxsp = 0.55, minsp = 0.12;
        if (sp > maxsp) { p.vx = (p.vx / sp) * maxsp; p.vy = (p.vy / sp) * maxsp; }
        else if (sp < minsp && sp > 0) { p.vx = (p.vx / sp) * minsp; p.vy = (p.vy / sp) * minsp; }
        const e = elsRef.current[i];
        if (e) e.style.transform = `translate(${p.x - p.r}px, ${p.y - p.r}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return (
    <div className="glass-card rounded-xl border-white/[0.06] bg-black/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
        <Circle className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Crypto Bubbles</h3>
        <InfoHint term="Crypto Bubbles" what="Cada bolha é uma moeda. Tamanho = market cap (peso no mercado). Cor = variação 24h: verde subindo, vermelho caindo (mais forte = mais intenso)." how="Vê num relance quem pesa e quem está bombando/sangrando. Clique numa bolha pra abrir a análise." />
        <span className="ml-auto text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">top {count} · 24h</span>
      </div>
      <div ref={containerRef} className="relative w-full h-[440px] overflow-hidden">
        {top.map((c, i) => {
          const chg = c.price_change_percentage_24h_in_currency ?? 0;
          const size = sizes[i];
          return (
            <button
              key={c.id}
              ref={(el) => { elsRef.current[i] = el; }}
              onClick={() => navigate(`/dashboard/analysis/${c.symbol?.toUpperCase()}USDT`)}
              title={`${c.name} · ${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`}
              className="absolute top-0 left-0 rounded-full flex flex-col items-center justify-center will-change-transform hover:z-10 hover:brightness-125 transition-[filter]"
              style={{
                width: size,
                height: size,
                background: bubbleColor(chg),
                border: `1px solid ${borderColor(chg)}`,
                boxShadow: Math.abs(chg) > 6 ? `0 0 16px ${borderColor(chg)}` : "none",
              }}
            >
              <span className="font-black text-white leading-none" style={{ fontSize: Math.max(8, size / 5.5) }}>
                {c.symbol?.toUpperCase()}
              </span>
              <span className="font-mono text-white/90 leading-none mt-0.5" style={{ fontSize: Math.max(7, size / 8) }}>
                {chg >= 0 ? "+" : ""}{chg.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
