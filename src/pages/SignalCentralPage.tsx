import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MtfSignalCard } from "@/components/dashboard/MtfSignalCard";
import { useMarkets } from "@/lib/api/coingecko";
import { useRsiHeatmapData } from "@/lib/api/binance";
import { rankMtfSignals, MTF_PRESETS } from "@/lib/mtfRsiEngine";
import { Badge } from "@/components/ui/badge";
import { InfoHint } from "@/components/dashboard/InfoHint";
import { TrendingUp, TrendingDown, Crosshair, Zap, Loader2 } from "lucide-react";

export default function SignalCentralPage() {
  const [presetId, setPresetId] = useState<string>("estrito");
  const preset = MTF_PRESETS.find((p) => p.id === presetId) ?? MTF_PRESETS[0];

  const { data: markets } = useMarkets(1, 100);
  const symbols = useMemo(() => {
    if (!markets) return [];
    return Array.from(
      new Set(
        markets
          .slice(0, 50)
          .map((m) => m.symbol?.toUpperCase())
          .filter((s) => s && s.trim() !== ""),
      ),
    ).map((s) => `${s}USDT`);
  }, [markets]);

  const { data: heatmap, isLoading } = useRsiHeatmapData(symbols);

  const { longs, shorts } = useMemo(
    () => rankMtfSignals(heatmap, symbols, { oversold: preset.oversold, overbought: preset.overbought }),
    [heatmap, symbols, preset.oversold, preset.overbought],
  );

  const firedLongs = longs.filter((l) => l.triggerLong).length;
  const firedShorts = shorts.filter((s) => s.triggerShort).length;

  return (
    <DashboardLayout fullHeight>
      <div className="flex flex-col h-full bg-background min-h-[calc(100vh-64px)] pb-24">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-black/40 px-6 py-5 shrink-0 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 opacity-5">
            <Crosshair className="h-64 w-64 text-cyan-500" />
          </div>
          <div className="relative z-10 space-y-1">
            <h1 className="font-display font-black text-2xl text-glow tracking-tighter uppercase italic flex items-center gap-3">
              Central de Sinais <span className="text-primary text-xl">MTF RSI</span>
              <InfoHint id="mtfConfluence" size={18} />
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono">
              Confluência Multi-Timeframe • D=3 · 4h=2 · 1h=1 · gatilho 5m
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <InfoHint id="mtfGatilho" size={16} className="text-muted-foreground/60" />
            <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-300 py-1.5 px-3 uppercase tracking-widest font-black text-[9px]">
              <Zap className="h-3 w-3 mr-1" /> {firedLongs} gatilho{firedLongs !== 1 ? "s" : ""} long
            </Badge>
            <Badge variant="outline" className="bg-rose-500/5 border-rose-500/20 text-rose-300 py-1.5 px-3 uppercase tracking-widest font-black text-[9px]">
              <Zap className="h-3 w-3 mr-1" /> {firedShorts} gatilho{firedShorts !== 1 ? "s" : ""} short
            </Badge>
          </div>
        </div>

        {/* Controles de sensibilidade (os/ob = inputs do seu indicador) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 bg-zinc-950/50 px-6 py-3">
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono mr-1">
            Sensibilidade:
            <InfoHint
              term="Sensibilidade (RSI)"
              what="Define o nível de RSI que conta como sobrevendido/sobrecomprado (ex.: 20/80 estrito, 30/70 amplo)."
              how="Estrito (20/80) = poucos sinais, porém mais confiáveis. Amplo (30/70) = mais sinais, capta setups em formação."
            />
          </span>
          {MTF_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPresetId(p.id)}
              className={`rounded-md border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${
                presetId === p.id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/5 bg-black/30 text-muted-foreground/60 hover:text-white"
              }`}
            >
              {p.label}
              <span className="ml-1.5 text-muted-foreground/40">
                {p.oversold}/{p.overbought}
              </span>
            </button>
          ))}
        </div>

        {/* Painel 2 colunas: só o que está em compra/venda */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5">
          {/* COMPRAS */}
          <div className="bg-background p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-500/20">
              <h2 className="flex items-center gap-2 font-display font-black text-sm uppercase tracking-widest text-emerald-300">
                <TrendingUp className="h-4 w-4" /> Compras
                <InfoHint id="mtfScore" />
              </h2>
              <span className="text-[10px] font-mono text-muted-foreground/50">{longs.length} ativos</span>
            </div>
            {isLoading ? (
              <LoadingState />
            ) : longs.length ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
                {longs.map((s) => (
                  <MtfSignalCard key={s.symbol} signal={s} side="long" />
                ))}
              </div>
            ) : (
              <EmptyState dir="compra" />
            )}
          </div>

          {/* VENDAS */}
          <div className="bg-background p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-500/20">
              <h2 className="flex items-center gap-2 font-display font-black text-sm uppercase tracking-widest text-rose-300">
                <TrendingDown className="h-4 w-4" /> Vendas
              </h2>
              <span className="text-[10px] font-mono text-muted-foreground/50">{shorts.length} ativos</span>
            </div>
            {isLoading ? (
              <LoadingState />
            ) : shorts.length ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
                {shorts.map((s) => (
                  <MtfSignalCard key={s.symbol} signal={s} side="short" />
                ))}
              </div>
            ) : (
              <EmptyState dir="venda" />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground/60 text-xs font-mono py-20">
      <Loader2 className="h-4 w-4 animate-spin" /> calculando confluência multi-timeframe…
    </div>
  );
}

function EmptyState({ dir }: { dir: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-2">
      <Crosshair className="h-8 w-8 text-muted-foreground/20" />
      <p className="text-xs text-muted-foreground/50 font-mono leading-relaxed max-w-xs">
        Nenhum ativo em zona de {dir} no momento. Afrouxe a sensibilidade acima
        para captar setups em formação — ou aguarde o gatilho disparar.
      </p>
    </div>
  );
}
