import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { Badge } from "@/components/ui/badge";
import { InfoHint } from "@/components/dashboard/InfoHint";
import { LiquiditySnatchMap } from "@/components/dashboard/LiquiditySnatchMap";
import { useGlobalLiquidations } from "@/lib/api/liquidation";
import { formatMarketCap } from "@/data/mockCoins";
import { Target, ArrowRightLeft, Zap, Scale, Maximize2 } from "lucide-react";

const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"];

export default function LiquidityPage() {
  const [base, setBase] = useState("BTC");
  // Feed real de liquidações (Binance Futures WS). side SELL = long liquidado, BUY = short liquidado.
  const liqs = useGlobalLiquidations(1000);

  const stats = useMemo(() => {
    const f = liqs.filter((l) => l.symbol.includes(base));
    const longUsd = f.filter((l) => l.side === "SELL").reduce((s, l) => s + l.usdValue, 0);
    const shortUsd = f.filter((l) => l.side === "BUY").reduce((s, l) => s + l.usdValue, 0);
    const total = longUsd + shortUsd;
    const dominant = total === 0 ? "—" : longUsd >= shortUsd ? "LONGS" : "SHORTS";
    return { longUsd, shortUsd, total, dominant, count: f.length };
  }, [liqs, base]);

  const fmt = (n: number) => (n > 0 ? `$${formatMarketCap(n)}` : "—");

  const cards = [
    {
      label: `${base} · Longs Liquidados`,
      val: fmt(stats.longUsd),
      icon: ArrowRightLeft,
      tone: "text-rose-400",
      hint: "liquidations" as const,
    },
    { label: `${base} · Shorts Liquidados`, val: fmt(stats.shortUsd), icon: Target, tone: "text-cyan-400" },
    {
      label: "Pressão Dominante",
      val: stats.dominant === "LONGS" ? "↓ LONGS" : stats.dominant === "SHORTS" ? "↑ SHORTS" : "—",
      icon: Scale,
      tone: stats.dominant === "LONGS" ? "text-rose-400" : stats.dominant === "SHORTS" ? "text-emerald-400" : "text-muted-foreground",
    },
    { label: "Total Liquidado", val: fmt(stats.total), icon: Zap, tone: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <PageShell
        title={<>Mapa de <span className="text-primary">Liquidez</span></>}
        subtitle="Liquidações ao vivo (Binance Futures) + heatmap CoinGlass"
        icon={Target}
        accent="primary"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mapa de Liquidez" },
        ]}
        maxWidth="full"
        actions={
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[9px] uppercase tracking-widest">
            {stats.count > 0 ? `${stats.count} liquidações live` : "aguardando feed"}
          </Badge>
        }
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono mr-1">Ativo:</span>
          {SYMBOLS.map((s) => (
            <button
              key={s}
              onClick={() => setBase(s)}
              className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest font-mono transition-colors ${
                base === s
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/5 bg-black/30 text-muted-foreground/60 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((s) => (
            <div key={s.label} className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-1.5 mb-2">
                <s.icon className={`h-3.5 w-3.5 ${s.tone}`} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</span>
                {s.hint && <InfoHint id={s.hint} />}
              </div>
              <div className={`text-lg font-black font-mono tracking-tight uppercase ${s.tone}`}>{s.val}</div>
            </div>
          ))}
        </section>

        {stats.count === 0 && (
          <p className="text-[11px] text-amber-300/70 font-mono px-1 -mt-1">
            Aguardando o feed de liquidações da Binance Futures. Se ficar vazio, a Binance pode estar
            bloqueada na sua rede/região (o stream <code>fstream.binance.com</code> precisa estar acessível).
          </p>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white flex items-center gap-1.5">
                Mapa de Liquidez · Heatmap Nativo
                <InfoHint id="liquidations" />
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-mono text-muted-foreground/60">
              <span className="text-muted-foreground/40">mapa completo:</span>
              <a href="https://www.coinglass.com/pro/futures/LiquidationHeatMapNew" target="_blank" rel="noopener noreferrer" className="hover:text-primary">CoinGlass ↗</a>
              <a href="https://coinank.com/liqHeatMap" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Coinank ↗</a>
            </div>
          </div>
          <LiquiditySnatchMap symbol={`${base}USDT`} height={560} />
          <p className="text-[10px] text-muted-foreground/70 leading-relaxed italic px-1 max-w-3xl">
            Cada célula é uma faixa de <span className="text-white/80">preço × tempo</span>. Quanto mais quente
            (amarelo) mais liquidações acumuladas ali — o preço age como ímã em direção a essas paredes.
            Ciano = shorts liquidados (resistência); rosa = longs liquidados (suporte). Dado ao vivo da Binance
            Futures; os botões acima abrem o mapa completo da CoinGlass/Coinank.
          </p>
        </section>
      </PageShell>
    </DashboardLayout>
  );
}
