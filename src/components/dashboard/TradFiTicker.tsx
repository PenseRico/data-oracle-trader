import { useEffect, useRef } from "react";

/**
 * Faixa TradFi (ticker-tape oficial do TradingView) — dado real em tempo real,
 * sem chave de API e totalmente responsiva (não corta como o painel de cotações).
 * Mostra índices, commodities, dólar e cripto numa tira fina no topo do terminal.
 */
export function TradFiTicker() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    ref.current.appendChild(widget);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "FOREXCOM:NSXUSD", title: "NASDAQ 100" },
        { proName: "TVC:VIX", title: "VIX" },
        { proName: "TVC:GOLD", title: "Ouro" },
        { proName: "TVC:UKOIL", title: "Brent" },
        { proName: "CAPITALCOM:DXY", title: "DXY (Dólar)" },
        { proName: "FX_IDC:USDBRL", title: "USD/BRL" },
        { proName: "BINANCE:BTCUSDT", title: "BTC" },
        { proName: "BINANCE:ETHUSDT", title: "ETH" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "br",
    });
    ref.current.appendChild(script);

    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, []);

  return (
    <div className="glass-card rounded-xl border border-white/[0.06] bg-black/50 overflow-hidden px-1">
      <div ref={ref} className="tradingview-widget-container w-full" />
    </div>
  );
}
