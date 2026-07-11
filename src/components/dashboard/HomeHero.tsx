import TradingViewChart from "./TradingViewChart";
import { useMarkets, useGlobalData, useFearGreed, type CoinGeckoMarket } from "@/lib/api/coingecko";
import { Bitcoin, Gem, Globe, PieChart, Gauge, BarChart3, TrendingUp, TrendingDown } from "lucide-react";

function fmtUsd(n: number | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(4)}`;
}

interface IdxProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: number | null;
  glow: string; // cor do glow/borda
}
function IndexCard({ icon: Icon, label, value, change, glow }: IdxProps) {
  const up = (change ?? 0) >= 0;
  return (
    <div
      className="relative glass-card rounded-xl border bg-black/50 p-3 overflow-hidden group hover:-translate-y-0.5 transition-transform"
      style={{ borderColor: `${glow}33` }}
    >
      <div className="absolute -right-3 -top-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-16 w-16" style={{ color: glow }} />
      </div>
      <div className="relative z-10">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{label}</div>
        <div className="text-lg font-black font-mono text-white leading-tight mt-1">{value}</div>
        {change !== undefined && change !== null && (
          <div className={`inline-flex items-center gap-1 text-[10px] font-black font-mono mt-1 ${up ? "text-emerald-400" : "text-rose-400"}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}{change.toFixed(2)}%
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />
    </div>
  );
}

function fgMeta(v: number) {
  if (v <= 25) return { t: "Medo Extremo", c: "#f43f5e" };
  if (v <= 45) return { t: "Medo", c: "#fb923c" };
  if (v <= 54) return { t: "Neutro", c: "#eab308" };
  if (v <= 74) return { t: "Ganância", c: "#84cc16" };
  return { t: "Ganância Extrema", c: "#10b981" };
}

export function HomeHero() {
  const { data: markets } = useMarkets(1, 100);
  const globalQ = useGlobalData();
  const { data: fg } = useFearGreed();

  const find = (s: string) => markets?.find((m) => m.symbol?.toLowerCase() === s);
  const btc = find("btc");
  const eth = find("eth");
  const g = globalQ.data?.data;
  const fgv = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;
  const fgm = fgv !== undefined ? fgMeta(fgv) : null;

  // principais mercados por volume
  const byVolume: CoinGeckoMarket[] = markets
    ? [...markets].sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0)).slice(0, 8)
    : [];
  const maxVol = byVolume[0]?.total_volume ?? 1;

  return (
    <div className="space-y-4">
      {/* Gráfico BTC + índices visuais */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        {/* Chart */}
        <div className="glass-card rounded-xl overflow-hidden border-white/[0.06] bg-black/50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-black text-white tracking-wide">BTC/USDT</span>
              {btc && <span className="text-sm font-black font-mono text-white">{fmtUsd(btc.current_price)}</span>}
              {btc?.price_change_percentage_24h_in_currency != null && (
                <span className={`text-[11px] font-black font-mono ${btc.price_change_percentage_24h_in_currency >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {btc.price_change_percentage_24h_in_currency >= 0 ? "+" : ""}{btc.price_change_percentage_24h_in_currency.toFixed(2)}%
                </span>
              )}
            </div>
            <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> ao vivo
            </span>
          </div>
          <div className="h-[360px]">
            <TradingViewChart
              symbol="BINANCE:BTCUSDT"
              interval="60"
              theme="dark"
              autosize
              studies={["Volume@tv-basicstudies", "RSI@tv-basicstudies"]}
            />
          </div>
        </div>

        {/* Índices */}
        <div className="grid grid-cols-2 gap-3 content-start">
          <IndexCard icon={Bitcoin} label="Bitcoin" value={fmtUsd(btc?.current_price)} change={btc?.price_change_percentage_24h_in_currency} glow="#f7931a" />
          <IndexCard icon={Gem} label="Ethereum" value={fmtUsd(eth?.current_price)} change={eth?.price_change_percentage_24h_in_currency} glow="#818cf8" />
          <IndexCard icon={Globe} label="Market Cap" value={fmtUsd(g?.total_market_cap?.usd)} change={g?.market_cap_change_percentage_24h_usd} glow="#2dd4bf" />
          <IndexCard icon={BarChart3} label="Volume 24h" value={fmtUsd(g?.total_volume?.usd)} glow="#a78bfa" />
          <IndexCard icon={PieChart} label="Domin. BTC" value={g?.market_cap_percentage?.btc ? `${g.market_cap_percentage.btc.toFixed(1)}%` : "—"} glow="#fb923c" />
          <IndexCard icon={Gauge} label={fgm ? `F&G · ${fgm.t}` : "Fear & Greed"} value={fgv !== undefined ? String(fgv) : "—"} glow={fgm?.c ?? "#eab308"} />
        </div>
      </div>

      {/* Principais mercados por volume */}
      <div className="glass-card rounded-xl border-white/[0.06] bg-black/50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Principais Mercados · Volume 24h</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
          {byVolume.map((c) => {
            const chg = c.price_change_percentage_24h_in_currency ?? 0;
            return (
              <div key={c.id} className="bg-black/50 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <img src={c.image} alt="" className="h-5 w-5 rounded-full" loading="lazy" />
                  <span className="text-[11px] font-black tracking-wide text-white">{c.symbol?.toUpperCase()}</span>
                  <span className={`ml-auto text-[10px] font-black font-mono ${chg >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {chg >= 0 ? "+" : ""}{chg.toFixed(1)}%
                  </span>
                </div>
                <div className="text-[11px] font-mono text-white/90">{fmtUsd(c.current_price)}</div>
                <div className="text-[9px] font-mono text-muted-foreground/60 mb-1">vol {fmtUsd(c.total_volume)}</div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-primary/60" style={{ width: `${Math.max(4, ((c.total_volume ?? 0) / maxVol) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
