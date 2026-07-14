import { useNews } from "@/lib/api/cryptopanic";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ArrowUpRight, Newspaper } from "lucide-react";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function NewsPanel() {
  const { data: news, isLoading } = useNews();

  return (
    <div className="glass-card flex flex-col h-[550px] rounded-2xl border-white/5 bg-black/40 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-primary/5">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Notícias do Mercado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground">ao vivo · CryptoPanic</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading && (
          <div className="p-4 space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-white/[0.03] rounded" />)}
          </div>
        )}

        <div className="divide-y divide-white/5">
          {news?.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 hover:bg-white/[0.02] transition-colors group/item"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <p className="text-[12px] font-medium leading-snug group-hover/item:text-primary transition-colors line-clamp-2">
                  {item.title}
                </p>
                <div className="p-1.5 rounded bg-black/50 border border-white/5 text-muted-foreground group-hover/item:text-primary transition-colors shrink-0">
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <Badge variant="outline" className="text-[8px] h-4 px-1.5 bg-white/5 text-muted-foreground border-none font-mono">
                    {item.source}
                  </Badge>
                  {item.currencies.map((c) => (
                    <Badge key={c} variant="outline" className="text-[8px] h-4 px-1.5 bg-primary/10 text-primary border-none">
                      {c}
                    </Badge>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground/60 shrink-0">
                  <Clock className="h-2.5 w-2.5" />{timeAgo(item.published_at)}
                </span>
              </div>
            </a>
          ))}

          {!isLoading && !news?.length && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-40">
              <Newspaper className="h-8 w-8 text-primary" />
              <span className="text-[10px] uppercase tracking-widest font-mono">Buscando notícias...</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
