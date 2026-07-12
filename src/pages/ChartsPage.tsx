import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MultiChartGrid } from "@/components/dashboard/MultiChartGrid";
import { SingleChartFocus } from "@/components/dashboard/SingleChartFocus";
import { BarChart2, Layers, ChevronRight } from "lucide-react";

type ViewMode = "grid" | "single";

export const CHART_ASSETS = [
  { id: "dxy",    label: "Dólar (DXY)",  symbol: "CAPITALCOM:DXY",   color: "#22d3ee", desc: "Índice do Dólar Americano" },
  { id: "btc",    label: "Bitcoin",       symbol: "BINANCE:BTCUSDT",  color: "#f59e0b", desc: "BTC / USDT" },
  { id: "eth",    label: "Ethereum",      symbol: "BINANCE:ETHUSDT",  color: "#818cf8", desc: "ETH / USDT" },
  { id: "sp500",  label: "S&P 500",       symbol: "FOREXCOM:SPXUSD",  color: "#34d399", desc: "S&P 500 Index" },
  { id: "nasdaq", label: "NASDAQ",        symbol: "FOREXCOM:NSXUSD",  color: "#fb923c", desc: "NASDAQ Composite" },
  { id: "total2", label: "TOTAL2 Cripto", symbol: "CRYPTOCAP:TOTAL2", color: "#e879f9", desc: "Alt Cap excl. BTC" },
];

export type ChartAsset = typeof CHART_ASSETS[0];

export default function ChartsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [focusedAsset, setFocusedAsset] = useState<ChartAsset>(CHART_ASSETS[1]);

  const handleFocus = (asset: ChartAsset) => {
    setFocusedAsset(asset);
    setViewMode("single");
  };

  return (
    <DashboardLayout fullHeight>
      {/* Page Header */}
      <div className="charts-page-header">
        <div className="charts-header-left">
          <div className="charts-header-icon">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="charts-page-title">Painel de Gráficos</h1>
            <p className="charts-page-subtitle">TradingView Live · 6 Ativos Estratégicos</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="charts-mode-toggle">
          <button
            className={`charts-mode-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grade 6 Gráficos"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Grade</span>
          </button>
          <button
            className={`charts-mode-btn ${viewMode === "single" ? "active" : ""}`}
            onClick={() => setViewMode("single")}
            title="Gráfico Único"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Foco</span>
          </button>
        </div>

        {viewMode === "single" && (
          <div className="charts-breadcrumb">
            <button onClick={() => setViewMode("grid")} className="charts-breadcrumb-link">
              Grade
            </button>
            <ChevronRight className="h-3 w-3 opacity-40" />
            <span style={{ color: focusedAsset.color }}>{focusedAsset.label}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="charts-page-content">
        {viewMode === "grid" ? (
          <MultiChartGrid assets={CHART_ASSETS} onFocus={handleFocus} />
        ) : (
          <SingleChartFocus asset={focusedAsset} assets={CHART_ASSETS} onSelect={handleFocus} />
        )}
      </div>
    </DashboardLayout>
  );
}
