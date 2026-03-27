import { useNews } from "@/lib/api/cryptopanic";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Newspaper, 
  Clock, 
  ExternalLink, 
  TrendingUp,
  MessageSquare,
  ArrowUpRight
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
    <div className="glass-card p-5 rounded-2xl border-white/5 bg-black/40 shadow-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-5">
         <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Feed Institucional (Tempo Real)</span>
         </div>
      </div>

      <ScrollArea className="h-[500px] pr-2">
        <div className="space-y-4">
          {news?.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group/item">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-1.5 grayscale opacity-60 group-hover/item:grayscale-0 transition-all">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{item.source.title}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground/60 uppercase font-mono">
                    <Clock className="h-3 w-3" />
                    {new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
              </div>
              <p className="text-[11px] font-bold leading-relaxed group-hover/item:text-primary transition-colors line-clamp-2">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                 {item.currencies?.map(c => (
                   <Badge key={c.code} variant="outline" className="text-[8px] h-3.5 px-1.5 bg-primary/5 text-primary border-primary/20">{c.code}</Badge>
                 ))}
                 <div className="flex items-center gap-2 ml-auto">
                   <div className="flex items-center gap-1 text-[8px] font-black opacity-40">
                      <TrendingUp className="h-2.5 w-2.5 text-green-500" /> {item.votes.positive}
                   </div>
                   <div className="flex items-center gap-1 text-[8px] font-black opacity-40">
                      <MessageSquare className="h-2.5 w-2.5" /> {item.votes.comments}
                   </div>
                 </div>
              </div>
            </div>
          ))}

          {!news?.length && (
            <div className="text-center py-8 opacity-40 italic text-[10px]">Aguardando conexão institucional...</div>
          )}
        </div>
      </ScrollArea>
      
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
         <span className="text-[8px] font-black uppercase tracking-[0.2em]">Source: CryptoPanic Terminal</span>
         <ArrowUpRight className="h-3 w-3" />
      </div>
    </div>
  );
}
