import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { useNews } from "@/lib/api/cryptopanic";
import { Newspaper, Clock, ExternalLink, TrendingUp, MessageSquare, CalendarRange, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EconomicCalendarWidget } from "@/components/dashboard/EconomicCalendarWidget";

type NewsFilter = "hot" | "rising" | "bullish" | "bearish" | "important";

const FILTERS: { id: NewsFilter; label: string }[] = [
  { id: "hot", label: "Em Alta" },
  { id: "rising", label: "Crescendo" },
  { id: "bullish", label: "Bullish" },
  { id: "bearish", label: "Bearish" },
  { id: "important", label: "Importantes" },
];

function NewsList({ filter }: { filter: NewsFilter }) {
  const apiKey = import.meta.env.VITE_CRYPTOPANIC_KEY as string | undefined;
  const { data: news, isLoading } = useNews(apiKey, filter);

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
    return (
      <div className="text-center py-16 text-muted-foreground italic text-sm">
        Sem notícias para o filtro selecionado.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-340px)] pr-3">
      <ul className="space-y-2">
        {news.map((item) => {
          const url = `https://cryptopanic.com/news/${item.slug}`;
          const sentiment =
            item.votes.positive > item.votes.negative * 1.5
              ? "bullish"
              : item.votes.negative > item.votes.positive * 1.5
              ? "bearish"
              : "neutral";
          return (
            <li
              key={item.id}
              className="group flex items-start gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                <div
                  className={`h-2 w-2 rounded-full ${
                    sentiment === "bullish"
                      ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                      : sentiment === "bearish"
                      ? "bg-rose-400 shadow-[0_0_6px_#fb7185]"
                      : "bg-muted-foreground/40"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground/70 uppercase tracking-widest font-mono">
                  <span className="font-bold">{item.source.title}</span>
                  <span className="opacity-40">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(item.published_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-semibold leading-snug group-hover:text-primary transition-colors"
                >
                  {item.title}
                </a>
                <div className="flex items-center gap-2 pt-1">
                  {item.currencies?.slice(0, 4).map((c) => (
                    <Badge
                      key={c.code}
                      variant="outline"
                      className="text-[9px] h-4 px-1.5 bg-primary/5 text-primary border-primary/20 font-mono"
                    >
                      {c.code}
                    </Badge>
                  ))}
                  <div className="flex items-center gap-3 ml-auto text-[10px] text-muted-foreground/70 font-mono">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-400/70" /> {item.votes.positive}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {item.votes.comments}
                    </span>
                  </div>
                </div>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                aria-label="Abrir notícia"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}

export default function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>("hot");
  const apiKey = import.meta.env.VITE_CRYPTOPANIC_KEY as string | undefined;

  return (
    <DashboardLayout>
      <PageShell
        title={<>Terminal de <span className="text-primary">Notícias</span></>}
        subtitle="CryptoPanic + Calendário Econômico · Sentiment Cross-Source"
        icon={Newspaper}
        accent="primary"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notícias" }]}
        actions={
          !apiKey ? (
            <Badge
              variant="outline"
              className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[9px] uppercase tracking-widest"
            >
              Modo demo · adicione VITE_CRYPTOPANIC_KEY
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[9px] uppercase tracking-widest"
            >
              CryptoPanic conectado
            </Badge>
          )
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <section className="space-y-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as NewsFilter)}>
              <div className="flex items-center justify-between gap-3">
                <TabsList className="bg-white/[0.03] border border-white/5">
                  {FILTERS.map((f) => (
                    <TabsTrigger
                      key={f.id}
                      value={f.id}
                      className="text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
                    >
                      {f.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60 uppercase tracking-widest font-mono">
                  <Filter className="h-3 w-3" />
                  Sentiment
                </div>
              </div>
              {FILTERS.map((f) => (
                <TabsContent key={f.id} value={f.id} className="mt-4">
                  <NewsList filter={f.id} />
                </TabsContent>
              ))}
            </Tabs>
          </section>

          <aside className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <CalendarRange className="h-4 w-4 text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                Calendário Econômico
              </h3>
              <Badge
                variant="outline"
                className="ml-auto bg-white/5 border-white/10 text-muted-foreground text-[8px] uppercase tracking-widest"
              >
                Alto Impacto
              </Badge>
            </div>
            <div className="glass-card rounded-xl border-white/5 bg-black/40 overflow-hidden p-1">
              <EconomicCalendarWidget height={620} />
            </div>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed italic px-1">
              Eventos macro (FOMC, CPI, NFP) são os maiores movimentadores de cripto. Filtro por moeda:
              USD · EUR · CNY.
            </p>
          </aside>
        </div>
      </PageShell>
    </DashboardLayout>
  );
}
