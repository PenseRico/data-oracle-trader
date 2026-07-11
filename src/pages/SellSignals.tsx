import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { SignalEngineTable } from "@/components/dashboard/SignalEngineTable";
import { useMarkets, useFearGreed } from "@/lib/api/coingecko";
import { enrichCoins } from "@/lib/signalEngine";
import { isStablecoin } from "@/lib/tradePlan";
import { TrendingDown, Target, Zap, Waves } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export default function SellSignals() {
  const { data: markets, isLoading } = useMarkets(1, 100);
  const { data: fg } = useFearGreed();
  const fgVal = fg?.data?.[0]?.value ? parseInt(fg.data[0].value) : undefined;

  const sellCoins = useMemo(() => {
    if (!markets) return [];
    return enrichCoins(markets, fgVal)
      .filter((c) => !isStablecoin(c.symbol) && c.signal.total <= 0)
      .sort((a, b) => a.signal.total - b.signal.total);
  }, [markets, fgVal]);

  return (
    <DashboardLayout>
      <PageShell
        title={<>Sinais de <span className="text-rose-400">Venda</span></>}
        subtitle={`Exaustão · Score ≤ 0 · ${sellCoins.length} alvos detectados`}
        icon={TrendingDown}
        accent="destructive"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sinais de Venda" },
        ]}
        actions={
          <>
            <Badge variant="outline" className="bg-rose-500/10 border-rose-500/30 text-rose-400 text-[9px] uppercase tracking-widest">
              Exhaustion Mode
            </Badge>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground text-[9px] uppercase tracking-widest">
              {sellCoins.length} alvos
            </Badge>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={Zap}
            title="Lógica de Distribuição"
            text="Score ≤ 0 indica exaustão compradora e início de distribuição institucional."
            tone="destructive"
          />
          <InfoCard
            icon={Target}
            title="Liquidity Flush"
            text="Picos de calor ciano no Mapa de Liquidez sinalizam liquidação de shorts e reversão."
            tone="default"
          />
          <InfoCard
            icon={Waves}
            title="Take Profit"
            text="Foco em zonas de exaustão de momentum para proteção de ganhos e saída parcial."
            tone="amber"
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <TrendingDown className="h-4 w-4 text-rose-400" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">
              Zonas Estratégicas de Venda & Exaustão
            </h3>
          </div>
          <div className="glass-card rounded-xl overflow-hidden border-white/5 bg-black/40">
            <SignalEngineTable coins={sellCoins} title="" isLoading={isLoading} />
            {!isLoading && sellCoins.length === 0 && (
              <div className="p-12 text-center text-muted-foreground border-t border-white/5 italic text-sm">
                Aguardando sinais de exaustão compradora...
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
  tone: "primary" | "default" | "destructive" | "amber";
}) {
  const tones: Record<string, { wrap: string; icon: string; title: string }> = {
    primary: { wrap: "border-primary/20 bg-primary/5", icon: "text-primary", title: "text-primary" },
    default: { wrap: "border-white/5 bg-white/[0.02]", icon: "text-muted-foreground", title: "text-foreground" },
    destructive: { wrap: "border-rose-500/20 bg-rose-500/5", icon: "text-rose-400", title: "text-rose-400" },
    amber: { wrap: "border-amber-500/20 bg-amber-500/5", icon: "text-amber-400", title: "text-amber-400" },
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
