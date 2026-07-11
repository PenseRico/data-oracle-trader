import { useGlobalData, useFearGreed } from "@/lib/api/coingecko";
import { Activity, TrendingDown, TrendingUp, Flame, Gauge } from "lucide-react";
import { formatMarketCap } from "@/data/mockCoins";

function Pill({
  label,
  value,
  hint,
  positive,
  icon: Icon,
  pulse,
}: {
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  pulse?: boolean;
}) {
  const tone =
    positive === undefined
      ? "text-foreground"
      : positive
      ? "text-emerald-400"
      : "text-rose-400";
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </span>
      <span className={`text-[11px] font-mono font-black tracking-tight ${tone}`}>
        {value}
      </span>
      {hint && (
        <span className={`text-[9px] font-mono font-bold ${tone} opacity-70 ${pulse ? "animate-pulse" : ""}`}>
          {hint}
        </span>
      )}
      {Icon && <Icon className={`h-3 w-3 ${tone} ${pulse ? "animate-pulse" : ""}`} />}
    </div>
  );
}

export function MacroBar() {
  const { data: global } = useGlobalData();
  const { data: fg } = useFearGreed();

  const totalCap = global?.data?.total_market_cap?.usd ?? 0;
  const totalVol = global?.data?.total_volume?.usd ?? 0;
  const capChange = global?.data?.market_cap_change_percentage_24h_usd ?? 0;
  const btcDom = global?.data?.market_cap_percentage?.btc ?? 0;
  const ethDom = global?.data?.market_cap_percentage?.eth ?? 0;
  const activeCoins = global?.data?.active_cryptocurrencies ?? 0;

  const fgValue = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;
  const fgLabel = fg?.data?.[0]?.value_classification ?? "—";
  const fgTraduzido = fgLabel
    .replace("Extreme Fear", "Medo Extremo")
    .replace("Fear", "Medo")
    .replace("Extreme Greed", "Ganância Extrema")
    .replace("Greed", "Ganância")
    .replace("Neutral", "Neutro");
  const fgExtremo = fgValue !== undefined && (fgValue <= 20 || fgValue >= 80);
  const fgIcon = fgValue === undefined ? Gauge : fgExtremo ? Flame : Gauge;

  return (
    <div className="border-b border-white/[0.04] bg-[#08080A]/80 backdrop-blur-xl shrink-0 z-40">
      <div className="flex items-center gap-x-6 gap-y-2 px-4 md:px-6 py-2 overflow-x-auto custom-scrollbar flex-wrap">
        <Pill
          label="Cap. Total"
          value={totalCap ? formatMarketCap(totalCap) : "—"}
          hint={totalCap ? `${capChange >= 0 ? "+" : ""}${capChange.toFixed(2)}%` : undefined}
          positive={capChange >= 0}
          icon={capChange >= 0 ? TrendingUp : TrendingDown}
        />
        <span className="h-3 w-px bg-white/10" />
        <Pill
          label="Vol 24h"
          value={totalVol ? formatMarketCap(totalVol) : "—"}
          icon={Activity}
        />
        <span className="h-3 w-px bg-white/10" />
        <Pill
          label="BTC.D"
          value={btcDom ? `${btcDom.toFixed(2)}%` : "—"}
        />
        <Pill
          label="ETH.D"
          value={ethDom ? `${ethDom.toFixed(2)}%` : "—"}
        />
        <span className="h-3 w-px bg-white/10" />
        <Pill
          label="Fear & Greed"
          value={fgValue !== undefined ? String(fgValue) : "—"}
          hint={fgTraduzido}
          positive={fgValue !== undefined ? fgValue > 50 : undefined}
          icon={fgIcon}
          pulse={fgExtremo}
        />
        <span className="h-3 w-px bg-white/10" />
        <Pill
          label="Ativos"
          value={activeCoins ? activeCoins.toLocaleString("pt-BR") : "—"}
        />
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
            Live · CoinGecko
          </span>
        </div>
      </div>
    </div>
  );
}
