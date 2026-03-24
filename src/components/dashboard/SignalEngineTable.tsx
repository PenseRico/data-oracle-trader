import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMarketCap } from "@/data/mockCoins";
import { MiniSparkline } from "./MiniSparkline";
import { EnrichedCoin, getClassBg, getClassColor } from "@/lib/signalEngine";

interface SignalEngineTableProps {
  coins: EnrichedCoin[];
  title?: string;
  isLoading?: boolean;
}

type SortField = "rank" | "score" | "rsi" | "price" | "change24h" | "volume";

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function ScoreBar({ score, max = 12 }: { score: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, ((score + max) / (2 * max)) * 100));
  const color = score >= 8 ? "bg-primary" : score >= 5 ? "bg-yellow-400" : score >= 3 ? "bg-muted-foreground" : score >= 1 ? "bg-orange-400" : "bg-destructive";
  return (
    <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SignalEngineTable({ coins, title, isLoading }: SignalEngineTableProps) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir(field === "rank" ? "asc" : "desc"); }
  };

  const sorted = useMemo(() => {
    return [...coins].sort((a, b) => {
      let va: number, vb: number;
      switch (sortBy) {
        case "score": va = a.signal.total; vb = b.signal.total; break;
        case "rsi": va = a.rsi; vb = b.rsi; break;
        case "price": va = a.current_price; vb = b.current_price; break;
        case "change24h": va = a.price_change_percentage_24h_in_currency ?? 0; vb = b.price_change_percentage_24h_in_currency ?? 0; break;
        case "volume": va = a.total_volume; vb = b.total_volume; break;
        default: va = a.market_cap_rank; vb = b.market_cap_rank;
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [coins, sortBy, sortDir]);

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
            <div key={i} className="h-12 rounded bg-muted/30 animate-pulse" />
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
              <TableHead className="w-10 text-xs">#</TableHead>
              <TableHead className="text-xs">Moeda</TableHead>
              <TableHead className="text-xs text-center"><SortHeader field="score">Score</SortHeader></TableHead>
              <TableHead className="text-xs text-center">Sinal</TableHead>
              <TableHead className="text-xs text-right"><SortHeader field="price">Preço</SortHeader></TableHead>
              <TableHead className="text-xs text-right hidden md:table-cell"><SortHeader field="change24h">24h</SortHeader></TableHead>
              <TableHead className="text-xs text-center"><SortHeader field="rsi">RSI</SortHeader></TableHead>
              <TableHead className="text-xs text-center hidden md:table-cell">MAs</TableHead>
              <TableHead className="text-xs text-right hidden lg:table-cell"><SortHeader field="volume">Volume</SortHeader></TableHead>
              <TableHead className="text-xs text-right hidden lg:table-cell w-24">7D</TableHead>
              <TableHead className="text-xs w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((coin) => {
              const s = coin.signal;
              const change24 = coin.price_change_percentage_24h_in_currency ?? 0;
              const change7d = coin.price_change_percentage_7d_in_currency ?? 0;
              const sparkData = coin.sparkline_in_7d?.price?.filter((_, i) => i % 6 === 0) || [];
              const isExpanded = expandedId === coin.id;

              return (
                <>
                  <TableRow
                    key={coin.id}
                    className="border-border/20 cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => navigate(`/dashboard/coin/${coin.id}`)}
                  >
                    <TableCell className="text-xs text-muted-foreground font-mono">{coin.market_cap_rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                        <div>
                          <div className="font-medium text-sm">{coin.name}</div>
                          <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-mono font-bold ${getClassColor(s.classification)}`}>
                          {s.total}
                        </span>
                        <ScoreBar score={s.total} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${getClassBg(s.classification)}`}>
                        {s.emoji} {s.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatPrice(coin.current_price)}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <span className={`text-sm font-mono ${change24 >= 0 ? "text-primary" : "text-destructive"}`}>
                        {change24 >= 0 ? "+" : ""}{change24.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center justify-center text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        coin.rsi >= 70 ? "bg-destructive/10 text-destructive" : coin.rsi <= 30 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {Math.round(coin.rsi)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {coin.ma10 > coin.ma20 ? (
                          <span className="text-[10px] text-primary">▲ Bull</span>
                        ) : (
                          <span className="text-[10px] text-destructive">▼ Bear</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground font-mono hidden lg:table-cell">
                      {formatMarketCap(coin.total_volume)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <MiniSparkline data={sparkData} positive={change7d >= 0} />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : coin.id); }}
                        className="p-1 hover:bg-primary/10 rounded transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow key={`${coin.id}-details`} className="border-border/10 bg-card/30">
                      <TableCell colSpan={11} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <Info className="h-3 w-3" />
                            Por que {s.label}? — Análise de confluência
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(["momentum", "trend", "volume", "sentiment"] as const).map((cat) => (
                              <div key={cat} className="glass-card rounded-lg p-3 space-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{cat}</span>
                                <div className={`text-lg font-mono font-bold ${s.breakdown[cat] > 0 ? "text-primary" : s.breakdown[cat] < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                  {s.breakdown[cat] > 0 ? "+" : ""}{s.breakdown[cat]}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1.5">
                            {s.reasons.map((r, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <span className={`font-mono font-bold w-8 text-right ${r.points > 0 ? "text-primary" : r.points < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                  {r.points > 0 ? "+" : ""}{r.points}
                                </span>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/50">{r.factor}</Badge>
                                <span className="text-muted-foreground">{r.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
