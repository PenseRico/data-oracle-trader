import { useEffect, useMemo, useState } from "react";
import {
  useMarkets,
  useGlobalData,
  type CoinGeckoMarket,
} from "@/lib/api/coingecko";
import { Globe, TrendingUp, TrendingDown, Activity, Flame, Minus } from "lucide-react";
import { GlobalSessions } from "./GlobalSessions";
import { InfoHint } from "./InfoHint";
import { computeTrend, type TrendResult } from "@/lib/trend";

// ════════════════════════════ helpers ════════════════════════════
function fmtUsd(n: number | undefined, digits = 2): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { maximumFractionDigits: digits })}`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 6 })}`;
}
function pct(n: number | null | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
function pctClass(n: number | null | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "text-muted-foreground";
  return n >= 0 ? "text-emerald-400" : "text-rose-400";
}

export function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Card chrome reutilizável
export function Panel({
  title,
  icon: Icon,
  time,
  children,
  className = "",
  hintId,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  time: string;
  children: React.ReactNode;
  className?: string;
  hintId?: string;
}) {
  return (
    <div className={`glass-card rounded-xl border border-white/[0.06] bg-black/50 overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">{title}</h3>
          {hintId && <InfoHint id={hintId} />}
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> {time}
        </span>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

// ════════════════════════════ Macro Global ════════════════════════════
function MacroRow({ label, value, sub, subClass }: { label: string; value: string; sub?: string; subClass?: string }) {
  return (
    <div className="flex items-center justify-between py-[7px] border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] text-muted-foreground/70 font-mono">{label}</span>
      <span className="flex items-baseline gap-2">
        <span className="text-sm font-black font-mono text-white">{value}</span>
        {sub && <span className={`text-[10px] font-mono w-16 text-right ${subClass ?? "text-muted-foreground"}`}>{sub}</span>}
      </span>
    </div>
  );
}

function MacroGlobal({
  markets,
  global,
  time,
}: {
  markets: CoinGeckoMarket[] | undefined;
  global: ReturnType<typeof useGlobalData>["data"];
  time: string;
}) {
  const find = (s: string) => markets?.find((m) => m.symbol?.toLowerCase() === s);
  const btc = find("btc");
  const eth = find("eth");
  const sol = find("sol");
  const g = global?.data;

  return (
    <Panel title="Preços & Macro" icon={Globe} time={time} hintId="marketCap">
      <div className="space-y-0.5">
        <MacroRow label="Bitcoin" value={fmtUsd(btc?.current_price)} sub={pct(btc?.price_change_percentage_24h_in_currency)} subClass={pctClass(btc?.price_change_percentage_24h_in_currency)} />
        <MacroRow label="Ethereum" value={fmtUsd(eth?.current_price)} sub={pct(eth?.price_change_percentage_24h_in_currency)} subClass={pctClass(eth?.price_change_percentage_24h_in_currency)} />
        <MacroRow label="Solana" value={fmtUsd(sol?.current_price)} sub={pct(sol?.price_change_percentage_24h_in_currency)} subClass={pctClass(sol?.price_change_percentage_24h_in_currency)} />
        <MacroRow label="Market Cap" value={fmtUsd(g?.total_market_cap?.usd)} sub={pct(g?.market_cap_change_percentage_24h_usd)} subClass={pctClass(g?.market_cap_change_percentage_24h_usd)} />
        <MacroRow label="Dominância BTC" value={g?.market_cap_percentage?.btc ? `${g.market_cap_percentage.btc.toFixed(1)}%` : "—"} />
        <MacroRow label="Volume 24h" value={fmtUsd(g?.total_volume?.usd)} />
      </div>
    </Panel>
  );
}

// ════════════════════════════ Top Movers ════════════════════════════
function MoverRow({ coin }: { coin: CoinGeckoMarket }) {
  const v = coin.price_change_percentage_24h_in_currency;
  return (
    <div className="flex items-center gap-2 py-1.5">
      <img src={coin.image} alt="" className="h-5 w-5 rounded-full shrink-0" loading="lazy" />
      <span className="text-[11px] font-black tracking-wide text-white/90 w-14 shrink-0 truncate">{coin.symbol?.toUpperCase()}</span>
      <span className="text-[10px] font-mono text-muted-foreground/60 flex-1 truncate text-right pr-1">{fmtUsd(coin.current_price)}</span>
      <span className={`text-[11px] font-black font-mono w-16 text-right shrink-0 ${pctClass(v)}`}>{pct(v)}</span>
    </div>
  );
}

function TopMovers({ markets, time }: { markets: CoinGeckoMarket[] | undefined; time: string }) {
  const { up, down } = useMemo(() => {
    if (!markets) return { up: [] as CoinGeckoMarket[], down: [] as CoinGeckoMarket[] };
    const sorted = [...markets]
      .filter((m) => m.price_change_percentage_24h_in_currency != null)
      .sort((a, b) => (b.price_change_percentage_24h_in_currency ?? 0) - (a.price_change_percentage_24h_in_currency ?? 0));
    return { up: sorted.slice(0, 7), down: sorted.slice(-7).reverse() };
  }, [markets]);

  return (
    <Panel title="Top Movers 24h" icon={Activity} time={time} hintId="volume24h">
      <div className="grid grid-cols-2 gap-x-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1 pb-1.5 border-b border-emerald-500/20">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300">Subindo</span>
          </div>
          {up.map((c) => <MoverRow key={c.id} coin={c} />)}
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1 pb-1.5 border-b border-rose-500/20">
            <TrendingDown className="h-3 w-3 text-rose-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-rose-300">Caindo</span>
          </div>
          {down.map((c) => <MoverRow key={c.id} coin={c} />)}
        </div>
      </div>
    </Panel>
  );
}

// ════════════════════════════ Desempenho por Período ════════════════════════════
const PERF_COINS = ["btc", "eth", "sol", "bnb", "xrp", "doge", "ada", "avax"];
const PERF_COLS: { key: string; label: string }[] = [
  { key: "1h", label: "1H" },
  { key: "24h", label: "24H" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "1y", label: "1A" },
];

function perfVal(c: CoinGeckoMarket, key: string): number | null | undefined {
  switch (key) {
    case "1h": return c.price_change_percentage_1h_in_currency;
    case "24h": return c.price_change_percentage_24h_in_currency;
    case "7d": return c.price_change_percentage_7d_in_currency;
    case "30d": return c.price_change_percentage_30d_in_currency;
    case "1y": return c.price_change_percentage_1y_in_currency;
    default: return null;
  }
}
function perfCell(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "bg-zinc-800/30 text-muted-foreground/40";
  if (v >= 10) return "bg-emerald-500/30 text-emerald-100";
  if (v > 0) return "bg-emerald-500/12 text-emerald-300";
  if (v > -10) return "bg-rose-500/12 text-rose-300";
  return "bg-rose-500/30 text-rose-100";
}

function TrendCell({ prices }: { prices: number[] | undefined }) {
  const t: TrendResult | null = computeTrend(prices);
  if (!t) return <div className="rounded-md py-2 text-center text-[10px] text-muted-foreground/40">—</div>;
  const map = {
    ALTA: { cls: "bg-emerald-500/15 text-emerald-300", Icon: TrendingUp },
    BAIXA: { cls: "bg-rose-500/15 text-rose-300", Icon: TrendingDown },
    LATERAL: { cls: "bg-zinc-500/10 text-zinc-400", Icon: Minus },
  }[t.dir];
  const { Icon } = map;
  return (
    <div className={`rounded-md py-1.5 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider ${map.cls}`}>
      <Icon className="h-3 w-3" /> {t.dir}
    </div>
  );
}

function PerformanceGrid({ markets, time }: { markets: CoinGeckoMarket[] | undefined; time: string }) {
  const rows = useMemo(() => {
    if (!markets) return [] as CoinGeckoMarket[];
    return PERF_COINS.map((sym) => markets.find((p) => p.symbol?.toLowerCase() === sym)).filter(Boolean) as CoinGeckoMarket[];
  }, [markets]);

  return (
    <Panel title="Tendência & Desempenho" icon={Flame} time={time} className="h-full" hintId="trend">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 min-w-[520px]">
          <thead>
            <tr>
              <th className="text-left text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 px-2 w-20">Ativo</th>
              <th className="text-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 w-24">Tend.</th>
              {PERF_COLS.map((col) => (
                <th key={col.key} className="text-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="px-2">
                  <div className="flex items-center gap-1.5">
                    <img src={c.image} alt="" className="h-4 w-4 rounded-full" loading="lazy" />
                    <span className="text-[11px] font-black text-white/90">{c.symbol?.toUpperCase()}</span>
                  </div>
                </td>
                <td className="p-0"><TrendCell prices={c.sparkline_in_7d?.price} /></td>
                {PERF_COLS.map((col) => {
                  const v = perfVal(c, col.key);
                  return (
                    <td key={col.key} className="p-0">
                      <div className={`rounded-md py-2 text-center text-[10px] font-black font-mono ${perfCell(v)}`}>
                        {v === null || v === undefined ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}`}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {rows.length === 0 &&
              PERF_COINS.map((s) => (
                <tr key={s}>
                  <td className="px-2 py-2"><div className="h-4 w-16 rounded bg-white/5 animate-pulse" /></td>
                  <td className="p-0"><div className="h-7 rounded-md bg-white/[0.03] animate-pulse" /></td>
                  {PERF_COLS.map((c) => <td key={c.key} className="p-0"><div className="h-7 rounded-md bg-white/[0.03] animate-pulse" /></td>)}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

// ════════════════════════════ Terminal ════════════════════════════
export function MarketOverviewTerminal() {
  const { data: markets } = useMarkets(1, 100);
  const globalQ = useGlobalData();
  const time = useClock();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MacroGlobal markets={markets} global={globalQ.data} time={time} />
        <TopMovers markets={markets} time={time} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PerformanceGrid markets={markets} time={time} />
        </div>
        <GlobalSessions time={time} />
      </div>
    </div>
  );
}
