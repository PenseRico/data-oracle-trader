import { useState, useEffect } from "react";
import { useWhaleOrderBook, WhaleOrder } from "@/hooks/useWhaleOrderBook";
import WhaleDepthChart, { WhaleChartInterval } from "./WhaleDepthChart";
import { ArrowUp, ArrowDown, Scale, Wallet, ChevronDown, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface AssetOption {
  label: string;
  symbol: string;
  defaultThreshold: number;
}

const ASSETS: AssetOption[] = [
  { label: "BTC/USDT", symbol: "BTCUSDT", defaultThreshold: 250_000 },
  { label: "ETH/USDT", symbol: "ETHUSDT", defaultThreshold: 100_000 },
  { label: "SOL/USDT", symbol: "SOLUSDT", defaultThreshold: 50_000 },
  { label: "BNB/USDT", symbol: "BNBUSDT", defaultThreshold: 50_000 },
  { label: "XRP/USDT", symbol: "XRPUSDT", defaultThreshold: 25_000 },
  { label: "DOGE/USDT", symbol: "DOGEUSDT", defaultThreshold: 25_000 },
];

const TIMEFRAMES: { label: string; value: WhaleChartInterval }[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "30m", value: "30m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "1D", value: "1d" },
];

const fmtUsd = (n: number) =>
  n >= 1_000_000_000
    ? `$${(n / 1_000_000_000).toFixed(2)}B`
    : n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(0)}`;

const fmtAge = (ms: number) => {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

function InfoHint({ children, side = "top" }: { children: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border border-white/20 text-muted-foreground/70 hover:text-primary hover:border-primary/50 transition-colors cursor-help"
          aria-label="Ajuda"
        >
          <Info className="h-2.5 w-2.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[280px] text-[11px] leading-relaxed bg-zinc-950 border-white/10 text-zinc-200 normal-case tracking-normal"
      >
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

export function CoinglassWhaleBoard() {
  const [asset, setAsset] = useState<AssetOption>(ASSETS[0]);
  const [interval, setInterval] = useState<WhaleChartInterval>("15m");
  const [now, setNow] = useState(Date.now());
  const [pickerOpen, setPickerOpen] = useState(false);

  const { orders, summary, loading, error } = useWhaleOrderBook({
    symbol: asset.symbol,
    thresholdUsd: asset.defaultThreshold,
  });

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ratio = summary?.ratio ?? 0;
  const ratioTone =
    ratio >= 1.1 ? "text-emerald-400" : ratio <= 0.9 ? "text-rose-400" : "text-zinc-200";

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-4">
      {/* ─── Summary Cards (topo) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          icon={ArrowUp}
          label="Total Bids"
          value={summary ? fmtUsd(summary.totalBidNotional) : "—"}
          sub={summary ? `${summary.bidCount} paredes ativas` : ""}
          tone="emerald"
        />
        <SummaryCard
          icon={ArrowDown}
          label="Total Asks"
          value={summary ? fmtUsd(summary.totalAskNotional) : "—"}
          sub={summary ? `${summary.askCount} paredes ativas` : ""}
          tone="rose"
        />
        <SummaryCard
          icon={Scale}
          label="Bid / Ask Ratio"
          value={summary ? summary.ratio.toFixed(2) : "—"}
          sub={ratio >= 1 ? "Pressão compradora" : "Pressão vendedora"}
          tone="primary"
          valueClass={ratioTone}
        />
        <SummaryCard
          icon={Wallet}
          label="Spot Price"
          value={summary ? `$${summary.spot.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
          sub={summary ? `${summary.bidCount + summary.askCount} grandes ordens` : ""}
          tone="amber"
        />
      </div>

      {/* ─── Bloco unificado: Toolbar colada + Chart + Side panel ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 items-stretch">
        <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden flex flex-col">
          {/* Toolbar colada no topo do chart */}
          <div className="flex flex-wrap items-center gap-3 px-3 h-[44px] border-b border-white/5 bg-black/60">
            {/* Asset picker */}
            <div className="relative">
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary/40 text-sm font-bold text-white transition-all"
              >
                <span>{asset.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              {pickerOpen && (
                <div className="absolute top-full mt-1 left-0 z-30 grid grid-cols-2 gap-1 p-2 rounded-xl bg-zinc-950 border border-white/10 shadow-2xl min-w-[220px]">
                  {ASSETS.map((a) => (
                    <button
                      key={a.symbol}
                      onClick={() => {
                        setAsset(a);
                        setPickerOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border ${
                        asset.symbol === a.symbol
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "border-transparent hover:bg-white/5 text-muted-foreground"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setInterval(tf.value)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                    interval === tf.value
                      ? "bg-primary text-black"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-bold">
                  {error ? "ERRO" : loading ? "CARREGANDO" : "LIVE"}
                </span>
              </div>
              {summary && (
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-mono">
                  atualizado {new Date(summary.lastUpdateTs).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="ml-auto text-[9px] uppercase tracking-widest text-muted-foreground/50 font-mono">
              Min: {fmtUsd(asset.defaultThreshold)} · Fonte: Binance Spot
            </div>
          </div>

          {/* Chart sem borda própria — herda do container */}
          <div className="flex-1 min-h-0">
            <WhaleDepthChart
              symbol={asset.symbol}
              orders={orders}
              spot={summary?.spot}
              height={620}
              interval={interval}
              maxWallsPerSide={25}
              framed={false}
            />
          </div>
          {/* Footer informativo — espelha o footer do side panel */}
          <div className="flex items-center justify-between px-3 h-[28px] border-t border-white/5 bg-black/60 text-[9px] uppercase tracking-widest text-muted-foreground/60 font-mono">
            <span>Binance Spot · Refresh 4s · Klines via /api/v3/klines</span>
            <span className="text-muted-foreground/50">
              barra horizontal = tempo no livro
            </span>
          </div>
        </div>

        <OrderbookSidePanel
          orders={orders}
          spot={summary?.spot}
          now={now}
          symbolLabel={asset.label}
        />
      </div>
    </div>
    </TooltipProvider>
  );
}

function OrderbookSidePanel({
  orders,
  spot,
  now,
  symbolLabel,
}: {
  orders: WhaleOrder[];
  spot: number | undefined;
  now: number;
  symbolLabel: string;
}) {
  // Asks (above spot) sorted desc, then SPOT, then bids (below spot) sorted desc.
  const asks = orders
    .filter((o) => o.side === "ASK")
    .sort((a, b) => b.price - a.price);
  const bids = orders
    .filter((o) => o.side === "BID")
    .sort((a, b) => b.price - a.price);
  const maxNotional = Math.max(...orders.map((o) => o.notional), 1);

  return (
    <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden flex flex-col">
      {/* Header — mesma altura da toolbar do chart */}
      <div className="flex items-center justify-between px-3 h-[44px] border-b border-white/5 bg-black/60 shrink-0">
        <span className="text-[10px] uppercase tracking-widest font-bold font-mono text-white">
          Whale Orders
        </span>
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-mono">
          {orders.length} ativas
        </span>
      </div>
      {/* Sub-header com colunas */}
      <div className="grid grid-cols-[1fr_auto_46px] gap-2 px-2 py-1.5 border-b border-white/5 bg-white/[0.02] text-[8.5px] uppercase tracking-widest text-muted-foreground/60 font-mono shrink-0">
        <span>Preço</span>
        <span className="text-right">Notional</span>
        <span className="text-right">Idade</span>
      </div>
      <div className="overflow-y-auto flex-1">
        {asks.length === 0 ? null : (
          <div className="flex flex-col-reverse">
            {asks.map((o) => (
              <SideRow key={o.id} order={o} maxNotional={maxNotional} now={now} symbolLabel={symbolLabel} spot={spot} />
            ))}
          </div>
        )}

        {spot && (
          <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto] items-center gap-2 px-2 py-1.5 bg-zinc-900/95 border-y border-white/10">
            <span className="text-[9px] uppercase tracking-widest font-bold text-white/80 font-mono">
              SPOT
            </span>
            <span className="text-[11px] font-mono font-bold text-white">
              ${spot.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {bids.map((o) => (
          <SideRow key={o.id} order={o} maxNotional={maxNotional} now={now} symbolLabel={symbolLabel} spot={spot} />
        ))}

        {orders.length === 0 && (
          <div className="p-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono">
            sem paredes acima do threshold
          </div>
        )}
      </div>
      {/* Footer espelhando o footer do chart */}
      <div className="flex items-center justify-between px-3 h-[28px] border-t border-white/5 bg-black/60 text-[9px] uppercase tracking-widest text-muted-foreground/60 font-mono shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
          live · hover pra detalhes
        </span>
        <span className="text-muted-foreground/50">{orders.length}/—</span>
      </div>
    </div>
  );
}

function SideRow({
  order,
  maxNotional,
  now,
  symbolLabel,
  spot,
}: {
  order: WhaleOrder;
  maxNotional: number;
  now: number;
  symbolLabel: string;
  spot: number | undefined;
}) {
  const isBid = order.side === "BID";
  const widthPct = (order.notional / maxNotional) * 100;
  const ageMs = now - order.firstSeenTs;
  const baseAsset = symbolLabel.split("/")[0];

  return (
    <HoverCard openDelay={120} closeDelay={50}>
      <HoverCardTrigger asChild>
        <div className="relative px-2 py-1 border-b border-white/[0.03] hover:bg-white/[0.05] cursor-pointer">
          <div
            className={`absolute inset-y-0 right-0 ${
              isBid ? "bg-emerald-500/15" : "bg-rose-500/15"
            }`}
            style={{ width: `${Math.min(100, widthPct)}%` }}
          />
          <div className="relative grid grid-cols-[1fr_auto_46px] gap-2 items-center">
            <span
              className={`font-mono text-[11px] ${
                isBid ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              ${order.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span
              className={`font-mono text-[11px] font-bold ${
                isBid ? "text-emerald-200" : "text-rose-200"
              }`}
            >
              {fmtUsd(order.notional)}
            </span>
            <span className="text-right font-mono text-[9px] text-muted-foreground/70">
              {fmtAge(ageMs)}
            </span>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="left"
        align="start"
        className="w-72 bg-zinc-950 border-white/10 p-0 overflow-hidden"
      >
        <div
          className={`px-3 py-2 border-b border-white/5 flex items-center justify-between ${
            isBid ? "bg-emerald-500/10" : "bg-rose-500/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-bold font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${
                isBid
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {isBid ? "BID · COMPRA" : "ASK · VENDA"}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/70 font-mono">
              {symbolLabel} · Spot
            </span>
          </div>
        </div>

        <div className="p-3 space-y-2 text-[11px] font-mono">
          <DetailRow label="Preço da ordem" value={`$${order.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
          <DetailRow
            label={`Quantidade (${baseAsset})`}
            value={order.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          />
          <DetailRow
            label="Valor total (notional)"
            value={fmtUsd(order.notional)}
            highlight
          />
          {spot && (
            <DetailRow
              label="Distância do spot"
              value={`${order.distancePct >= 0 ? "+" : ""}${order.distancePct.toFixed(3)}% (${
                order.distancePct >= 0 ? "$" : "-$"
              }${Math.abs(order.price - spot).toLocaleString(undefined, { maximumFractionDigits: 2 })})`}
              tone={order.distancePct >= 0 ? "rose" : "emerald"}
            />
          )}
          <DetailRow label="Vista pela primeira vez" value={new Date(order.firstSeenTs).toLocaleTimeString()} />
          <DetailRow label="Última confirmação" value={new Date(order.lastSeenTs).toLocaleTimeString()} />
          <DetailRow label="Idade no livro" value={fmtAge(ageMs)} />
        </div>

        <div className="px-3 py-2 border-t border-white/5 bg-black/40 text-[10px] text-muted-foreground/80 leading-relaxed">
          {isBid
            ? "Parede de COMPRA — funciona como suporte. Se o preço cair até esse nível, esse comprador grande pode segurar a queda. Quanto maior a idade, mais respeitada é pelo mercado."
            : "Parede de VENDA — funciona como resistência. Se o preço subir até esse nível, esse vendedor grande tende a frear a alta. Pode ser usado como alvo de venda."}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function DetailRow({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "emerald" | "rose";
}) {
  const valueClass = tone === "emerald"
    ? "text-emerald-300"
    : tone === "rose"
    ? "text-rose-300"
    : highlight
    ? "text-white font-bold"
    : "text-zinc-200";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  tone: "emerald" | "rose" | "primary" | "amber";
  valueClass?: string;
}

function SummaryCard({ icon: Icon, label, value, sub, tone, valueClass }: SummaryCardProps) {
  const toneClass = {
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    rose: "border-rose-500/20 bg-rose-500/5",
    primary: "border-primary/20 bg-primary/5",
    amber: "border-amber-500/20 bg-amber-500/5",
  }[tone];
  const iconClass = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    primary: "text-primary",
    amber: "text-amber-400",
  }[tone];

  return (
    <div className={`rounded-xl border ${toneClass} p-3 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/70 font-mono">
          {label}
        </span>
        <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
      </div>
      <span className={`text-xl font-bold font-mono ${valueClass ?? "text-white"}`}>{value}</span>
      {sub && (
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-mono">
          {sub}
        </span>
      )}
    </div>
  );
}

