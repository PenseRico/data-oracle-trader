import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Activity, TrendingUp, ExternalLink } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoinDetail, useCoinChart, calculateRSI, calculateSMA } from "@/lib/api/coingecko";
import { formatMarketCap } from "@/data/mockCoins";

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toFixed(6)}`;
}

function getRsiBg(rsi: number) {
  if (rsi >= 70) return "bg-destructive/10 text-destructive";
  if (rsi <= 30) return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
}

const dayOptions = [
  { label: "24h", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "1y", value: 365 },
];

export default function CoinDetail() {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const [days, setDays] = useState(1);

  const { data: coin, isLoading } = useCoinDetail(coinId || "");
  const { data: chartData, isLoading: chartLoading } = useCoinChart(coinId || "", days);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!coin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Moeda não encontrada</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Voltar</Button>
        </div>
      </DashboardLayout>
    );
  }

  const sparkPrices = coin.market_data?.sparkline_7d?.price || [];
  const rsi = calculateRSI(sparkPrices);
  const ma10 = calculateSMA(sparkPrices, 10);
  const ma20 = calculateSMA(sparkPrices, 20);
  const ma80 = calculateSMA(sparkPrices, 80);
  const currentPrice = coin.market_data?.current_price?.usd || 0;

  const signalLabel = rsi >= 70 ? "VENDA" : rsi <= 30 ? "COMPRA" : "NEUTRO";
  const signalClass = rsi >= 70
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : rsi <= 30
    ? "bg-primary/15 text-primary border-primary/30"
    : "bg-muted text-muted-foreground border-border";

  const priceChartData = chartData?.prices?.map(([ts, price]) => ({
    time: new Date(ts).toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      ...(days > 1 ? { day: "2-digit", month: "2-digit" } : {}),
    }),
    price,
  })) || [];

  const change24 = coin.market_data?.price_change_percentage_24h ?? 0;
  const change7d = coin.market_data?.price_change_percentage_7d ?? 0;
  const change30d = coin.market_data?.price_change_percentage_30d ?? 0;

  const infoCards = [
    { label: "Market Cap", value: formatMarketCap(coin.market_data?.market_cap?.usd || 0) },
    { label: "Volume 24h", value: formatMarketCap(coin.market_data?.total_volume?.usd || 0) },
    { label: "Variação 24h", value: `${change24 >= 0 ? "+" : ""}${change24.toFixed(2)}%`, color: change24 >= 0 },
    { label: "Variação 7d", value: `${change7d >= 0 ? "+" : ""}${change7d.toFixed(2)}%`, color: change7d >= 0 },
    { label: "Variação 30d", value: `${change30d >= 0 ? "+" : ""}${change30d.toFixed(2)}%`, color: change30d >= 0 },
    { label: "ATH", value: formatPrice(coin.market_data?.ath?.usd || 0) },
    { label: "ATL", value: formatPrice(coin.market_data?.atl?.usd || 0) },
    { label: "Circulating Supply", value: formatMarketCap(coin.market_data?.circulating_supply || 0) },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={coin.image?.small} alt={coin.name} className="h-10 w-10 rounded-full" />
          <div>
            <h1 className="font-display font-bold text-2xl flex items-center gap-3">
              {coin.name}
              <span className="text-muted-foreground text-base font-normal uppercase">{coin.symbol}</span>
              <Badge variant="outline" className={`text-xs ${signalClass}`}>{signalLabel}</Badge>
              <span className="text-xs text-muted-foreground">#{coin.market_cap_rank}</span>
            </h1>
            <p className="font-mono text-xl">{formatPrice(currentPrice)}</p>
          </div>
          {coin.links?.homepage?.[0] && (
            <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="ml-auto text-muted-foreground hover:text-primary">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Chart */}
        <div className="glass-card rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm text-muted-foreground">Gráfico de Preço</h2>
            <div className="flex gap-1">
              {dayOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    days === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[350px]">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceChartData}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 10%, 15%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(228, 8%, 50%)" }} axisLine={{ stroke: "hsl(228, 10%, 15%)" }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(228, 8%, 50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatPrice(v)} width={80} />
                  <Tooltip contentStyle={{ background: "hsl(228, 12%, 8%)", border: "1px solid hsl(228, 10%, 15%)", borderRadius: "8px", fontSize: 12 }} labelStyle={{ color: "hsl(228, 8%, 50%)" }} formatter={(value: number) => [formatPrice(value), "Preço"]} />
                  <Area type="monotone" dataKey="price" stroke="hsl(174, 62%, 47%)" strokeWidth={2} fill="url(#pg)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {infoCards.map((info) => (
            <div key={info.label} className="glass-card rounded-lg p-3 space-y-1">
              <span className="text-xs text-muted-foreground">{info.label}</span>
              <div className={`font-mono font-semibold text-sm ${
                info.color !== undefined ? (info.color ? "text-primary" : "text-destructive") : ""
              }`}>{info.value}</div>
            </div>
          ))}
        </div>

        {/* RSI & MA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">RSI (14 períodos, 7d)</h3>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-mono font-bold px-4 py-2 rounded inline-block ${getRsiBg(rsi)}`}>
                {Math.round(rsi)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {rsi >= 70 ? "Sobrecomprado — considere venda" : rsi <= 30 ? "Sobrevendido — oportunidade de compra" : "Zona neutra"}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">Médias Móveis (7d sparkline)</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "MA 10", value: ma10 },
                { label: "MA 20", value: ma20 },
                { label: "MA 80", value: ma80 },
              ].map((ma) => (
                <div key={ma.label} className="text-center space-y-1">
                  <div className="text-xs text-muted-foreground">{ma.label}</div>
                  <div className="text-sm font-mono font-semibold">{formatPrice(ma.value)}</div>
                  <div className={`text-[10px] font-mono ${currentPrice > ma.value ? "text-primary" : "text-destructive"}`}>
                    {currentPrice > ma.value ? "▲ Acima" : "▼ Abaixo"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {coin.description?.en && (
          <div className="glass-card rounded-lg p-4">
            <h3 className="font-display font-semibold text-sm mb-2">Sobre {coin.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4"
              dangerouslySetInnerHTML={{ __html: coin.description.en.slice(0, 500) }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
