import { useEffect, useRef } from "react";

interface EconomicCalendarWidgetProps {
  height?: number | string;
  importanceFilter?: "0,1" | "-1,0,1" | "1";
  /** Filter currencies (ISO codes). Defaults to USD only — most relevant for crypto. */
  currencyFilter?: string;
}

/**
 * TradingView Economic Calendar — free embeddable widget.
 * High-impact USD events drive crypto more than crypto-specific news.
 */
export function EconomicCalendarWidget({
  height = 600,
  importanceFilter = "-1,0,1",
  currencyFilter = "USD,EUR,BRL,CNY",
}: EconomicCalendarWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    containerRef.current.appendChild(widget);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height,
      colorTheme: "dark",
      isTransparent: true,
      locale: "br",
      importanceFilter,
      currencyFilter,
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [height, importanceFilter, currencyFilter]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}
    />
  );
}
