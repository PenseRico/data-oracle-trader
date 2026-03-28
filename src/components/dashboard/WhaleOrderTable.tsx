import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  getMockWhaleOrders, 
  WhaleOrder, 
  getWhaleMarketStats,
  WhaleMarketStats 
} from "@/lib/orderFlowEngine";
import { 
  ArrowUpCircle, ArrowDownCircle, Clock, 
  Globe, BarChart3, TrendingUp, TrendingDown 
} from "lucide-react";

export function WhaleOrderTable() {
  const [orders, setOrders] = useState<WhaleOrder[]>([]);
  const [stats, setStats] = useState<WhaleMarketStats | null>(null);

  useEffect(() => {
    // Initial fetch
    setOrders(getMockWhaleOrders());
    setStats(getWhaleMarketStats());

    // Simulation interval
    const interval = setInterval(() => {
      setOrders(getMockWhaleOrders());
      setStats(getWhaleMarketStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Volume Whale (24h)</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-display font-bold text-foreground font-mono">${stats.totalVolume24h}B</span>
            <TrendingUp className="h-4 w-4 text-primary opacity-50" />
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Buy/Sell Ratio</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-display font-bold text-primary font-mono">{stats.buyRatio}% / {stats.sellRatio}%</span>
            <BarChart3 className="h-4 w-4 text-primary opacity-50" />
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col gap-1 ring-1 ring-primary/20">
          <span className="text-[10px] uppercase tracking-widest text-primary font-mono">Whale Dominance</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-display font-bold text-primary font-mono">{stats.whaleDominance}%</span>
            <ArrowUpCircle className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Liquidity Depth</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-display font-bold text-foreground font-mono">${stats.liquidityDepth}M</span>
            <Globe className="h-4 w-4 text-muted-foreground/30" />
          </div>
        </div>
      </div>

      {/* High-Density Whale Table */}
      <div className="glass-card overflow-hidden border-primary/10">
        <div className="grid grid-cols-5 p-3 border-b border-white/[0.04] bg-white/[0.02] text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">
          <div>Lado</div>
          <div>Preço (USD)</div>
          <div className="text-right">Valor USD</div>
          <div className="text-right px-4">Exchange</div>
          <div className="text-right">Idade</div>
        </div>
        
        <ScrollArea className="h-[600px]">
          <div className="flex flex-col">
            {orders.map((order, idx) => (
              <div 
                key={`${order.id}-${idx}`}
                className="grid grid-cols-5 p-3 items-center border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors relative group"
              >
                {/* Volume Intensity Background */}
                <div 
                  className={`absolute inset-y-0 right-0 ${order.side === 'BUY' ? 'bg-primary/5' : 'bg-destructive/5'} transition-all duration-1000`}
                  style={{ width: `${(order.value / 10) * 100}%` }}
                />

                <div className="flex items-center gap-2 relative z-10">
                  {order.side === 'BUY' ? (
                    <Badge className="bg-primary/20 text-primary border-primary/30 h-5 px-1.5 text-[9px] font-mono">BUY</Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30 h-5 px-1.5 text-[9px] font-mono">SELL</Badge>
                  )}
                </div>

                <div className="font-mono text-sm font-bold text-foreground relative z-10">
                  ${order.price.toLocaleString()}
                </div>

                <div className="text-right font-mono text-sm text-foreground/80 relative z-10">
                  <span className={order.value > 5 ? 'text-primary' : ''}>${order.value.toFixed(2)}M</span>
                </div>

                <div className="text-right px-4 relative z-10">
                  <span className="text-[10px] font-mono text-muted-foreground/60 group-hover:text-muted-foreground transition-colors uppercase">
                    {order.exchange}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1.5 text-muted-foreground/40 text-[10px] font-mono relative z-10">
                  <Clock className="h-3 w-3" />
                  {order.age}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Technical Footer */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-mono italic">Live Whale Feed Active</span>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-mono">Cluster Sync: OK</div>
        </div>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-mono">
          Last Check: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
