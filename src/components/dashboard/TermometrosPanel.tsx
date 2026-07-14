import { useMemo } from "react";
import { Gauge } from "lucide-react";
import { useMarkets, useGlobalData, useFearGreed, calculateRSI, type CoinGeckoMarket } from "@/lib/api/coingecko";
import { useTradFiFearGreed, tradFiRatingPt } from "@/lib/api/sentiment";
import { InfoHint } from "./InfoHint";
import { Panel, useClock } from "./MarketOverviewTerminal";

// ─── geometria do arco ───
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

interface Stop { off: number; color: string; }
const S_FG: Stop[] = [
  { off: 0, color: "#f43f5e" }, { off: 0.25, color: "#fb923c" }, { off: 0.5, color: "#eab308" },
  { off: 0.75, color: "#84cc16" }, { off: 1, color: "#10b981" },
];
const S_ALT: Stop[] = [{ off: 0, color: "#f59e0b" }, { off: 0.5, color: "#a1a1aa" }, { off: 1, color: "#8b5cf6" }];
const S_DOM: Stop[] = [{ off: 0, color: "#0d9488" }, { off: 0.5, color: "#2dd4bf" }, { off: 1, color: "#5eead4" }];
const S_RSI: Stop[] = [{ off: 0, color: "#22d3ee" }, { off: 0.5, color: "#a1a1aa" }, { off: 1, color: "#f43f5e" }];

function colorAt(stops: Stop[], t: number): string {
  let best = stops[0], bestD = Infinity;
  for (const s of stops) { const d = Math.abs(s.off - t); if (d < bestD) { bestD = d; best = s; } }
  return best.color;
}

// ─── medidor com arco em degradê + marcador no valor ───
function GradientGauge({
  value, display, label, caption, stops, hintId,
}: {
  value: number | null; display: string; label: string; caption: string; stops: Stop[]; hintId?: string;
}) {
  const v = value === null ? 0 : clamp(value, 0, 100);
  const r = 40, cx = 50, cy = 46;
  const ang = (x: number) => 270 + x * 1.8;
  const tip = polar(cx, cy, r, ang(v));
  const dim = value === null;
  const gid = "grad-" + label.replace(/[^a-z0-9]/gi, "");
  const numColor = dim ? "#52525b" : colorAt(stops, v / 100);

  return (
    <div className="flex flex-col items-center text-center">
      <svg viewBox="0 0 100 58" className="w-full max-w-[104px]">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
            {stops.map((s) => <stop key={s.off} offset={`${s.off * 100}%`} stopColor={s.color} />)}
          </linearGradient>
        </defs>
        <path d={arcPath(cx, cy, r, ang(0), ang(100))} stroke="rgba(255,255,255,0.06)" strokeWidth="7" fill="none" strokeLinecap="round" />
        {!dim && <path d={arcPath(cx, cy, r, ang(0), ang(100))} stroke={`url(#${gid})`} strokeWidth="7" fill="none" strokeLinecap="round" />}
        {!dim && <circle cx={tip.x} cy={tip.y} r="5" fill="#fff" stroke="#0a0a0d" strokeWidth="2" />}
      </svg>
      <div className="-mt-2.5 text-lg font-black font-display leading-none" style={{ color: numColor }}>{display}</div>
      <div className="flex items-center justify-center gap-0.5 mt-1">
        <span className="text-[8px] font-black uppercase tracking-[0.1em] text-white/85">{label}</span>
        {hintId && <InfoHint id={hintId} size={10} />}
      </div>
      <div className="text-[7px] font-mono uppercase tracking-wide text-muted-foreground/55 leading-tight mt-0.5 h-4">{caption}</div>
    </div>
  );
}

// ─── classificações ───
function fgMeta(v: number) {
  if (v <= 25) return "Medo Extremo";
  if (v <= 45) return "Medo";
  if (v <= 54) return "Neutro";
  if (v <= 74) return "Ganância";
  return "Ganância Extrema";
}
function altMeta(v: number) {
  if (v <= 25) return "Bitcoin Season";
  if (v >= 75) return "Altcoin Season";
  return "Mercado Neutro";
}
function rsiMeta(v: number) {
  if (v <= 30) return "Sobrevendido";
  if (v >= 70) return "Sobrecomprado";
  return "Neutro";
}
function breadthMeta(v: number) {
  if (v >= 60) return "Mercado forte";
  if (v <= 35) return "Mercado fraco";
  return "Misto";
}

const STABLES = new Set(["usdt", "usdc", "dai", "busd", "tusd", "fdusd", "usds", "usde", "pyusd", "usdd"]);

function altseasonOf(markets: CoinGeckoMarket[] | undefined) {
  if (!markets) return { index: null as number | null, count: 0, total: 0 };
  const btc = markets.find((m) => m.symbol?.toLowerCase() === "btc");
  const btc30 = btc?.price_change_percentage_30d_in_currency;
  if (btc30 == null) return { index: null, count: 0, total: 0 };
  const alts = markets
    .filter((m) => m.symbol?.toLowerCase() !== "btc" && !STABLES.has(m.symbol?.toLowerCase()) && m.price_change_percentage_30d_in_currency != null)
    .slice(0, 50);
  if (!alts.length) return { index: null, count: 0, total: 0 };
  const beat = alts.filter((a) => (a.price_change_percentage_30d_in_currency as number) > btc30).length;
  return { index: Math.round((beat / alts.length) * 100), count: beat, total: alts.length };
}

/**
 * Painel de Termômetros — 6 medidores simétricos com arco em degradê (estilo Fear & Greed).
 * Cada um tem o "?" explicando o que mede (feito pros alunos). Fica ao lado do gráfico.
 */
export function TermometrosPanel() {
  const { data: markets } = useMarkets(1, 100);
  const globalQ = useGlobalData();
  const { data: fg } = useFearGreed();
  const { data: tradfi } = useTradFiFearGreed();
  const time = useClock();
  const global = globalQ.data;

  const fgv = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : null;
  const tfv = tradfi?.value ?? null;
  const alt = useMemo(() => altseasonOf(markets), [markets]);
  const btcDom = global?.data?.market_cap_percentage?.btc ?? null;

  const btcRsi = useMemo(() => {
    const btc = markets?.find((m) => m.symbol?.toLowerCase() === "btc");
    const prices = btc?.sparkline_in_7d?.price;
    return prices && prices.length > 15 ? calculateRSI(prices) : null;
  }, [markets]);

  const breadth = useMemo(() => {
    if (!markets?.length) return null;
    const valid = markets.filter((m) => m.price_change_percentage_24h_in_currency != null);
    if (!valid.length) return null;
    const green = valid.filter((m) => (m.price_change_percentage_24h_in_currency as number) > 0).length;
    return Math.round((green / valid.length) * 100);
  }, [markets]);

  return (
    <Panel title="Termômetros" icon={Gauge} time={time} hintId="confluencia" className="h-full">
      <div className="flex flex-col h-full justify-between gap-2">
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          <GradientGauge value={fgv} display={fgv === null ? "—" : String(fgv)} label="F&G Cripto" caption={fgv === null ? "carregando" : fgMeta(fgv)} stops={S_FG} hintId="fearGreed" />
          <GradientGauge value={tfv} display={tfv === null ? "—" : String(tfv)} label="F&G Tradic." caption={tradFiRatingPt(tradfi?.rating ?? null, tfv)} stops={S_FG} hintId="fearGreedTradfi" />
          <GradientGauge value={alt.index} display={alt.index === null ? "—" : String(alt.index)} label="Altseason" caption={alt.index === null ? "carregando" : altMeta(alt.index)} stops={S_ALT} hintId="altseason" />
          <GradientGauge value={btcRsi} display={btcRsi === null ? "—" : String(Math.round(btcRsi))} label="RSI BTC" caption={btcRsi === null ? "carregando" : rsiMeta(btcRsi)} stops={S_RSI} hintId="rsiBtc" />
          <GradientGauge value={btcDom} display={btcDom != null ? `${btcDom.toFixed(0)}%` : "—"} label="Domin. BTC" caption="fatia do BTC" stops={S_DOM} hintId="btcDominance" />
          <GradientGauge value={breadth} display={breadth === null ? "—" : `${breadth}%`} label="Amplitude" caption={breadth === null ? "carregando" : breadthMeta(breadth)} stops={S_FG} hintId="breadth" />
        </div>

        {/* legenda da escala de cor */}
        <div className="flex items-center justify-center gap-2 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60 pt-1">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />baixo</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />neutro</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />alto</span>
          <span className="text-muted-foreground/40 normal-case tracking-normal">· toque no “?” pra entender cada um</span>
        </div>

        {alt.index !== null && (
          <p className="text-[9px] text-muted-foreground/55 font-mono text-center pt-1 border-t border-white/5">
            <span className="text-white/80 font-bold">{alt.count}/{alt.total}</span> altcoins &gt; BTC em 30d
          </p>
        )}
      </div>
    </Panel>
  );
}
