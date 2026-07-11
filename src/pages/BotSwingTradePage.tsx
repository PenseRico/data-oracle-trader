import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { Badge } from "@/components/ui/badge";
import { InfoHint } from "@/components/dashboard/InfoHint";
import { isStablecoin } from "@/lib/tradePlan";
import {
  scanSetupCompra,
  fetchUsdtSpotSymbols,
  SETUP_COMPRA_CONFIG,
  type ScanResult,
  type SetupSignal,
} from "@/lib/setupCompraBot";
import {
  Bot, Activity, Gauge, TrendingUp, Layers, Play, Loader2, AlertCircle, Target, ShieldAlert, Crosshair, Hourglass,
} from "lucide-react";

const STRATEGY = [
  { icon: Gauge, label: "RSI(14)", value: "entre 40 e 57", note: "Momentum saindo do fundo, sem estar esticado." },
  { icon: TrendingUp, label: "EMA(80)", value: "preço a ±2%", note: "Preço colado na média de tendência (suporte dinâmico)." },
  { icon: Activity, label: "Volume", value: "+0% a +500% vs SMA20", note: "Interesse crescente, sem clímax exagerado." },
  { icon: Layers, label: "Gatilho", value: "high atual > high anterior", note: "Confirmação de força na barra que fecha." },
];

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(3);
  if (n >= 0.01) return n.toFixed(5);
  return n.toFixed(8);
}

function SignalCard({ s }: { s: SetupSignal }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/dashboard/analysis/${s.symbol}`)}
      className="text-left glass-card rounded-xl border border-emerald-500/30 bg-black/60 overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform"
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-500/10">
        <span className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-300" />
          <span className="font-black tracking-wide text-white text-sm">{s.base}<span className="text-muted-foreground/40">/USDT</span></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">COMPRA</span>
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/60">RSI {s.rsi.toFixed(0)} · vol +{s.volChangePct.toFixed(0)}%</span>
      </div>
      <div className="p-4 space-y-2">
        <Row icon={Crosshair} label="Região de compra" value={`$${fmt(s.entryLow)} – $${fmt(s.entryHigh)}`} tone="text-white" />
        <Row icon={Target} label="Parcial 1 (1R)" value={`$${fmt(s.partial1)}`} tone="text-emerald-300" />
        <Row icon={Target} label="Parcial 2 (2R)" value={`$${fmt(s.partial2)}`} tone="text-emerald-300" />
        <Row icon={Target} label="Saída total" value={`$${fmt(s.total)}`} tone="text-emerald-200" />
        <Row icon={ShieldAlert} label="Stop" value={`$${fmt(s.stop)}`} tone="text-rose-300" />
        <div className="pt-2 mt-1 border-t border-white/5 text-[10px] font-mono text-muted-foreground/60">
          Risco <span className="text-rose-300 font-bold">{s.riskPct.toFixed(1)}%</span> · entrada perto da EMA80 · realize parcial em cada alvo
        </div>
      </div>
    </button>
  );
}

function Row({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 font-mono"><Icon className="h-3 w-3" /> {label}</span>
      <span className={`text-[12px] font-black font-mono ${tone}`}>{value}</span>
    </div>
  );
}

export default function BotSwingTradePage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ranAt, setRanAt] = useState<string | null>(null);

  const run = async () => {
    setScanning(true);
    setError(null);
    setResult(null);
    setProgress({ done: 0, total: 0 });
    try {
      const symbols = (await fetchUsdtSpotSymbols())
        .filter((s) => !isStablecoin(s.replace("USDT", "")))
        .slice(0, 450);
      const res = await scanSetupCompra(symbols, SETUP_COMPRA_CONFIG, (done, total) => setProgress({ done, total }));
      setResult(res);
      setRanAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      if (res.errors === res.scanned && res.scanned > 0) {
        setError("Todas as requisições à Binance falharam — provável bloqueio de rede/região no navegador.");
      }
    } catch (e: any) {
      setError(`Falha ao acessar a Binance: ${e?.message ?? "erro de rede"}. A Binance pode estar bloqueada no navegador.`);
    } finally {
      setScanning(false);
    }
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <DashboardLayout>
      <PageShell
        title={<>Bot <span className="text-primary">Swing Trade</span></>}
        subtitle="Scanner Setup Compra · mesmas velas da Binance que o TradingView usa · roda no navegador"
        icon={Bot}
        accent="primary"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bot Swing Trade" }]}
        actions={
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[9px] uppercase tracking-widest gap-1.5">
            <Activity className="h-3 w-3" /> Setup Compra · 4h
          </Badge>
        }
      >
        {/* ── Botão que roda a análise ── */}
        <section className="glass-card rounded-xl border-primary/20 bg-primary/[0.04] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Análise de Mercado</h3>
                <p className="text-[10px] text-muted-foreground/70 font-mono uppercase tracking-wider">
                  Clique e o bot varre todas as moedas e já entrega região de compra, parciais e stop
                </p>
              </div>
            </div>
            <button
              onClick={run}
              disabled={scanning}
              className="flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/40 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-primary" />}
              {scanning ? "Varrendo…" : "Rodar Análise"}
            </button>
          </div>

          {scanning && (
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">{progress.done} / {progress.total} pares varridos · {pct}%</div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-200/90 font-mono leading-relaxed">{error}</p>
            </div>
          )}

          {result && !error && (
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
              <span><span className="text-emerald-300 font-bold">{result.signals.length}</span> sinais cheios</span>
              <span><span className="text-amber-300 font-bold">{result.forming.length}</span> em formação</span>
              <span><span className="text-white font-bold">{result.scanned}</span> pares</span>
              {result.errors > 0 && <span className="text-amber-300/70">{result.errors} erros</span>}
              {ranAt && <span className="ml-auto">às {ranAt}</span>}
            </div>
          )}
        </section>

        {/* ── Sinais cheios (4/4) ── */}
        {result && result.signals.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Crosshair className="h-4 w-4 text-emerald-400" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Sinais de Compra · Setup Cheio</h3>
              <InfoHint term="Setup Cheio" what="As 4 condições do Setup Compra bateram na barra fechada de 4h." how="É o sinal mais forte. Compre na região indicada, realize parcial em cada alvo e proteja com o stop." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {result.signals.map((s) => <SignalCard key={s.symbol} s={s} />)}
            </div>
          </section>
        )}

        {/* ── Em formação (3/4) ── */}
        {result && result.forming.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Hourglass className="h-4 w-4 text-amber-400" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Em Formação · 3 de 4 condições</h3>
              <InfoHint term="Em formação" what="Faltou 1 das 4 condições (ex.: o gatilho de rompimento ainda não veio)." how="Watchlist: ative o alerta e acompanhe — se fechar a 4ª condição, vira sinal cheio." />
            </div>
            <div className="glass-card rounded-lg overflow-hidden border-white/5 bg-black/40">
              {result.forming.map((s) => {
                const missing = !s.conds.rsi ? "RSI" : !s.conds.price ? "preço/EMA80" : !s.conds.vol ? "volume" : "gatilho";
                return (
                  <button key={s.symbol} onClick={() => navigate(`/dashboard/analysis/${s.symbol}`)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border-b border-white/[0.03] hover:bg-amber-500/5 transition-colors text-left">
                    <span className="text-xs font-black tracking-wide text-white">{s.base}<span className="text-muted-foreground/40">/USDT</span></span>
                    <span className="text-[10px] font-mono text-muted-foreground/60">RSI {s.rsi.toFixed(0)} · dist {s.distancePct >= 0 ? "+" : ""}{s.distancePct.toFixed(1)}%</span>
                    <span className="text-[10px] font-mono text-amber-300/80">falta: {missing}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {result && result.signals.length === 0 && result.forming.length === 0 && !error && (
          <div className="glass-card rounded-xl border-white/5 p-8 text-center text-[12px] text-muted-foreground/70 font-mono">
            Nenhum par em Setup Compra na última barra de 4h. Rode novamente após o próximo fechamento.
          </div>
        )}

        {/* ── Estratégia ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Gauge className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Como o bot decide a compra</h3>
            <InfoHint term="Setup Compra (Bot)" what="Replica o seu indicador Pine 'Setup Compra' em todos os pares spot USDT da Binance no 4h, rodando no navegador." how="Um par só vira sinal cheio quando RSI, EMA80, volume e o gatilho batem juntos na barra fechada." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {STRATEGY.map((s) => (
              <div key={s.label} className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{s.label}</span>
                </div>
                <div className="text-sm font-black font-mono text-primary mb-1">{s.value}</div>
                <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{s.note}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-mono px-1">
            Conexão com corretora para execução automática fica para depois (exige backend seguro). Por enquanto, sinal + plano pronto pra você executar.
          </p>
        </section>
      </PageShell>
    </DashboardLayout>
  );
}
