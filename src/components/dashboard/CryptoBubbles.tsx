import { useMemo } from "react";
import { useMarkets, type CoinGeckoMarket } from "@/lib/api/coingecko";
import { useNavigate } from "react-router-dom";
import { Circle } from "lucide-react";
import { InfoHint } from "./InfoHint";

/**
 * Crypto Bubbles nativo — bolhas por market cap (tamanho) e variação 24h (cor).
 * Dado real da CoinGecko. Clicar leva pra análise da moeda.
 */
export function CryptoBubbles({ count = 40 }: { count?: number }) {
  const { data: markets } = useMarkets(1, 100);
  const navigate = useNavigate();

  const top = useMemo<CoinGeckoMarket[]>(() => (markets ? markets.slice(0, count) : []), [markets, count]);
  const maxCap = useMemo(() => Math.max(...top.map((c) => c.market_cap ?? 0), 1), [top]);

  const bubbleColor = (chg: number) => {
    const a = Math.min(0.85, 0.25 + Math.abs(chg) / 15);
    return chg >= 0 ? `rgba(16,185,129,${a})` : `rgba(244,63,94,${a})`;
  };
  const borderColor = (chg: number) => (chg >= 0 ? "rgba(16,185,129,0.6)" : "rgba(244,63,94,0.6)");

  return (
    <div className="glass-card rounded-xl border-white/[0.06] bg-black/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
        <Circle className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Crypto Bubbles</h3>
        <InfoHint term="Crypto Bubbles" what="Cada bolha é uma moeda. Tamanho = market cap (peso no mercado). Cor = variação 24h: verde subindo, vermelho caindo (mais forte = mais intenso)." how="Vê num relance quem pesa e quem está bombando/sangrando. Clique numa bolha pra abrir a análise." />
        <span className="ml-auto text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">top {count} · 24h</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-4 min-h-[220px]">
        {top.map((c) => {
          const chg = c.price_change_percentage_24h_in_currency ?? 0;
          const size = 34 + Math.sqrt((c.market_cap ?? 0) / maxCap) * 72; // 34..106px
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/dashboard/analysis/${c.symbol?.toUpperCase()}USDT`)}
              title={`${c.name} · ${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`}
              className="rounded-full flex flex-col items-center justify-center shrink-0 transition-transform hover:scale-110 hover:z-10"
              style={{
                width: size,
                height: size,
                background: bubbleColor(chg),
                border: `1px solid ${borderColor(chg)}`,
                boxShadow: Math.abs(chg) > 6 ? `0 0 14px ${borderColor(chg)}` : "none",
              }}
            >
              <span className="font-black text-white leading-none" style={{ fontSize: Math.max(8, size / 6) }}>
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
