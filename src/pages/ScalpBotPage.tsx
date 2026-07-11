import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { Badge } from "@/components/ui/badge";
import { InfoHint } from "@/components/dashboard/InfoHint";
import { fetchUsdtSpotSymbols } from "@/lib/setupCompraBot";
import { isStablecoin } from "@/lib/tradePlan";
import {
  scanScalp,
  SCALP_CONFIG,
  type ScalpResult,
  type ScalpSignal,
  type MacroRsi,
  type ScalpTf,
} from "@/lib/scalpBot";
import { Zap, Activity, Play, Loader2, AlertCircle, Flame, Target, ShieldAlert, Crosshair } from "lucide-react";

const TFS: ScalpTf[] = ["1d", "4h", "1h", "5m"];
const TF_LABEL: Record<ScalpTf, string> = { "1d": "Diário", "4h": "4h", "1h": "1h", "5m": "5m" };

function rsiColor(v: number) {
  if (!isFinite(v)) return "#52525b";
  if (v <= SCALP_CONFIG.extreme) return "#ec4899"; // extrema
  if (v <= SCALP_CONFIG.oversold) return "#22d3ee"; // sobrevendido
  if (v >= 70) return "#f43f5e";
  return "#a1a1aa";
}

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(3);
  if (n >= 0.01) return n.toFixed(5);
  return n.toFixed(8);
}

function MacroRow({ label, macro }: { label: string; macro: MacroRsi }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-[11px] font-black uppercase tracking-widest text-white/90">{label}</span>
      <div className="flex-1 grid grid-cols-4 gap-2">
        {TFS.map((tf) => {
          const v = macro.rsi[tf];
          const c = rsiColor(v);
          return (
            <div key={tf} className="rounded-md border border-white/5 bg-black/40 px-2 py-1.5 text-center">
              <div className="text-[8px] uppercase tracking-widest text-muted-foreground/50 font-mono">{TF_LABEL[tf]}</div>
              <div className="text-sm font-black font-mono" style={{ color: c }}>{isFinite(v) ? Math.round(v) : "—"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScalpCard({ s }: { s: ScalpSignal }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/dashboard/analysis/${s.symbol}`)}
      className={`text-left glass-card rounded-xl border bg-black/60 overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform ${
        s.extreme ? "border-pink-500/40 shadow-[0_0_18px_-6px_rgba(236,72,153,0.5)]" : "border-cyan-500/25"
      }`}
    >
      <div className={`flex items-center justify-between px-4 py-2.5 ${s.extreme ? "bg-pink-500/10" : "bg-cyan-500/10"}`}>
        <span className="flex items-center gap-2">
          <span className="font-black tracking-wide text-white text-sm">{s.base}<span className="text-muted-foreground/40">/USDT</span></span>
          {s.extreme && (
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-pink-300 bg-pink-500/15">
              <Flame className="h-2.5 w-2.5" /> Extrema
            </span>
          )}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/60">{s.oversoldCount}/4 TFs sobrevendidos</span>
      </div>

      {/* RSI por timeframe */}
      <div className="grid grid-cols-4 gap-1.5 px-4 pt-3">
        {TFS.map((tf) => {
          const v = s.rsi[tf];
          const c = rsiColor(v);
          return (
            <div key={tf} className="rounded-md border border-white/5 bg-black/30 px-1 py-1 text-center">
              <div className="text-[8px] uppercase tracking-widest text-muted-foreground/50 font-mono">{TF_LABEL[tf]}</div>
              <div className="text-[12px] font-black font-mono" style={{ color: c }}>{isFinite(v) ? Math.round(v) : "—"}</div>
            </div>
          );
        })}
      </div>

      {/* plano de scalp */}
      <div className="p-4 pt-3 space-y-1.5">
        <Row icon={Crosshair} label="Entrada" value={`$${fmt(s.entry)}`} tone="text-white" />
        <Row icon={Target} label="Alvo rápido" value={`$${fmt(s.target)}`} tone="text-emerald-300" />
        <Row icon={ShieldAlert} label="Stop" value={`$${fmt(s.stop)}`} tone="text-rose-300" />
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

export default function ScalpBotPage() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<ScalpResult | null>(null);
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
        .slice(0, 300);
      const res = await scanScalp(symbols, (done, total) => setProgress({ done, total }));
      setResult(res);
      setRanAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      if (res.errors === res.scanned && res.scanned > 0) setError("Todas as requisições à Binance falharam — provável bloqueio de rede/região.");
    } catch (e: any) {
      setError(`Falha ao acessar a Binance: ${e?.message ?? "erro"}.`);
    } finally {
      setScanning(false);
    }
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  // veredito macro: mercado sobrevendido nas baixas TFs?
  const macroOversold = result &&
    [result.btc, result.alt].every((m) => (m.rsi["5m"] <= 40 || m.rsi["1h"] <= 40));

  return (
    <DashboardLayout>
      <PageShell
        title={<>Bot <span className="text-primary">Scalping</span></>}
        subtitle="Radar de sobrevenda extrema · confluência D/4h/1h/5m · contexto BTC + TOTAL2"
        icon={Zap}
        accent="primary"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bot Scalping" }]}
        actions={
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[9px] uppercase tracking-widest gap-1.5">
            <Activity className="h-3 w-3" /> Sobrevenda Extrema
          </Badge>
        }
      >
        {/* Botão */}
        <section className="glass-card rounded-xl border-primary/20 bg-primary/[0.04] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Radar de Scalping</h3>
                <p className="text-[10px] text-muted-foreground/70 font-mono uppercase tracking-wider">
                  Clique e o bot varre o mercado atrás de moedas entrando em sobrevenda extrema
                </p>
              </div>
            </div>
            <button
              onClick={run}
              disabled={scanning}
              className="flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/40 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-primary" />}
              {scanning ? "Varrendo…" : "Rodar Radar"}
            </button>
          </div>

          {scanning && (
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">{progress.done} / {progress.total} pares · {pct}%</div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-200/90 font-mono leading-relaxed">{error}</p>
            </div>
          )}
        </section>

        {/* Contexto Macro (BTC + TOTAL2) */}
        {result && !error && (
          <section className="glass-card rounded-xl border-white/5 bg-black/40 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Contexto do Mercado (RSI)</h3>
              <InfoHint
                term="Contexto BTC + TOTAL2"
                what="RSI do BTC e das altcoins (proxy TOTAL2 = média de grandes alts) nos 4 timeframes."
                how="Se BTC e alts estão sobrevendidos nas baixas TFs, o repique é mais provável — cenário favorável a scalp long."
              />
              {macroOversold && (
                <Badge variant="outline" className="ml-auto bg-cyan-500/10 border-cyan-500/30 text-cyan-300 text-[9px] uppercase tracking-widest">
                  Mercado sobrevendido — favorável a scalp
                </Badge>
              )}
            </div>
            <MacroRow label="Bitcoin" macro={result.btc} />
            <MacroRow label="Altcoins (TOTAL2)" macro={result.alt} />
            <p className="text-[9px] text-muted-foreground/50 font-mono pt-1">
              TOTAL2 = média do RSI de ETH · SOL · BNB · XRP · ADA · AVAX · DOGE · LINK (proxy — o índice TOTAL2 não tem dados públicos por API).
            </p>
          </section>
        )}

        {result && !error && (
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 px-1">
            <span><span className="text-pink-300 font-bold">{result.signals.filter((s) => s.extreme).length}</span> extremas</span>
            <span><span className="text-cyan-300 font-bold">{result.signals.length}</span> sobrevendidas</span>
            <span><span className="text-white font-bold">{result.scanned}</span> pares</span>
            {result.errors > 0 && <span className="text-amber-300/70">{result.errors} erros</span>}
            {ranAt && <span className="ml-auto">às {ranAt}</span>}
          </div>
        )}

        {/* Radar */}
        {result && result.signals.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {result.signals.map((s) => <ScalpCard key={s.symbol} s={s} />)}
          </section>
        )}
        {result && result.signals.length === 0 && !error && (
          <div className="glass-card rounded-xl border-white/5 p-8 text-center text-[12px] text-muted-foreground/70 font-mono">
            Nenhuma moeda em sobrevenda (RSI 5m ≤ {SCALP_CONFIG.oversold}) agora. Rode de novo em instantes.
          </div>
        )}
      </PageShell>
    </DashboardLayout>
  );
}
