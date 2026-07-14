import TradingViewChart from "./TradingViewChart";
import { TradFiTicker } from "./TradFiTicker";
import { TermometrosPanel } from "./TermometrosPanel";
import { useMarkets } from "@/lib/api/coingecko";
import { Bitcoin } from "lucide-react";

function fmtUsd(n: number | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  if (n >= 1) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(4)}`;
}

/**
 * Topo da home: mercados INTERNACIONAIS (Ouro, S&P500, NASDAQ, DXY, VIX, Brent — via TradingView)
 * + gráfico do BTC ao vivo. Sem duplicar os índices de cripto que já vivem no terminal abaixo.
 */
export function HomeHero() {
  const { data: markets } = useMarkets(1, 50);
  const btc = markets?.find((m) => m.symbol?.toLowerCase() === "btc");
  const chg = btc?.price_change_percentage_24h_in_currency;

  return (
    <div className="space-y-4">
      {/* Mercados internacionais — Ouro, S&P 500, NASDAQ, DXY, VIX, Brent */}
      <TradFiTicker />

      {/* Gráfico BTC + Termômetros lado a lado */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <div className="xl:col-span-2 glass-card rounded-xl overflow-hidden border-white/[0.06] bg-black/50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-black text-white tracking-wide">BTC/USDT</span>
              {btc && <span className="text-sm font-black font-mono text-white">{fmtUsd(btc.current_price)}</span>}
              {chg != null && (
                <span className={`text-[11px] font-black font-mono ${chg >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                </span>
              )}
            </div>
            <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> ao vivo · Binance
            </span>
          </div>
          <div className="h-[440px]">
            <TradingViewChart
              symbol="BINANCE:BTCUSDT"
              interval="60"
              theme="dark"
              autosize
              studies={["Volume@tv-basicstudies", "RSI@tv-basicstudies"]}
            />
          </div>
        </div>

        {/* Termômetros compactos ao lado */}
        <TermometrosPanel />
      </div>
    </div>
  );
}
