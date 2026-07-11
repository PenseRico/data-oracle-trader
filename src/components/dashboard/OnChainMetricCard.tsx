import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  BaselineSeries,
} from "lightweight-charts";
import {
  OnChainMetricDef,
  classifyZone,
  useOnChainSeries,
  type ZoneTone,
} from "@/lib/api/onchain";
import { Loader2, TrendingUp } from "lucide-react";

const TONE: Record<ZoneTone, { text: string; bg: string; border: string; dot: string }> = {
  buy: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  accumulate: { text: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/30", dot: "bg-cyan-400" },
  neutral: { text: "text-zinc-300", bg: "bg-zinc-500/10", border: "border-zinc-500/30", dot: "bg-zinc-400" },
  caution: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-400" },
  sell: { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/30", dot: "bg-rose-400" },
};

const VERDICT: Record<ZoneTone, string> = {
  buy: "COMPRA / FUNDO",
  accumulate: "ACUMULAR",
  neutral: "NEUTRO",
  caution: "CAUTELA",
  sell: "VENDA / TOPO",
};

interface Props {
  metric: OnChainMetricDef;
  height?: number;
}

export function OnChainMetricCard({ metric, height = 260 }: Props) {
  const { data: points, isLoading, isError } = useOnChainSeries(metric);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Baseline"> | null>(null);

  const current = points?.length ? points[points.length - 1].value : undefined;
  const zone = current !== undefined ? classifyZone(metric, current) : undefined;
  const tone = zone ? TONE[zone.tone] : TONE.neutral;

  useEffect(() => {
    if (!containerRef.current || !points?.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#888",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.02)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      width: containerRef.current.clientWidth,
      height,
      rightPriceScale: { borderColor: "rgba(255,255,255,0.05)" },
      timeScale: { borderColor: "rgba(255,255,255,0.05)", timeVisible: false, secondsVisible: false },
      crosshair: {
        mode: 1,
        vertLine: { color: "#2dd4bf", width: 1, style: 2 },
        horzLine: { color: "#2dd4bf", width: 1, style: 2 },
      },
    });

    const series = chart.addSeries(BaselineSeries, {
      baseValue: { type: "price", price: metric.baseline },
      topLineColor: "rgba(16,185,129,0.9)",
      topFillColor1: "rgba(16,185,129,0.28)",
      topFillColor2: "rgba(16,185,129,0.03)",
      bottomLineColor: "rgba(244,63,94,0.9)",
      bottomFillColor1: "rgba(244,63,94,0.03)",
      bottomFillColor2: "rgba(244,63,94,0.28)",
      lineWidth: 2,
      priceLineVisible: false,
    });
    series.setData(points.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));

    // Linha de break-even (baseline)
    series.createPriceLine({
      price: metric.baseline,
      color: "rgba(255,255,255,0.35)",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "base",
    });

    chart.timeScale().fitContent();
    chartRef.current = chart;
    seriesRef.current = series;

    const onResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [points, metric.baseline, height]);

  return (
    <div className="glass-card rounded-xl border border-white/[0.06] bg-black/50 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 px-5 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-base text-white tracking-tight uppercase italic">
              {metric.label}
            </h3>
            <span className="text-[8px] uppercase tracking-widest font-mono text-primary/70 border border-primary/20 rounded px-1.5 py-0.5">
              {metric.tag}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-snug max-w-2xl font-mono">
            {metric.about}
          </p>
        </div>

        {current !== undefined && zone && (
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-white leading-none">
                {current.toFixed(metric.precision)}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-mono mt-1">
                {metric.label.split("—")[0].trim()}
              </div>
            </div>
            <div className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2 ${tone.bg} ${tone.border}`}>
              <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${tone.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot} animate-pulse`} />
                {VERDICT[zone.tone]}
              </span>
              <span className={`text-[10px] font-mono ${tone.text}`}>{zone.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Veredito em 1 linha */}
      {zone && (
        <div className={`px-5 py-2 text-[11px] font-mono ${tone.text} ${tone.bg} flex items-center gap-2`}>
          <TrendingUp className="h-3 w-3 shrink-0" />
          {zone.note}
        </div>
      )}

      {/* Chart */}
      <div className="relative px-2 pb-2 pt-3">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground/60 text-xs font-mono" style={{ height }}>
            <Loader2 className="h-4 w-4 animate-spin" /> carregando série on-chain…
          </div>
        )}
        {isError && !points?.length && (
          <div className="flex items-center justify-center text-rose-300/70 text-xs font-mono px-6 text-center" style={{ height }}>
            Dado on-chain indisponível no momento (limite da API gratuita). Atualiza automaticamente em até 1h.
          </div>
        )}
        {!isLoading && points?.length ? <div ref={containerRef} className="w-full" /> : null}

        {/* Legenda lucro/prejuízo */}
        {points?.length ? (
          <div className="absolute top-4 left-5 z-10 flex items-center gap-3 text-[9px] uppercase tracking-widest font-mono pointer-events-none">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-3 rounded-sm bg-emerald-400/80" />
              <span className="text-emerald-300/70">Lucro</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-3 rounded-sm bg-rose-400/80" />
              <span className="text-rose-300/70">Prejuízo</span>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
