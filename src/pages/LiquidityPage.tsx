import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { Badge } from "@/components/ui/badge";
import { InfoHint } from "@/components/dashboard/InfoHint";
import { LiquiditySnatchMap } from "@/components/dashboard/LiquiditySnatchMap";
import { useGlobalLiquidations } from "@/lib/api/liquidation";
import { useFuturesSnapshot } from "@/lib/api/futures";
import { useMarkets } from "@/lib/api/coingecko";
import { computeLiquidationZones, buildLiquidityReport } from "@/lib/liquidationZones";
import { formatMarketCap } from "@/data/mockCoins";
import { Target, Zap, Scale, Maximize2, TrendingDown, TrendingUp, Percent, Layers, FileText, Flame } from "lucide-react";

const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"];

function fmtP(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(4)}`;
}

export default function LiquidityPage() {
  const [base, setBase] = useState("BTC");
  const liqs = useGlobalLiquidations(1000);
  const { data: snap } = useFuturesSnapshot(base);
  const { data: markets } = useMarkets(1, 50);

  const cgPrice = useMemo(
    () => markets?.find((m) => m.symbol?.toLowerCase() === base.toLowerCase())?.current_price ?? null,
    [markets, base],
  );
  const price = snap?.markPrice ?? cgPrice ?? 0;

  const stats = useMemo(() => {
    const f = liqs.filter((l) => l.symbol.includes(base));
    const longUsd = f.filter((l) => l.side === "SELL").reduce((s, l) => s + l.usdValue, 0);
    const shortUsd = f.filter((l) => l.side === "BUY").reduce((s, l) => s + l.usdValue, 0);
    const total = longUsd + shortUsd;
    const dominant = total === 0 ? "—" : longUsd >= shortUsd ? "LONGS" : "SHORTS";
    return { longUsd, shortUsd, total, dominant, count: f.length };
  }, [liqs, base]);

  const zones = useMemo(() => computeLiquidationZones(price), [price]);
  const report = useMemo(
    () =>
      buildLiquidityReport({
        symbol: base,
        price,
        funding: snap?.funding ?? null,
        longShortRatio: snap?.longShortRatio ?? null,
        longUsd: stats.longUsd,
        shortUsd: stats.shortUsd,
      }),
    [base, price, snap, stats.longUsd, stats.shortUsd],
  );

  const fmt = (n: number) => (n > 0 ? `$${formatMarketCap(n)}` : "—");
  const fundingPct = snap?.funding != null ? snap.funding * 100 : null;
  const oiUsd = snap?.openInterest != null && price ? snap.openInterest * price : null;

  const toneCls: Record<string, string> = {
    up: "text-emerald-300 border-emerald-500/20 bg-emerald-500/[0.04]",
    down: "text-rose-300 border-rose-500/20 bg-rose-500/[0.04]",
    warn: "text-amber-300 border-amber-500/20 bg-amber-500/[0.04]",
    neutral: "text-muted-foreground border-white/5 bg-white/[0.02]",
  };

  return (
    <DashboardLayout>
      <PageShell
        title={<>Mapa de <span className="text-primary">Liquidez</span></>}
        subtitle="Zonas de liquidação por alavancagem + liquidações ao vivo (Binance)"
        icon={Target}
        accent="primary"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mapa de Liquidez" }]}
        maxWidth="full"
        actions={
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[9px] uppercase tracking-widest">
            {price > 0 ? `preço vivo · ${fmtP(price)}` : "carregando"}
          </Badge>
        }
      >
        {/* Seletor de ativo */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono mr-1">Ativo:</span>
          {SYMBOLS.map((s) => (
            <button
              key={s}
              onClick={() => setBase(s)}
              className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest font-mono transition-colors ${
                base === s ? "border-primary/40 bg-primary/10 text-primary" : "border-white/5 bg-black/30 text-muted-foreground/60 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* BENTO — snapshot de mercado */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-1.5 mb-2"><Zap className="h-3.5 w-3.5 text-primary" /><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{base} · Preço</span></div>
            <div className="text-lg font-black font-mono tracking-tight text-white">{fmtP(price)}</div>
          </div>
          <div className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-1.5 mb-2"><Percent className="h-3.5 w-3.5 text-amber-400" /><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Funding</span><InfoHint id="funding" /></div>
            <div className={`text-lg font-black font-mono tracking-tight ${fundingPct == null ? "text-muted-foreground" : fundingPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {fundingPct == null ? "—" : `${fundingPct >= 0 ? "+" : ""}${fundingPct.toFixed(4)}%`}
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-1.5 mb-2"><Scale className="h-3.5 w-3.5 text-cyan-400" /><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Long/Short (contas)</span></div>
            <div className="text-lg font-black font-mono tracking-tight text-white">{snap?.longShortRatio != null ? snap.longShortRatio.toFixed(2) : "—"}</div>
            {snap?.longAccountPct != null && snap?.shortAccountPct != null && (
              <div className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">
                <span className="text-emerald-400">{snap.longAccountPct.toFixed(0)}% long</span> · <span className="text-rose-400">{snap.shortAccountPct.toFixed(0)}% short</span>
              </div>
            )}
          </div>
          <div className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-1.5 mb-2"><Layers className="h-3.5 w-3.5 text-violet-400" /><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Open Interest</span></div>
            <div className="text-lg font-black font-mono tracking-tight text-white">{fmt(oiUsd ?? 0)}</div>
          </div>
        </section>

        {/* BENTO — liquidações realizadas ao vivo */}
        <section className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 rounded-xl border-rose-500/10 bg-rose-500/[0.03]">
            <div className="flex items-center gap-1.5 mb-2"><TrendingDown className="h-3.5 w-3.5 text-rose-400" /><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Longs Liq · ao vivo</span><InfoHint id="liquidations" /></div>
            <div className="text-lg font-black font-mono text-rose-400">{fmt(stats.longUsd)}</div>
          </div>
          <div className="glass-card p-4 rounded-xl border-emerald-500/10 bg-emerald-500/[0.03]">
            <div className="flex items-center gap-1.5 mb-2"><TrendingUp className="h-3.5 w-3.5 text-emerald-400" /><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Shorts Liq · ao vivo</span></div>
            <div className="text-lg font-black font-mono text-emerald-400">{fmt(stats.shortUsd)}</div>
          </div>
          <div className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-1.5 mb-2"><Zap className="h-3.5 w-3.5 text-primary" /><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Total · sessão</span></div>
            <div className="text-lg font-black font-mono text-primary">{fmt(stats.total)}</div>
            <div className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">
              {stats.dominant === "LONGS" ? "↓ pressão vendedora" : stats.dominant === "SHORTS" ? "↑ pressão compradora" : "aguardando feed"}
            </div>
          </div>
        </section>

        {/* LADDER — zonas de liquidação (marcando os pontos) */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 glass-card rounded-xl border-white/[0.06] bg-black/40 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Zonas de Liquidação</h3>
              <span className="ml-auto text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">estimativa por alavancagem</span>
            </div>
            <div className="p-4 space-y-1.5">
              {/* shorts (acima) — do mais distante ao mais próximo */}
              {[...zones.shorts].reverse().map((z) => (
                <ZoneRow key={`s${z.leverage}`} lev={z.leverage} price={z.price} dist={z.distancePct} side="short" />
              ))}
              {/* preço atual */}
              <div className="flex items-center gap-3 py-2 my-1 rounded-lg bg-primary/10 border border-primary/30 px-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Preço agora</span>
                <span className="ml-auto text-base font-black font-mono text-white">{fmtP(price)}</span>
              </div>
              {/* longs (abaixo) — do mais próximo ao mais distante */}
              {zones.longs.map((z) => (
                <ZoneRow key={`l${z.leverage}`} lev={z.leverage} price={z.price} dist={z.distancePct} side="long" />
              ))}
            </div>
          </div>

          {/* MINI RELATÓRIO mastigado */}
          <div className="glass-card rounded-xl border-white/[0.06] bg-black/40 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Mini Relatório</h3>
            </div>
            <div className="p-3 space-y-2 flex-1">
              {report.map((line, i) => (
                <p key={i} className={`text-[11px] leading-relaxed rounded-lg border px-3 py-2 ${toneCls[line.tone]}`}>{line.text}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Heatmap nativo (dado ao vivo) + link mapa completo */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white flex items-center gap-1.5">
                Heatmap Nativo · Liquidações Realizadas <InfoHint id="liquidations" />
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-mono text-muted-foreground/60">
              <span className="text-muted-foreground/40">mapa completo:</span>
              <a href="https://www.coinglass.com/pro/futures/LiquidationHeatMapNew" target="_blank" rel="noopener noreferrer" className="hover:text-primary">CoinGlass ↗</a>
              <a href="https://coinank.com/liqHeatMap" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Coinank ↗</a>
            </div>
          </div>
          <LiquiditySnatchMap symbol={`${base}USDT`} height={520} />
          <p className="text-[10px] text-muted-foreground/70 leading-relaxed italic px-1 max-w-3xl">
            As <span className="text-white/80">zonas acima</span> são o cálculo de onde cada alavancagem quebra (parede de baixo = longs/suporte,
            parede de cima = shorts/resistência). O heatmap abaixo mostra as liquidações que <span className="text-white/80">de fato aconteceram</span> ao vivo
            na Binance Futures. Logo abaixo, o mapa de níveis completo da CoinGlass.
          </p>
        </section>

        {/* Mapa de NÍVEIS completo — Coinglass embutido (Coinank bloqueia iframe → só link) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Mapa de Níveis Completo · CoinGlass</h3>
            </div>
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-mono">
              <a href="https://www.coinglass.com/pro/futures/LiquidationHeatMapNew" target="_blank" rel="noopener noreferrer" className="rounded-md border border-primary/30 bg-primary/10 text-primary px-2.5 py-1 hover:bg-primary/20 transition-colors">CoinGlass ↗</a>
              <a href="https://coinank.com/liqHeatMap" target="_blank" rel="noopener noreferrer" className="rounded-md border border-white/10 bg-black/30 text-muted-foreground/70 px-2.5 py-1 hover:text-white transition-colors">Coinank ↗</a>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-black/40" style={{ height: 700 }}>
            <iframe
              src="https://www.coinglass.com/pro/futures/LiquidationHeatMapNew"
              title="CoinGlass Liquidation Heatmap"
              className="w-full h-full"
              style={{ border: "none" }}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic px-1 max-w-3xl">
            Heatmap de níveis agregando todas as exchanges, ao vivo da CoinGlass. Se o quadro ficar em branco, é bloqueio de
            segurança da própria CoinGlass — use o botão <span className="text-primary/80">CoinGlass ↗</span>. A Coinank não permite
            embutir (bloqueio deles), então abre em nova aba pelo botão <span className="text-white/70">Coinank ↗</span>.
          </p>
        </section>
      </PageShell>
    </DashboardLayout>
  );
}

function ZoneRow({ lev, price, dist, side }: { lev: number; price: number; dist: number; side: "long" | "short" }) {
  const isShort = side === "short";
  const intensity = Math.min(0.9, 0.2 + (100 / lev) * 0.12); // 100x mais intenso (mais próximo/comum)
  const bar = isShort ? `rgba(34,211,238,${intensity})` : `rgba(244,63,94,${intensity})`;
  const txt = isShort ? "text-cyan-300" : "text-rose-300";
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-1.5">
      <span className={`text-[10px] font-black font-mono w-10 ${txt}`}>{lev}x</span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.03] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (100 / lev) * 20)}%`, background: bar, marginLeft: isShort ? "auto" : 0 }} />
      </div>
      <span className="text-[11px] font-black font-mono text-white w-24 text-right">{fmtP(price)}</span>
      <span className={`text-[9px] font-mono w-12 text-right ${txt}`}>{isShort ? "+" : "−"}{dist.toFixed(0)}%</span>
    </div>
  );
}
