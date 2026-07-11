import { useState, useMemo, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, ChevronDown, ChevronUp, Info, Target } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMarketCap } from "@/data/mockCoins";
import { MiniSparkline } from "./MiniSparkline";
import { InfoHint } from "./InfoHint";
import { EnrichedCoin, getClassBg, getClassColor } from "@/lib/signalEngine";

interface SignalEngineTableProps {
  coins: EnrichedCoin[];
  title?: string;
  isLoading?: boolean;
  onSelect?: (symbol: string) => void;
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

export function SignalEngineTable({ coins, title, isLoading, onSelect }: SignalEngineTableProps) {
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
              <TableHead className="text-xs text-center">
                <div className="flex items-center justify-center gap-1"><SortHeader field="score">Score</SortHeader><InfoHint id="confluencia" /></div>
              </TableHead>
              <TableHead className="text-xs text-center">Sinal</TableHead>
              <TableHead className="text-xs text-right"><SortHeader field="price">Preço</SortHeader></TableHead>
              <TableHead className="text-xs text-right hidden md:table-cell"><SortHeader field="change24h">24h</SortHeader></TableHead>
              <TableHead className="text-xs text-center">
                <div className="flex items-center justify-center gap-1"><SortHeader field="rsi">RSI</SortHeader><InfoHint id="rsi" /></div>
              </TableHead>
              <TableHead className="text-xs text-center hidden md:table-cell">
                <div className="flex items-center justify-center gap-1">MAs<InfoHint id="movingAverages" /></div>
              </TableHead>
              <TableHead className="text-xs text-center hidden lg:table-cell">
                <div className="flex items-center justify-center gap-1">Fib / BB<InfoHint id="fibonacci" /></div>
              </TableHead>
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
                  const isGoldenPocket = coin.current_price >= coin.indicators.fib[0.618] * 0.995 && coin.current_price <= coin.indicators.fib[0.618] * 1.005;

                  return (
                    <Fragment key={coin.id}>
                      <TableRow
                        className={`border-border/20 cursor-pointer hover:bg-primary/5 transition-colors ${s.isGoldenZone ? "bg-cyan-500/5" : s.isExhaustionZone ? "bg-red-500/5" : ""}`}
                        onClick={() => {
                          if (onSelect) onSelect(coin.symbol);
                          else navigate(`/dashboard/coin/${coin.id}`);
                        }}
                      >
                        <TableCell className="text-xs text-muted-foreground font-mono">{coin.market_cap_rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                            <div>
                              <div className="font-medium text-sm">{coin.name}</div>
                              <div className="text-[10px] text-muted-foreground uppercase font-mono">{coin.symbol}</div>
                              {coin.indicators.fundingRate !== undefined && (
                                <Badge variant="outline" className={`text-[8px] h-3 px-1 border-none py-0 font-black tracking-tighter ${coin.indicators.fundingRate < 0 ? "text-green-500" : "text-muted-foreground/40"}`}>
                                  FR: {(coin.indicators.fundingRate * 100).toFixed(4)}%
                                </Badge>
                              )}
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
                          <div className="flex flex-col items-center gap-1">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 whitespace-nowrap ${getClassBg(s.classification)}`}>
                              {s.emoji} {s.label}
                            </Badge>
                            {s.confluence === "High" && (
                              <Badge variant="outline" className="text-[8px] px-1 bg-primary/10 text-primary border-primary/20 uppercase font-bold">
                                High Confluence
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatPrice(coin.current_price)}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          <span className={`text-sm font-mono ${change24 >= 0 ? "text-primary" : "text-destructive"}`}>
                            {change24 >= 0 ? "+" : ""}{change24.toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex items-center justify-center text-xs font-mono font-bold px-2 py-0.5 rounded transition-all ${
                              s.isGoldenZone ? "bg-cyan-500 text-black animate-pulse" : 
                              s.isExhaustionZone ? "bg-red-500 text-black animate-pulse" :
                              coin.rsi >= 70 ? "bg-destructive/10 text-destructive" : 
                              coin.rsi <= 30 ? "bg-primary/10 text-primary" : 
                              "bg-muted text-muted-foreground"
                            }`}>
                              {Math.round(coin.rsi)}
                            </span>
                            {s.isGoldenZone && <span className="text-[8px] text-cyan-400 font-bold uppercase">Golden</span>}
                            {s.isExhaustionZone && <span className="text-[8px] text-red-400 font-bold uppercase">Exhaust</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            {coin.ma10 > coin.ma20 ? (
                              <span className="text-[10px] text-primary">Bull ▲</span>
                            ) : (
                              <span className="text-[10px] text-destructive">Bear ▼</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                           <div className="flex flex-col items-center gap-1">
                              {isGoldenPocket && (
                                <Badge className="bg-primary text-black font-black text-[8px] h-4 px-1 leading-none uppercase animate-pulse">Fib 0.618</Badge>
                              )}
                              {coin.current_price >= coin.indicators.bb.upper ? (
                                <span className="text-[9px] text-red-400 font-bold uppercase tracking-tighter">BB Upper</span>
                              ) : coin.current_price <= coin.indicators.bb.lower ? (
                                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-tighter">BB Lower</span>
                              ) : (
                                <span className="text-[8px] text-muted-foreground/40 font-mono uppercase tracking-widest italic">Neutral BB</span>
                              )}
                           </div>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground font-mono hidden lg:table-cell">
                          {formatMarketCap(coin.total_volume)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-right">
                          <div className="flex justify-end">
                            <MiniSparkline data={sparkData} positive={change7d >= 0} />
                          </div>
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
                        <TableRow className="border-border/10">
                          <TableCell colSpan={11} className="p-0">
                            <div className="bg-black/60 border-y border-white/5 p-5 animate-fade-in">
                              <div className="flex flex-col xl:flex-row gap-6">
                                {/* Left side: Score Breakdown Visual */}
                                <div className="xl:w-1/3 space-y-4">
                                  <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-4">
                                    <Info className="h-3.5 w-3.5 text-primary" /> Confluência de Sinal
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    {(["momentum", "trend", "volatility", "volume", "sentiment"] as const).map((cat) => {
                                      const val = s.breakdown[cat];
                                      const isPos = val > 0;
                                      const isNeg = val < 0;
                                      const pct = Math.abs(val) / 4 * 100; // max ~4 per category
                                      return (
                                        <div key={cat} className="space-y-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{cat}</span>
                                            <span className={`text-[10px] font-mono font-bold ${isPos ? "text-primary" : isNeg ? "text-destructive" : "text-muted-foreground"}`}>
                                              {isPos ? "+" : ""}{val}
                                            </span>
                                          </div>
                                          <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                                            {isPos ? (
                                              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                                            ) : isNeg ? (
                                              <div className="h-full bg-destructive" style={{ width: `${pct}%`, marginLeft: "auto" }} />
                                            ) : (
                                              <div className="h-full w-full bg-muted-foreground/20" />
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex flex-col justify-center items-center">
                                       <span className="text-[8px] uppercase tracking-widest text-primary/60 mb-1">Status Final</span>
                                       <span className="text-[11px] font-black uppercase text-primary tracking-widest">{s.confluence}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right side: Drivers / Triggers */}
                                <div className="flex-1 space-y-4 xl:pl-6 xl:border-l border-white/5">
                                  <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-4">
                                    <Target className="h-3.5 w-3.5 text-primary" /> Gatilhos de Ação (Drivers)
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {s.reasons.map((r, i) => {
                                      const isBull = r.points > 0;
                                      return (
                                        <div key={i} className="flex gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                                          <div className={`mt-0.5 h-4 w-4 shrink-0 rounded flex items-center justify-center font-black font-mono text-[9px] ${isBull ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                                            {isBull ? "+" : ""}{r.points}
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge variant="outline" className="text-[8px] h-3.5 px-1 py-0 uppercase border-white/10 font-mono tracking-widest">{r.factor}</Badge>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-mono">
                                              {r.description.replace(/^O /, "").replace(/^A /, "").replace(/^Os /, "")}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
