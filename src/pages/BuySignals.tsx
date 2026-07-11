import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { enrichCoins } from "@/lib/signalEngine";
import { isStablecoin } from "@/lib/tradePlan";
import { TrendingUp, Target, Zap, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export default function BuySignals() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const { data: fg } = useFearGreed();
  const fgVal = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const buyCoins = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fgVal)
      .filter((c) => !isStablecoin(c.symbol) && c.signal.total >= 5)
      .sort((a, b) => b.signal.total - a.signal.total);
  }, [markets, fgVal]);

  return (
    <DashboardLayout>
      <PageShell
        title={<>Sinais de <span className="text-primary">Compra</span></>}
        subtitle={`Confluência alta · Score ≥ 5 · ${buyCoins.length} sinais ativos`}
        icon={TrendingUp}
        accent="primary"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sinais de Compra" },
        ]}
        actions={
          <>
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[9px] uppercase tracking-widest">
              Confluence Mode
            </Badge>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground text-[9px] uppercase tracking-widest">
              {buyCoins.length} sinais
            </Badge>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={Zap}
            title="Lógica de Entrada"
            text="Score ≥ 5 indica confluência de RSI oversold com volume crescente em múltiplos timeframes."
            tone="primary"
          />
          <InfoCard
            icon={Target}
            title="Confluência com Liquidez"
            text="Cruze com o Mapa de Liquidez antes de entrar — zonas amarelas atraem o preço como ímã."
            tone="default"
          />
          <InfoCard
            icon={ShieldCheck}
            title="Gestão de Risco"
            text="Stop loss abaixo da mínima do candle de 4h. Risco máximo por trade: 1-2% do capital."
            tone="emerald"
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">
              Sinais de Alta Probabilidade
            </h3>
          </div>
          <div className="glass-card rounded-xl overflow-hidden border-white/5 bg-black/40">
            <SignalEngineTable coins={buyCoins} title="" isLoading={isLoading} />
            {!isLoading && buyCoins.length === 0 && (
              <div className="p-12 text-center text-muted-foreground border-t border-white/5 italic text-sm">
                Aguardando confluência de sinais... varredura em andamento.
              </div>
            )}
          </div>
        </section>
      </PageShell>
    </DashboardLayout>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  tone: "primary" | "default" | "emerald" | "destructive";
}) {
  const tones: Record<string, { wrap: string; icon: string; title: string }> = {
    primary: { wrap: "border-primary/20 bg-primary/5", icon: "text-primary", title: "text-primary" },
    default: { wrap: "border-white/5 bg-white/[0.02]", icon: "text-muted-foreground", title: "text-foreground" },
    emerald: { wrap: "border-emerald-500/20 bg-emerald-500/5", icon: "text-emerald-400", title: "text-emerald-400" },
    destructive: { wrap: "border-rose-500/20 bg-rose-500/5", icon: "text-rose-400", title: "text-rose-400" },
  };
  const t = tones[tone];
  return (
    <div className={`glass-card p-4 rounded-xl flex items-start gap-3 ${t.wrap}`}>
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${t.icon}`} />
      <div className="space-y-1 min-w-0">
        <div className={`text-[10px] font-black uppercase tracking-widest ${t.title}`}>{title}</div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
