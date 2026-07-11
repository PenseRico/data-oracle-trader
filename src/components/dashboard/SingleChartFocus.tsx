import { useEffect, useRef } from "react";
import type { ChartAsset } from "@/pages/ChartsPage";

interface SingleChartFocusProps {
  asset: ChartAsset;
  assets: ChartAsset[];
  onSelect: (asset: ChartAsset) => void;
}

function TradingViewFull({ asset }: { asset: ChartAsset }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

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
      hide_side_toolbar: false,
      allow_symbol_change: true,
      studies: ["RSI@tv-basicstudies", "MAExp@tv-basicstudies", "MACD@tv-basicstudies"],
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

export function SingleChartFocus({ asset, assets, onSelect }: SingleChartFocusProps) {
  return (
    <div className="single-chart-focus">
      {/* Asset Selector Tabs */}
      <div className="single-chart-tabs">
        {assets.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className={`single-chart-tab ${asset.id === a.id ? "active" : ""}`}
            style={asset.id === a.id ? { borderColor: a.color, color: a.color } : {}}
          >
            <span
              className="single-chart-tab-dot"
              style={{
                background: a.color,
                opacity: asset.id === a.id ? 1 : 0.3,
                boxShadow: asset.id === a.id ? `0 0 8px ${a.color}` : "none",
              }}
            />
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Full Chart */}
      <div className="single-chart-body">
        <TradingViewFull asset={asset} />
      </div>
    </div>
  );
}
