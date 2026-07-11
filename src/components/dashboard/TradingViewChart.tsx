import { useEffect, useRef, useCallback } from 'react';

export type TVInterval = '1' | '5' | '15' | '30' | '60' | '240' | 'D' | 'W';
export type TVStyle = '1' | '2' | '3' | '8' | '9'; // Candle, Bar, Line, Heikin Ashi, Hollow Candle

interface TradingViewChartProps {
  symbol?: string;
  interval?: TVInterval;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  height?: number;
  studies?: string[];
  containerId?: string;
  style?: TVStyle;
  showDrawingToolbar?: boolean;
}

let instanceCount = 0;

export default function TradingViewChart({
  symbol = 'BINANCE:BTCUSDT',
  interval = '60',
  theme = 'dark',
  autosize = true,
  height = 600,
  studies = [],
  containerId,
  style = '1',
  showDrawingToolbar = false,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerIdRef = useRef<string>(containerId || `tv_chart_${++instanceCount}_${Date.now()}`);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const buildWidget = useCallback(() => {
    if (!containerRef.current) return;

    // Remove any old scripts injected in this container
    if (scriptRef.current && containerRef.current.contains(scriptRef.current)) {
      containerRef.current.removeChild(scriptRef.current);
    }

    // The embed script reads its previous sibling (.tradingview-widget-container__widget)
    // and injects the iframe there. Reset it before each rebuild so we don't stack iframes.
    const widgetMount = containerRef.current.querySelector('.tradingview-widget-container__widget');
    if (widgetMount) widgetMount.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    const config: Record<string, any> = {
      autosize,
      symbol,
      interval,
      timezone: 'America/Sao_Paulo',
      theme,
      style,
      locale: 'br',
      enable_publishing: false,
      allow_symbol_change: true,
      save_image: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: !showDrawingToolbar,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    };

    if (!autosize) {
      config.height = height;
      config.width = '100%';
    }

    if (studies.length > 0) {
      config.studies = studies;
    }

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);
    scriptRef.current = script;
  }, [symbol, interval, theme, autosize, height, studies, style, showDrawingToolbar]);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const t = setTimeout(buildWidget, 50);
    return () => {
      clearTimeout(t);
    };
  }, [buildWidget]);

  return (
    <div
      className="tradingview-widget-container w-full h-full"
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    >
      <div
        id={containerIdRef.current}
        className="tradingview-widget-container__widget"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}
