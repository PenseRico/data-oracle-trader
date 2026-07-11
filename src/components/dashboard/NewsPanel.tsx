import { useNews } from "@/lib/api/cryptopanic";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  TrendingUp,
  TrendingDown,
  MessageSquare,
  ArrowUpRight,
  Zap
} from "lucide-react";

export function NewsPanel() {
  const { data: news, isLoading } = useNews();

  if (isLoading) {
    return (
      <div className="glass-card p-4 rounded-xl border-white/10 space-y-4 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="space-y-2">
           <div className="h-10 bg-muted rounded" />
           <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col h-[550px] rounded-2xl border-white/5 bg-black/40 relative overflow-hidden group">
      {/* Header Visual */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-primary/5">
         <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary fill-primary/20 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Institutional Feed</span>
         </div>
         <div className="flex items-center gap-1.5">
           <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground">Syncing</span>
         </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-white/5">
          {news?.map((item) => {
            // Determine sentiment based on votes
            const sentimentScore = item.votes.positive - item.votes.negative;
            const isBullish = sentimentScore > 0;
            const isBearish = sentimentScore < 0;
            const SentimentIcon = isBullish ? TrendingUp : isBearish ? TrendingDown : ArrowUpRight;
            const sentimentColor = isBullish ? "text-emerald-400" : isBearish ? "text-rose-400" : "text-muted-foreground";

            return (
              <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors group/item cursor-pointer">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <p className="text-[12px] font-medium leading-snug group-hover/item:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </p>
                  <div className={`p-1.5 rounded bg-black/50 border border-white/5 ${sentimentColor}`}>
                     <SentimentIcon className="h-3 w-3" />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                   <div className="flex flex-wrap gap-1.5">
                     <Badge variant="outline" className="text-[8px] h-4 px-1.5 bg-white/5 text-muted-foreground border-none font-mono">
                       {item.source.title}
                     </Badge>
                     {item.currencies?.slice(0, 2).map(c => (
                       <Badge key={c.code} variant="outline" className="text-[8px] h-4 px-1.5 bg-primary/10 text-primary border-none">
                         {c.code}
                       </Badge>
                     ))}
                   </div>
                   <div className="flex gap-3 text-[9px] font-mono text-muted-foreground/60">
                      <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-2.5 w-2.5" />{item.votes.comments}</span>
                   </div>
                </div>
              </div>
            );
          })}

          {!news?.length && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-40">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-[10px] uppercase tracking-widest font-mono">Awaiting feed...</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
