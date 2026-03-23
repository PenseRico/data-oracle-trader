import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CoinData, TimeFrame, formatPrice, formatMarketCap, formatVolume, getRsiBg, getSignalConfig } from "@/data/mockCoins";
import { MiniSparkline } from "./MiniSparkline";

interface CoinTableProps {
  coins: CoinData[];
  title?: string;
}

export function CoinTable({ coins, title }: CoinTableProps) {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<TimeFrame>('4h');
  const [sortBy, setSortBy] = useState<string>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const sorted = [...coins].sort((a, b) => {
    let va: number, vb: number;
    switch (sortBy) {
      case 'price': va = a.price; vb = b.price; break;
      case 'change24h': va = a.change24h; vb = b.change24h; break;
      case 'marketCap': va = a.marketCap; vb = b.marketCap; break;
      case 'rsi': va = a.rsi[timeframe]; vb = b.rsi[timeframe]; break;
      default: va = a.rank; vb = b.rank;
    }
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {title && <h2 className="font-display font-bold text-lg">{title}</h2>}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Timeframe RSI:</span>
          <Select value={timeframe} onValueChange={(v) => setTimeframe(v as TimeFrame)}>
            <SelectTrigger className="w-20 h-8 text-xs bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4h">4H</SelectItem>
              <SelectItem value="12h">12H</SelectItem>
              <SelectItem value="24h">24H</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="w-12 text-xs">#</TableHead>
              <TableHead className="text-xs">Moeda</TableHead>
              <TableHead className="text-xs text-right">
                <SortHeader field="price">Preço</SortHeader>
              </TableHead>
              <TableHead className="text-xs text-right hidden md:table-cell">
                <SortHeader field="change24h">24h %</SortHeader>
              </TableHead>
              <TableHead className="text-xs text-right hidden lg:table-cell">
                <SortHeader field="marketCap">Market Cap</SortHeader>
              </TableHead>
              <TableHead className="text-xs text-center">
                <SortHeader field="rsi">RSI {timeframe.toUpperCase()}</SortHeader>
              </TableHead>
              <TableHead className="text-xs text-center hidden md:table-cell">MA 10/20/80</TableHead>
              <TableHead className="text-xs text-center">Sinal</TableHead>
              <TableHead className="text-xs text-right hidden lg:table-cell w-24">7D</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((coin) => {
              const signal = getSignalConfig(coin.signal);
              const rsiValue = coin.rsi[timeframe];
              return (
                <TableRow
                  key={coin.id}
                  className="border-border/20 cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => navigate(`/dashboard/coin/${coin.id}`)}
                >
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {coin.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {coin.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{coin.name}</div>
                        <div className="text-xs text-muted-foreground">{coin.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatPrice(coin.price)}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <span className={`text-sm font-mono ${coin.change24h >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono hidden lg:table-cell">
                    {formatMarketCap(coin.marketCap)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center text-xs font-mono font-bold px-2 py-0.5 rounded ${getRsiBg(rsiValue)}`}>
                      {rsiValue}
                    </span>
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-muted-foreground">
                      <span>{formatPrice(coin.ma10)}</span>
                      <span className="text-border">/</span>
                      <span>{formatPrice(coin.ma20)}</span>
                      <span className="text-border">/</span>
                      <span>{formatPrice(coin.ma80)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${signal.className}`}>
                      {signal.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <MiniSparkline data={coin.sparkline} positive={coin.change7d >= 0} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
