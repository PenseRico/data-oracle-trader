import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import TradingViewChart, { TVInterval, TVStyle } from "@/components/dashboard/TradingViewChart";
import {
  LineChart, LayoutGrid, Maximize2, Settings2,
  TrendingUp, Activity, Zap, ChevronDown, Eye, EyeOff
} from "lucide-react";

const SYMBOLS = [
  { label: "BTC/USDT", value: "BINANCE:BTCUSDT", color: "#f59e0b" },
  { label: "ETH/USDT", value: "BINANCE:ETHUSDT", color: "#818cf8" },
  { label: "SOL/USDT", value: "BINANCE:SOLUSDT", color: "#34d399" },
  { label: "BNB/USDT", value: "BINANCE:BNBUSDT", color: "#facc15" },
  { label: "XRP/USDT", value: "BINANCE:XRPUSDT", color: "#22d3ee" },
  { label: "DOGE/USDT", value: "BINANCE:DOGEUSDT", color: "#fb923c" },
  { label: "ADA/USDT", value: "BINANCE:ADAUSDT", color: "#60a5fa" },
  { label: "AVAX/USDT", value: "BINANCE:AVAXUSDT", color: "#f87171" },
  { label: "DXY", value: "TVC:DXY", color: "#cbd5e1" },
  { label: "S&P 500", value: "FOREXCOM:SPXUSD", color: "#86efac" },
  { label: "TOTAL2", value: "CRYPTOCAP:TOTAL2", color: "#e879f9" },
  { label: "BTC.D", value: "CRYPTOCAP:BTC.D", color: "#fbbf24" },
];

const INTERVALS: { label: string; value: TVInterval }[] = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "30m", value: "30" },
  { label: "1h", value: "60" },
  { label: "4h", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

// Common indicator sets (TradingView study IDs)
const STUDY_PRESETS = [
  {
    label: "Setup Padrão",
    icon: Activity,
    studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
  },
  {
    label: "Price Action",
    icon: TrendingUp,
    studies: ["BB@tv-basicstudies", "Volume@tv-basicstudies"],
  },
  {
    label: "On-Chain Flow",
    icon: Zap,
    studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies", "BB@tv-basicstudies", "Volume@tv-basicstudies"],
  },
];

type ViewMode = "single" | "dual" | "quad";

export default function TradingViewPage() {
  const [primarySymbol, setPrimarySymbol] = useState("BINANCE:BTCUSDT");
  const [secondarySymbol, setSecondarySymbol] = useState("BINANCE:ETHUSDT");
  const [interval, setInterval] = useState<TVInterval>("60");
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [activeStudies, setActiveStudies] = useState<string[]>(["RSI@tv-basicstudies", "MACD@tv-basicstudies"]);
  const [showToolbar, setShowToolbar] = useState(true);
  const [chartStyle, setChartStyle] = useState<TVStyle>("1");
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  const applyPreset = useCallback((studies: string[]) => {
    setActiveStudies(studies);
  }, []);

  const primarySymbolData = SYMBOLS.find(s => s.value === primarySymbol) || SYMBOLS[0];

  return (
    <DashboardLayout fullHeight>
      <div className="flex flex-col h-full min-h-[calc(100vh-64px)] bg-background">

        {/* ─── Control Bar ─── */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-black/40 backdrop-blur-sm shrink-0">

          {/* Brand */}
          <div className="flex items-center gap-2 mr-3">
            <LineChart className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary">TradingView Pro</span>
          </div>

          {/* Symbol Picker */}
          <div className="relative">
            <button
              onClick={() => setShowSymbolPicker(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary/40 text-xs font-bold transition-all"
              style={{ color: primarySymbolData.color }}
            >
              <span>{primarySymbolData.label}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {showSymbolPicker && (
              <div className="absolute top-full mt-1 left-0 z-50 grid grid-cols-3 gap-1 p-2 rounded-xl bg-zinc-950 border border-white/10 shadow-2xl min-w-[260px]">
                {SYMBOLS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => { setPrimarySymbol(s.value); setShowSymbolPicker(false); }}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border ${
                      primarySymbol === s.value
                        ? 'bg-primary/20 border-primary/40 text-primary'
                        : 'border-transparent hover:bg-white/5 text-muted-foreground'
                    }`}
                    style={primarySymbol === s.value ? {} : { color: s.color + '99' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interval */}
          <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5">
            {INTERVALS.map(iv => (
              <button
                key={iv.value}
                onClick={() => setInterval(iv.value)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                  interval === iv.value
                    ? 'bg-primary text-black'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                {iv.label}
              </button>
            ))}
          </div>

          {/* Indicator Presets */}
          <div className="flex items-center gap-1 ml-1">
            {STUDY_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.studies)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all ${
                  JSON.stringify(activeStudies) === JSON.stringify(preset.studies)
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
                }`}
              >
                <preset.icon className="h-3 w-3" />
                {preset.label}
              </button>
            ))}
          </div>

          {/* Chart Style */}
          <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5 ml-auto">
            {([['1','Candle'], ['8','Heikin'], ['3','Linha']] as [TVStyle, string][]).map(([v, lbl]) => (
              <button
                key={v}
                onClick={() => setChartStyle(v)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  chartStyle === v ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("single")}
              title="Gráfico Único"
              className={`p-1.5 rounded-md transition-all ${viewMode === "single" ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("dual")}
              title="Dois Gráficos"
              className={`p-1.5 rounded-md transition-all ${viewMode === "dual" ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Drawing Toolbar Toggle */}
          <button
            onClick={() => setShowToolbar(v => !v)}
            title={showToolbar ? "Ocultar Ferramentas de Desenho" : "Mostrar Ferramentas de Desenho"}
            className={`p-1.5 rounded-lg border transition-all ${showToolbar ? 'bg-primary/15 border-primary/30 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground hover:text-white'}`}
          >
            {showToolbar ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* ─── Chart Area ─── */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "single" && (
            <div className="w-full h-full min-h-[600px]">
              <TradingViewChart
                symbol={primarySymbol}
                interval={interval}
                studies={activeStudies}
                style={chartStyle}
                showDrawingToolbar={showToolbar}
                autosize
                containerId="tv_main_single"
              />
            </div>
          )}

          {viewMode === "dual" && (
            <div className="grid grid-cols-2 h-full min-h-[600px] divide-x divide-white/5">
              <div className="h-full">
                <TradingViewChart
                  symbol={primarySymbol}
                  interval={interval}
                  studies={activeStudies}
                  style={chartStyle}
                  showDrawingToolbar={showToolbar}
                  autosize
                  containerId="tv_dual_left"
                />
              </div>
              <div className="h-full flex flex-col">
                {/* Secondary symbol selector */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 shrink-0">
                  <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">Comparar com:</span>
                  <select
                    value={secondarySymbol}
                    onChange={e => setSecondarySymbol(e.target.value)}
                    className="bg-transparent text-[10px] font-bold text-primary border-none outline-none cursor-pointer"
                  >
                    {SYMBOLS.map(s => (
                      <option key={s.value} value={s.value} className="bg-zinc-950">{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <TradingViewChart
                    symbol={secondarySymbol}
                    interval={interval}
                    studies={activeStudies}
                    style={chartStyle}
                    autosize
                    containerId="tv_dual_right"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
