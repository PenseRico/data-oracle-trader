import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LineChart, BarChart3 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useCoinChart } from "@/lib/api/coingecko";
import { useState } from "react";

const watchlist = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "tether", name: "USDT", symbol: "USDT" },
];

const dayOptions = [
  { label: "24h", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
];

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(6)}`;
}

function CoinChart({ coinId, coinName }: { coinId: string; coinName: string }) {
  const [days, setDays] = useState(1);
  const { data: chartData, isLoading } = useCoinChart(coinId, days);

  const priceData = chartData?.prices?.map(([ts, price]) => ({
    time: new Date(ts).toLocaleString("pt-BR", {
      hour: "2-digit", minute: "2-digit",
      ...(days > 1 ? { day: "2-digit", month: "2-digit" } : {}),
    }),
    price,
  })) || [];

  return (
    <div className="glass-card rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm">{coinName}</h3>
        <div className="flex gap-1">
          {dayOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                days === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[200px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id={`g-${coinId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 10%, 15%)" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(228, 8%, 50%)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "hsl(228, 8%, 50%)" }} axisLine={false} tickLine={false} tickFormatter={formatPrice} width={70} />
              <Tooltip contentStyle={{ background: "hsl(228, 12%, 8%)", border: "1px solid hsl(228, 10%, 15%)", borderRadius: "8px", fontSize: 11 }} formatter={(v: number) => [formatPrice(v), "Preço"]} />
              <Area type="monotone" dataKey="price" stroke="hsl(174, 62%, 47%)" strokeWidth={1.5} fill={`url(#g-${coinId})`} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function MonitorPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <LineChart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Monitoramento</h1>
            <p className="text-sm text-muted-foreground">Gráficos em tempo real — BTC, ETH, USDT</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {watchlist.map((coin) => (
            <CoinChart key={coin.id} coinId={coin.id} coinName={coin.name} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
