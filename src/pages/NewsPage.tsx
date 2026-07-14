import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { useNews } from "@/lib/api/cryptopanic";
import { Newspaper, Clock, ExternalLink, CalendarRange } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EconomicCalendarWidget } from "@/components/dashboard/EconomicCalendarWidget";

function NewsList() {
  const { data: news, isLoading } = useNews();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/[0.02] border border-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!news?.length) {
    return <div className="text-center py-16 text-muted-foreground italic text-sm">Buscando notícias do mercado...</div>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)] pr-3">
      <ul className="space-y-2">
        {news.map((item) => (
          <li key={item.id} className="group">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground/70 uppercase tracking-widest font-mono">
                  <span className="font-bold">{item.source}</span>
                  <span className="opacity-40">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(item.published_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <span className="block text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                  {item.title}
                </span>
                {item.currencies.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {item.currencies.map((c) => (
                      <Badge key={c} variant="outline" className="text-[9px] h-4 px-1.5 bg-primary/5 text-primary border-primary/20 font-mono">
                        {c}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground group-hover:text-primary" />
            </a>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

export default function NewsPage() {
  return (
    <DashboardLayout>
      <PageShell
        title={<>Terminal de <span className="text-primary">Notícias</span></>}
        subtitle="CryptoPanic ao vivo + Calendário Econômico"
        icon={Newspaper}
        accent="primary"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notícias" }]}
        actions={
          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[9px] uppercase tracking-widest">
            ao vivo · CryptoPanic
          </Badge>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <section className="space-y-4">
            <NewsList />
          </section>

          <aside className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <CalendarRange className="h-4 w-4 text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Calendário Econômico</h3>
              <Badge variant="outline" className="ml-auto bg-white/5 border-white/10 text-muted-foreground text-[8px] uppercase tracking-widest">
                Alto Impacto
              </Badge>
            </div>
            <div className="glass-card rounded-xl border-white/5 bg-black/40 overflow-hidden p-1">
              <EconomicCalendarWidget height={620} />
            </div>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed italic px-1">
              Eventos macro (FOMC, CPI, NFP) são os maiores movimentadores de cripto.
            </p>
          </aside>
        </div>
      </PageShell>
    </DashboardLayout>
  );
}
