import { useMemo } from "react";
import { Gauge } from "lucide-react";
import { useMarkets, useGlobalData, useFearGreed, calculateRSI, type CoinGeckoMarket } from "@/lib/api/coingecko";
import { useTradFiFearGreed, tradFiRatingPt } from "@/lib/api/sentiment";
import { InfoHint } from "./InfoHint";
import { Panel, useClock } from "./MarketOverviewTerminal";

// ─── medidor compacto (arco) ───
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const large = Math.abs(endDeg - startDeg) <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function MiniGauge({
  value, display, label, caption, color, hintId,
}: {
  value: number | null; display: string; label: string; caption: string; color: string; hintId?: string;
}) {
  const v = value === null ? 0 : clamp(value, 0, 100);
  const r = 40, cx = 50, cy = 48;
  const ang = (x: number) => 270 + x * 1.8;
  const tip = polar(cx, cy, r, ang(v));
  const dim = value === null;
  return (
    <div className="flex flex-col items-center text-center">
      <svg viewBox="0 0 100 60" className="w-full max-w-[96px]">
        <path d={arcPath(cx, cy, r, ang(0), ang(100))} stroke="rgba(255,255,255,0.07)" strokeWidth="6.5" fill="none" strokeLinecap="round" />
        {!dim && <path d={arcPath(cx, cy, r, ang(0), ang(v))} stroke={color} strokeWidth="6.5" fill="none" strokeLinecap="round" />}
        {!dim && <circle cx={tip.x} cy={tip.y} r="4" fill={color} stroke="#0a0a0d" strokeWidth="1.5" />}
      </svg>
      <div className="-mt-2 text-base font-black font-display leading-none" style={{ color: dim ? "#52525b" : color }}>
        {display}
      </div>
      <div className="flex items-center justify-center gap-0.5 mt-0.5">
        <span className="text-[8px] font-black uppercase tracking-[0.12em] text-white/85">{label}</span>
        {hintId && <InfoHint id={hintId} size={9} />}
      </div>
      <div className="text-[7px] font-mono uppercase tracking-wide text-muted-foreground/55 leading-tight mt-0.5 h-4">{caption}</div>
    </div>
  );
}

// ─── classificações ───
function fgMeta(v: number) {
  if (v <= 25) return { sub: "Medo Extremo", color: "#f43f5e" };
  if (v <= 45) return { sub: "Medo", color: "#fb923c" };
  if (v <= 54) return { sub: "Neutro", color: "#eab308" };
  if (v <= 74) return { sub: "Ganância", color: "#84cc16" };
  return { sub: "Ganância Extrema", color: "#10b981" };
}
function altMeta(v: number) {
  if (v <= 25) return { sub: "Bitcoin Season", color: "#f59e0b" };
  if (v >= 75) return { sub: "Altcoin Season", color: "#8b5cf6" };
  return { sub: "Mercado Neutro", color: "#a1a1aa" };
}
function rsiMeta(v: number) {
  if (v <= 30) return { sub: "Sobrevendido", color: "#22d3ee" };
  if (v >= 70) return { sub: "Sobrecomprado", color: "#f43f5e" };
  return { sub: "Neutro", color: "#a1a1aa" };
}
function breadthMeta(v: number) {
  if (v >= 60) return { sub: "Mercado forte", color: "#10b981" };
  if (v <= 35) return { sub: "Mercado fraco", color: "#f43f5e" };
  return { sub: "Misto", color: "#a1a1aa" };
}

const STABLES = new Set(["usdt", "usdc", "dai", "busd", "tusd", "fdusd", "usds", "usde", "pyusd", "usdd"]);

function altseasonOf(markets: CoinGeckoMarket[] | undefined) {
  if (!markets) return { index: null as number | null, count: 0, total: 0 };
  const btc = markets.find((m) => m.symbol?.toLowerCase() === "btc");
  const btc30 = btc?.price_change_percentage_30d_in_currency;
  if (btc30 === undefined || btc30 === null) return { index: null, count: 0, total: 0 };
  const alts = markets
    .filter((m) =>
      m.symbol?.toLowerCase() !== "btc" &&
      !STABLES.has(m.symbol?.toLowerCase()) &&
      m.price_change_percentage_30d_in_currency != null)
    .slice(0, 50);
  if (!alts.length) return { index: null, count: 0, total: 0 };
  const beat = alts.filter((a) => (a.price_change_percentage_30d_in_currency as number) > btc30).length;
  return { index: Math.round((beat / alts.length) * 100), count: beat, total: alts.length };
}

/**
 * Painel de Termômetros — auto-suficiente e compacto (fica ao lado do gráfico).
 * Inclui o medômetro de medo/ganância do CRIPTO (alternative.me) e do TRADICIONAL (CNN).
 */
export function TermometrosPanel() {
  const { data: markets } = useMarkets(1, 100);
  const globalQ = useGlobalData();
  const { data: fg } = useFearGreed();
  const { data: tradfi } = useTradFiFearGreed();
  const time = useClock();
  const global = globalQ.data;

  const fgv = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : null;
  const fgM = fgv === null ? { sub: "carregando", color: "#52525b" } : fgMeta(fgv);

  const tfv = tradfi?.value ?? null;
  const tfM = tfv === null ? { sub: "carregando", color: "#52525b" } : fgMeta(tfv);

  const alt = useMemo(() => altseasonOf(markets), [markets]);
  const altM = alt.index === null ? { sub: "carregando", color: "#52525b" } : altMeta(alt.index);

  const btcDom = global?.data?.market_cap_percentage?.btc;

  const btcRsi = useMemo(() => {
    const btc = markets?.find((m) => m.symbol?.toLowerCase() === "btc");
    const prices = btc?.sparkline_in_7d?.price;
    return prices && prices.length > 15 ? calculateRSI(prices) : null;
  }, [markets]);
  const rsiM = btcRsi === null ? { sub: "carregando", color: "#52525b" } : rsiMeta(btcRsi);

  const breadth = useMemo(() => {
    if (!markets?.length) return null;
    const valid = markets.filter((m) => m.price_change_percentage_24h_in_currency != null);
    if (!valid.length) return null;
    const green = valid.filter((m) => (m.price_change_percentage_24h_in_currency as number) > 0).length;
    return Math.round((green / valid.length) * 100);
  }, [markets]);
  const brM = breadth === null ? { sub: "carregando", color: "#52525b" } : breadthMeta(breadth);

  const stableDom = useMemo(() => {
    const pcts = global?.data?.market_cap_percentage;
    if (!pcts) return null;
    return Object.entries(pcts)
      .filter(([k]) => STABLES.has(k.toLowerCase()))
      .reduce((s, [, v]) => s + (v as number), 0);
  }, [global]);

  return (
    <Panel title="Termômetros" icon={Gauge} time={time} hintId="confluencia" className="h-full">
      <div className="grid grid-cols-2 gap-x-2 gap-y-3">
        <MiniGauge value={fgv} display={fgv === null ? "—" : String(fgv)} label="F&G Cripto" caption={fgM.sub} color={fgM.color} hintId="fearGreed" />
        <MiniGauge value={tfv} display={tfv === null ? "—" : String(tfv)} label="F&G Tradic." caption={tradFiRatingPt(tradfi?.rating ?? null, tfv)} color={tfM.color} />
        <MiniGauge value={alt.index} display={alt.index === null ? "—" : String(alt.index)} label="Altseason" caption={altM.sub} color={altM.color} hintId="altseason" />
        <MiniGauge value={btcDom ?? null} display={btcDom !== undefined ? `${btcDom.toFixed(0)}%` : "—"} label="Domin. BTC" caption="do mercado" color="#2dd4bf" hintId="btcDominance" />
        <MiniGauge value={btcRsi} display={btcRsi === null ? "—" : String(Math.round(btcRsi))} label="RSI BTC" caption={rsiM.sub} color={rsiM.color} hintId="rsiBtc" />
        <MiniGauge value={breadth} display={breadth === null ? "—" : `${breadth}%`} label="Amplitude" caption={brM.sub} color={brM.color} hintId="breadth" />
        <MiniGauge value={stableDom ?? null} display={stableDom != null ? `${stableDom.toFixed(1)}%` : "—"} label="Stables" caption="caixa lateral" color="#fbbf24" hintId="stables" />
      </div>
      {alt.index !== null && (
        <p className="text-[9px] text-muted-foreground/55 font-mono text-center mt-2 pt-2 border-t border-white/5">
          <span className="text-white/80 font-bold">{alt.count}/{alt.total}</span> altcoins &gt; BTC em 30d
        </p>
      )}
    </Panel>
  );
}
