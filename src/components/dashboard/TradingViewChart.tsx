import { useEffect, useRef, memo } from "react";

interface TradingViewChartProps {
  symbol: string;
  theme?: "dark" | "light";
  autosize?: boolean;
}

function TradingViewChart({ symbol, theme = "dark", autosize = true }: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear previous widget
    if (container.current) {
      container.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // Formatting symbol for Binance (Standard convention)
    let formattedSymbol = symbol.toUpperCase();
    if (!formattedSymbol.includes(":")) {
      const baseSymbol = formattedSymbol.endsWith("USDT") ? formattedSymbol : `${formattedSymbol}USDT`;
      formattedSymbol = `BINANCE:${baseSymbol}`;
    }

    script.innerHTML = JSON.stringify({
      "autosize": autosize,
      "symbol": formattedSymbol,
      "interval": "60",
      "timezone": "America/Sao_Paulo",
      "theme": theme,
      "style": "1",
      "locale": "br",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "hide_side_toolbar": false,
      "container_id": "tradingview_chart_container",
      "studies": [
        "RSI@tv-basicstudies",
        "MASimple@tv-basicstudies",
        "MACD@tv-basicstudies"
      ],
      "overrides": {
        "mainSeriesProperties.candleStyle.upColor": "#00f2fe",
        "mainSeriesProperties.candleStyle.downColor": "#f43f5e",
        "mainSeriesProperties.candleStyle.borderUpColor": "#00f2fe",
        "mainSeriesProperties.candleStyle.borderDownColor": "#f43f5e",
        "mainSeriesProperties.candleStyle.wickUpColor": "#00f2fe",
        "mainSeriesProperties.candleStyle.wickDownColor": "#f43f5e"
      }
    });

    if (container.current) {
      container.current.appendChild(script);
    }
  }, [symbol, theme, autosize]);

  return (
    <div className="glass-card w-full h-[600px] border-primary/20 bg-black/40 overflow-hidden relative group">
       <div className="absolute top-0 left-0 p-4 z-10 opacity-20 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Live Terminal View</span>
          </div>
       </div>
       <div 
         id="tradingview_chart_container" 
         ref={container} 
         className="w-full h-full"
       />
    </div>
  );
}

export default memo(TradingViewChart);
