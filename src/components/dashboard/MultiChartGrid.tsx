import { useEffect, useRef } from "react";
import { Maximize2 } from "lucide-react";
import type { ChartAsset } from "@/pages/ChartsPage";

interface MultiChartGridProps {
  assets: ChartAsset[];
  onFocus: (asset: ChartAsset) => void;
}

function TradingViewMini({ asset }: { asset: ChartAsset }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: asset.symbol,
      interval: "60",
      timezone: "America/Sao_Paulo",
      theme: "dark",
      style: "1",
      locale: "br",
      backgroundColor: "rgba(0,0,0,0)",
      gridColor: "rgba(255,255,255,0.02)",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [asset.symbol]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: "100%", width: "100%" }}
    />
  );
}

export function MultiChartGrid({ assets, onFocus }: MultiChartGridProps) {
  return (
    <div className="multi-chart-grid">
      {assets.map((asset) => (
        <div key={asset.id} className="chart-grid-cell">
          {/* Cell Header */}
          <div className="chart-cell-header" style={{ borderColor: `${asset.color}30` }}>
            <div className="chart-cell-label">
              <span className="chart-cell-dot" style={{ background: asset.color, boxShadow: `0 0 8px ${asset.color}` }} />
              <span className="chart-cell-name">{asset.label}</span>
              <span className="chart-cell-desc">{asset.desc}</span>
            </div>
            <button
              className="chart-cell-expand"
              onClick={() => onFocus(asset)}
              title={`Expandir ${asset.label}`}
            >
              <Maximize2 className="h-3 w-3" />
            </button>
          </div>

          {/* TradingView Chart */}
          <div className="chart-cell-body">
            <TradingViewMini asset={asset} />
          </div>
        </div>
      ))}
    </div>
  );
}
