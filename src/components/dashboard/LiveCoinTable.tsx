import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatMarketCap } from "@/data/mockCoins";
import { MiniSparkline } from "./MiniSparkline";
import { CoinGeckoMarket, calculateRSI, calculateSMA } from "@/lib/api/coingecko";

interface LiveCoinTableProps {
  coins: CoinGeckoMarket[];
  title?: string;
  isLoading?: boolean;
}

type SortField = "rank" | "price" | "change24h" | "marketCap" | "rsi" | "volume";

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function getRsiBg(rsi: number): string {
  if (rsi >= 70) return "bg-destructive/10 text-destructive";
  if (rsi <= 30) return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
}

function getSignalFromRSI(rsi: number) {
  if (rsi >= 70) return { label: "VENDA", className: "bg-destructive/15 text-destructive border-destructive/30" };
  if (rsi <= 30) return { label: "COMPRA", className: "bg-primary/15 text-primary border-primary/30" };
  return { label: "NEUTRO", className: "bg-muted text-muted-foreground border-border" };
}

export function LiveCoinTable({ coins, title, isLoading }: LiveCoinTableProps) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const enriched = useMemo(() => {
    return coins.map((coin) => {
      const sparkPrices = coin.sparkline_in_7d?.price || [];
      const rsi = calculateRSI(sparkPrices);
      const ma10 = calculateSMA(sparkPrices, 10);
      const ma20 = calculateSMA(sparkPrices, 20);
      const ma80 = calculateSMA(sparkPrices, 80);
      return { ...coin, rsi, ma10, ma20, ma80 };
    });
  }, [coins]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir(field === "rank" ? "asc" : "desc"); }
  };

  const sorted = useMemo(() => {
    return [...enriched].sort((a, b) => {
      let va: number, vb: number;
      switch (sortBy) {
        case "price": va = a.current_price; vb = b.current_price; break;
        case "change24h": va = a.price_change_percentage_24h_in_currency ?? 0; vb = b.price_change_percentage_24h_in_currency ?? 0; break;
        case "marketCap": va = a.market_cap; vb = b.market_cap; break;
        case "volume": va = a.total_volume; vb = b.total_volume; break;
        case "rsi": va = a.rsi; vb = b.rsi; break;
        default: va = a.market_cap_rank; vb = b.market_cap_rank;
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [enriched, sortBy, sortDir]);

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (isLoading) {
    return (
      <div className="glass-card rounded-lg p-6">
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="font-display font-bold text-lg">{title}</h2>}

      <div className="glass-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="w-12 text-xs">#</TableHead>
              <TableHead className="text-xs">Moeda</TableHead>
              <TableHead className="text-xs text-right"><SortHeader field="price">Preço</SortHeader></TableHead>
              <TableHead className="text-xs text-right hidden md:table-cell"><SortHeader field="change24h">24h %</SortHeader></TableHead>
              <TableHead className="text-xs text-right hidden lg:table-cell"><SortHeader field="marketCap">Market Cap</SortHeader></TableHead>
              <TableHead className="text-xs text-right hidden lg:table-cell"><SortHeader field="volume">Volume</SortHeader></TableHead>
              <TableHead className="text-xs text-center"><SortHeader field="rsi">RSI</SortHeader></TableHead>
              <TableHead className="text-xs text-center hidden md:table-cell">MA 10/20/80</TableHead>
              <TableHead className="text-xs text-center">Sinal</TableHead>
              <TableHead className="text-xs text-right hidden lg:table-cell w-24">7D</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((coin) => {
              const signal = getSignalFromRSI(coin.rsi);
              const change24 = coin.price_change_percentage_24h_in_currency ?? 0;
              const change7d = coin.price_change_percentage_7d_in_currency ?? 0;
              const sparkData = coin.sparkline_in_7d?.price?.filter((_, i) => i % 6 === 0) || [];

              return (
                <TableRow
                  key={coin.id}
                  className="border-border/20 cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => navigate(`/dashboard/coin/${coin.id}`)}
                >
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {coin.market_cap_rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                      <div>
                        <div className="font-medium text-sm">{coin.name}</div>
                        <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatPrice(coin.current_price)}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <span className={`text-sm font-mono ${change24 >= 0 ? "text-primary" : "text-destructive"}`}>
                      {change24 >= 0 ? "+" : ""}{change24.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono hidden lg:table-cell">
                    {formatMarketCap(coin.market_cap)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono hidden lg:table-cell">
                    {formatMarketCap(coin.total_volume)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center text-xs font-mono font-bold px-2 py-0.5 rounded ${getRsiBg(coin.rsi)}`}>
                      {Math.round(coin.rsi)}
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
                    <MiniSparkline data={sparkData} positive={change7d >= 0} />
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
