import { useGlobalLiquidations, LiquidationOrder } from "@/lib/api/liquidation";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  symbol?: string;
}

export function LiquiditySnatchMap({ symbol }: Props) {
  const allLiquidations = useGlobalLiquidations(500);
  
  const heatmapData = useMemo(() => {
    // Filter by symbol if provided
    const filtered = symbol ? allLiquidations.filter(l => l.symbol === symbol) : allLiquidations;
    if (filtered.length === 0) return [];

    // Bucket price by 0.5% intervals
    const buckets: Record<string, { price: number; usdValue: number; count: number; side: string }> = {};
    
    filtered.forEach(l => {
        const bucketKey = (Math.floor(l.price * 200) / 200).toFixed(6); // Close bucketing
        if (!buckets[bucketKey]) {
            buckets[bucketKey] = { price: parseFloat(bucketKey), usdValue: 0, count: 0, side: l.side };
        }
        buckets[bucketKey].usdValue += l.usdValue;
        buckets[bucketKey].count += 1;
    });

    return Object.values(buckets)
      .sort((a, b) => b.price - a.price)
      .slice(0, 20); // Top 20 levels
  }, [allLiquidations, symbol]);

  if (heatmapData.length === 0) {
    return <Skeleton className="h-[300px] w-full bg-muted/10 rounded-xl" />;
  }

  return (
    <div className="glass-card p-6 rounded-xl border-white/5 bg-black/40 space-y-4">
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Liquidity Pool Density</h3>
           <p className="text-[10px] text-muted-foreground font-mono">Heat levels across major price clusters</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-1"><div className="h-1.5 w-4 bg-red-500/50 rounded" /> <span className="text-[9px] uppercase">Longs</span></div>
           <div className="flex items-center gap-1"><div className="h-1.5 w-4 bg-cyan-400/50 rounded" /> <span className="text-[9px] uppercase">Shorts</span></div>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={heatmapData}
            layout="vertical"
            margin={{ left: 20, right: 30, top: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
                dataKey="price" 
                type="category" 
                stroke="#666" 
                fontSize={10} 
                tickFormatter={(val) => `$${val.toLocaleString()}`}
                width={80}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-black/90 border border-white/10 p-2 rounded shadow-2xl backdrop-blur-md">
                     <p className="text-[10px] font-mono font-bold text-primary mb-1">NÍVEL: ${data.price.toLocaleString()}</p>
                     <p className="text-[11px] text-foreground">Liquidação: <span className="font-bold">${(data.usdValue/1000).toFixed(1)}K</span></p>
                     <p className="text-[10px] text-muted-foreground italic uppercase">Magnet Score: {(data.count * 10).toFixed(0)}</p>
                  </div>
                );
              }}
            />
            <Bar 
                dataKey="usdValue" 
                radius={[0, 4, 4, 0]} 
                barSize={12}
            >
              {heatmapData.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.side === "SELL" ? "rgba(239, 68, 68, 0.4)" : "rgba(34, 211, 238, 0.4)"} 
                    stroke={entry.side === "SELL" ? "#ef4444" : "#22d3ee"}
                    strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
         <p className="text-[10px] text-primary font-bold italic leading-relaxed">
            INFO PRONTA: O preço tende a buscar as zonas com maiores barras ("Zonas Magnéticas"). Monitore as barras mais longas como alvos de lucro ou pontos de pivot.
         </p>
      </div>
    </div>
  );
}
