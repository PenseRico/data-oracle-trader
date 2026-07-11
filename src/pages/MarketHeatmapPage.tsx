import { useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { EconomicCalendarWidget } from "@/components/dashboard/EconomicCalendarWidget";
import { TrendingUp, BarChart3 } from "lucide-react";

/**
 * coin360.com market cap treemap heatmap — embedded iframe
 * Official widget: https://coin360.com/widget/map
 */
function Coin360Heatmap() {
  return (
    <div className="w-full flex-1 rounded-xl overflow-hidden border border-white/[0.04] min-h-[600px]">
      <iframe
        src="https://coin360.com/widget/map?utm_source=widget&utm_medium=iframe&utm_campaign=cooker"
        title="Coin360 Crypto Heatmap"
        width="100%"
        height="100%"
        style={{ border: "none", minHeight: "600px", background: "#0a0a0d" }}
        allowFullScreen
      />
    </div>
  );
}

/**
 * TradingView Economic Calendar (already implemented in EconomicCalendarWidget)
 * + investing.com embedded calendar
 */
function InvestingCalendar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";

    // investing.com economic calendar widget (free embed)
    const iframe = document.createElement("iframe");
    iframe.src =
      "https://sslecal2.investing.com?ecoDayBackground=%230a0a0d&innerBorderColor=%23ffffff0a&borderColor=%23ffffff0a&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone,filters&countries=5,22,17,35,43,12&calType=week&timeZone=12&lang=12";
    iframe.title = "Calendário Econômico - Investing.com";
    iframe.width = "100%";
    iframe.height = "467";
    iframe.style.cssText = "border: none; background: transparent;";
    iframe.allowFullscreen = true;
    iframe.frameBorder = "0";
    ref.current.appendChild(iframe);

    const link = document.createElement("a");
    link.href = "https://br.investing.com/economic-calendar/";
    link.rel = "nofollow";
    link.target = "_blank";
    link.className = "hidden";
    link.textContent = "Calendário Econômico";
    ref.current.appendChild(link);

    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={ref}
      className="w-full rounded-xl overflow-hidden border border-white/[0.04] bg-black/40"
      style={{ minHeight: "467px" }}
    />
  );
}

export default function MarketHeatmapPage() {
  return (
    <DashboardLayout>
      <PageShell
        title="Mapa de Mercado Global"
        subtitle="Heatmap de Capitalização + Calendário Econômico"
        icon={BarChart3}
      >
      <div className="flex flex-col gap-6 pb-20">
        {/* coin360 heatmap */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">
              Heatmap de Market Cap (Coin360)
            </h2>
            <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-widest ml-auto">
              powered by coin360.com
            </span>
          </div>
          <Coin360Heatmap />
        </div>

        {/* Economic Calendar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">
              Calendário Econômico Global
            </h2>
            <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-widest ml-auto">
              powered by TradingView
            </span>
          </div>
          <div className="glass-card p-4 rounded-xl border-primary/10">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-mono mb-4">
              Eventos macro de alto impacto que movem o mercado cripto — FOMC, CPI, NFP, PIB
            </p>
            <EconomicCalendarWidget height={620} />
          </div>
        </div>
      </div>
      </PageShell>
    </DashboardLayout>
  );
}
