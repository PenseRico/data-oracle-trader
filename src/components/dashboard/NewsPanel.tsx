import { Newspaper, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCryptoNews } from "@/lib/api/news";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function NewsPanel() {
  const { data: news, isLoading } = useCryptoNews();

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <Newspaper className="h-4 w-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Notícias Rápidas</h3>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Ao vivo
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="divide-y divide-border/20">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-3 space-y-2 animate-pulse">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-2 w-1/3 rounded bg-muted/50" />
                </div>
              ))
            : news?.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-relaxed group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {item.source.title}
                        </span>
                        <span className="text-border">·</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {timeAgo(item.published_at)}
                        </span>
                        {item.currencies?.map((c) => (
                          <Badge
                            key={c.code}
                            variant="outline"
                            className="text-[8px] px-1 py-0 h-4 border-primary/20 text-primary/70"
                          >
                            {c.code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary/50 shrink-0 mt-0.5" />
                  </div>
                </a>
              ))}
        </div>
      </ScrollArea>
    </div>
  );
}
