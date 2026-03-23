import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCoins, formatPrice, formatMarketCap, getRsiBg, getSignalConfig } from "@/data/mockCoins";

// Generate more detailed chart data
function generateChartData(base: number, points = 96) {
  const data: { time: string; price: number }[] = [];
  let current = base * 0.95;
  for (let i = 0; i < points; i++) {
    current += (Math.random() - 0.48) * base * 0.008;
    const hour = Math.floor((i / points) * 24);
    data.push({
      time: `${String(hour).padStart(2, '0')}:${i % 4 === 0 ? '00' : String((i % 4) * 15).padStart(2, '0')}`,
      price: Math.max(current, base * 0.85),
    });
  }
  return data;
}

export default function CoinDetail() {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const coin = mockCoins.find((c) => c.id === coinId);

  if (!coin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Moeda não encontrada</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Voltar</Button>
        </div>
      </DashboardLayout>
    );
  }

  const chartData = generateChartData(coin.price);
  const signal = getSignalConfig(coin.signal);

  const infoCards = [
    { label: 'Market Cap', value: formatMarketCap(coin.marketCap) },
    { label: 'Volume 24h', value: formatMarketCap(coin.volume24h) },
    { label: 'Variação 1h', value: `${coin.change1h >= 0 ? '+' : ''}${coin.change1h.toFixed(2)}%`, color: coin.change1h >= 0 },
    { label: 'Variação 24h', value: `${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%`, color: coin.change24h >= 0 },
    { label: 'Variação 7d', value: `${coin.change7d >= 0 ? '+' : ''}${coin.change7d.toFixed(2)}%`, color: coin.change7d >= 0 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
            {coin.symbol.slice(0, 2)}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl flex items-center gap-3">
              {coin.name}
              <span className="text-muted-foreground text-base font-normal">{coin.symbol}</span>
              <Badge variant="outline" className={`text-xs ${signal.className}`}>{signal.label}</Badge>
            </h1>
            <p className="font-mono text-xl text-foreground">{formatPrice(coin.price)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card rounded-lg p-4 md:p-6">
          <h2 className="font-display font-semibold text-sm text-muted-foreground mb-4">Gráfico de Preço — 24h</h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 10%, 15%)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: 'hsl(228, 8%, 50%)' }}
                  axisLine={{ stroke: 'hsl(228, 10%, 15%)' }}
                  tickLine={false}
                  interval={11}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: 'hsl(228, 8%, 50%)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatPrice(v)}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(228, 12%, 8%)',
                    border: '1px solid hsl(228, 10%, 15%)',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: 'hsl(228, 8%, 50%)' }}
                  formatter={(value: number) => [formatPrice(value), 'Preço']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(174, 62%, 47%)"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {infoCards.map((info) => (
            <div key={info.label} className="glass-card rounded-lg p-3 space-y-1">
              <span className="text-xs text-muted-foreground">{info.label}</span>
              <div className={`font-mono font-semibold text-sm ${
                info.color !== undefined
                  ? info.color ? 'text-primary' : 'text-destructive'
                  : ''
              }`}>
                {info.value}
              </div>
            </div>
          ))}
        </div>

        {/* RSI & MA section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">RSI por Timeframe</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['4h', '12h', '24h'] as const).map((tf) => (
                <div key={tf} className="text-center space-y-1">
                  <div className="text-xs text-muted-foreground uppercase">{tf}</div>
                  <div className={`text-lg font-mono font-bold px-2 py-1 rounded ${getRsiBg(coin.rsi[tf])}`}>
                    {coin.rsi[tf]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">Médias Móveis</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'MA 10', value: coin.ma10 },
                { label: 'MA 20', value: coin.ma20 },
                { label: 'MA 80', value: coin.ma80 },
              ].map((ma) => (
                <div key={ma.label} className="text-center space-y-1">
                  <div className="text-xs text-muted-foreground">{ma.label}</div>
                  <div className="text-sm font-mono font-semibold">{formatPrice(ma.value)}</div>
                  <div className={`text-[10px] font-mono ${coin.price > ma.value ? 'text-primary' : 'text-destructive'}`}>
                    {coin.price > ma.value ? '▲ Acima' : '▼ Abaixo'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
