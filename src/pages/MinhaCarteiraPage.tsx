import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InfoHint } from "@/components/dashboard/InfoHint";
import { TrendBadge } from "@/components/dashboard/TrendBadge";
import { useMarkets, calculateRSI, type CoinGeckoMarket } from "@/lib/api/coingecko";
import { computeTrend } from "@/lib/trend";
import { analisarCarteira } from "@/lib/aiReader";
import { Wallet, Plus, Trash2, Target, ShieldAlert, Crosshair, Sparkles, Loader2 } from "lucide-react";

interface Holding {
  symbol: string; // BTC
  qty: number;
  cost: number; // preço médio de compra (0 = desconhecido)
}

const STORAGE_KEY = "oracle:carteira";

function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function fmtUsd(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
}

/** Leitura real (sem IA): estado + zona de venda/recompra a partir do sparkline. */
function readCoin(coin: CoinGeckoMarket) {
  const prices = coin.sparkline_in_7d?.price ?? [];
  const rsi = prices.length > 15 ? calculateRSI(prices) : 50;
  const recent = prices.slice(-48);
  const high = recent.length ? Math.max(...recent) : coin.current_price;
  const low = recent.length ? Math.min(...recent) : coin.current_price;
  const price = coin.current_price;
  // zona de realização (venda): perto da resistência recente; recompra: perto do suporte
  const sellZone = Math.max(high, price) * 1.0;
  const rebuyZone = Math.min(low, price) * 0.995;
  const estado =
    rsi >= 70 ? "Sobrecomprado — atenção a realização" : rsi <= 30 ? "Sobrevendido — possível acúmulo" : "Neutro";
  return { rsi, sellZone, rebuyZone, estado };
}

export default function MinhaCarteiraPage() {
  const navigate = useNavigate();
  const { data: markets } = useMarkets(1, 250);
  const [holdings, setHoldings] = useState<Holding[]>(loadHoldings);
  const [sym, setSym] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  }, [holdings]);

  const bySymbol = useMemo(() => {
    const m = new Map<string, CoinGeckoMarket>();
    (markets ?? []).forEach((c) => c.symbol && m.set(c.symbol.toLowerCase(), c));
    return m;
  }, [markets]);

  const rows = useMemo(() => {
    return holdings.map((h) => {
      const coin = bySymbol.get(h.symbol.toLowerCase());
      const price = coin?.current_price ?? 0;
      const value = price * h.qty;
      const invested = h.cost > 0 ? h.cost * h.qty : 0;
      const pnl = invested > 0 ? value - invested : 0;
      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
      return { h, coin, price, value, invested, pnl, pnlPct };
    });
  }, [holdings, bySymbol]);

  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalInvested = rows.reduce((s, r) => s + r.invested, 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const add = () => {
    const s = sym.trim().toUpperCase();
    const q = parseFloat(qty);
    if (!s || !q || q <= 0) return;
    setHoldings((prev) => {
      const existing = prev.find((h) => h.symbol.toUpperCase() === s);
      if (existing) return prev.map((h) => (h.symbol.toUpperCase() === s ? { ...h, qty: q, cost: parseFloat(cost) || h.cost } : h));
      return [...prev, { symbol: s, qty: q, cost: parseFloat(cost) || 0 }];
    });
    setSym(""); setQty(""); setCost("");
  };

  const remove = (symbol: string) => setHoldings((prev) => prev.filter((h) => h.symbol !== symbol));

  // ── IA (Pro) — roda pela nossa Edge Function (chave no servidor, cliente não vê nada) ──
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const runAI = async () => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const payload = rows
        .filter((r) => r.coin)
        .map((r) => {
          const reading = readCoin(r.coin!);
          const t = computeTrend(r.coin!.sparkline_in_7d?.price);
          return {
            symbol: r.h.symbol,
            price: Number(r.price.toFixed(r.price >= 1 ? 2 : 6)),
            rsi: reading.rsi,
            trend: t?.dir ?? "LATERAL",
            qty: r.h.qty,
            pnlPct: r.invested > 0 ? r.pnlPct : undefined,
          };
        });
      if (!payload.length) { setAiError("Adicione moedas válidas antes de analisar."); return; }
      setAiResult(await analisarCarteira(payload));
    } catch (e: any) {
      setAiError(e?.message ?? "erro na IA");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageShell
        title={<>Minha <span className="text-primary">Carteira</span></>}
        subtitle="Adicione suas moedas · leitura real de estado + pontos de venda/recompra"
        icon={Wallet}
        accent="primary"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Minha Carteira" }]}
        actions={
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[9px] uppercase tracking-widest">
            {holdings.length} ativos · salvo no navegador
          </Badge>
        }
      >
        {/* Resumo */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Valor Atual" value={fmtUsd(totalValue)} tone="text-white" />
          <StatCard label="Investido" value={totalInvested > 0 ? fmtUsd(totalInvested) : "—"} tone="text-muted-foreground" />
          <StatCard label="Lucro/Prejuízo" value={totalInvested > 0 ? `${totalPnl >= 0 ? "+" : ""}${fmtUsd(totalPnl)}` : "—"} tone={totalPnl >= 0 ? "text-emerald-300" : "text-rose-300"} />
          <StatCard label="Retorno" value={totalInvested > 0 ? `${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(1)}%` : "—"} tone={totalPnl >= 0 ? "text-emerald-300" : "text-rose-300"} />
        </section>

        {/* Adicionar moeda */}
        <section className="glass-card rounded-xl border-primary/20 bg-primary/[0.04] p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">Moeda (ex.: BTC)</label>
              <Input value={sym} onChange={(e) => setSym(e.target.value)} placeholder="BTC" className="bg-black/40 border-white/10 h-10 font-mono uppercase" />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">Quantidade</label>
              <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="0.5" className="bg-black/40 border-white/10 h-10 font-mono" />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">Preço médio (opcional)</label>
              <Input value={cost} onChange={(e) => setCost(e.target.value)} type="number" placeholder="60000" className="bg-black/40 border-white/10 h-10 font-mono" />
            </div>
            <button onClick={add} className="flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/40 px-4 h-10 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors">
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>
        </section>

        {/* Análise por IA */}
        <section className="glass-card rounded-xl border-primary/30 bg-primary/[0.05] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Análise por IA</h3>
                <p className="text-[10px] text-muted-foreground/70 font-mono">A IA lê sua carteira e dá venda/recompra + 2 cenários com probabilidade</p>
              </div>
            </div>
            <button
              onClick={runAI}
              disabled={aiLoading || rows.length === 0}
              className="flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/40 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiLoading ? "Analisando…" : "Analisar com IA"}
            </button>
          </div>


          {aiError && (
            <div className="text-[11px] text-rose-300/90 font-mono bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">{aiError}</div>
          )}
          {aiResult && (
            <div className="whitespace-pre-wrap text-[12px] leading-relaxed text-foreground/90 bg-black/40 border border-white/5 rounded-lg p-4 font-sans">
              {aiResult}
            </div>
          )}
        </section>

        {/* Cartões por moeda */}
        {rows.length === 0 ? (
          <div className="glass-card rounded-xl border-white/5 p-10 text-center text-[12px] text-muted-foreground/70 font-mono">
            Adicione suas moedas acima. A leitura é feita com dados reais (CoinGecko/Binance) — a narração por IA entra em breve.
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rows.map(({ h, coin, price, value, pnl, pnlPct, invested }) => {
              const reading = coin ? readCoin(coin) : null;
              return (
                <div key={h.symbol} className="glass-card rounded-xl border-white/[0.06] bg-black/50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      {coin?.image && <img src={coin.image} alt="" className="h-6 w-6 rounded-full" />}
                      <span className="font-black tracking-wide text-white">{h.symbol}</span>
                      {coin && <TrendBadge prices={coin.sparkline_in_7d?.price} />}
                    </div>
                    <button onClick={() => remove(h.symbol)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors" aria-label="Remover">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <Line label="Preço" value={coin ? fmtUsd(price) : "—"} tone="text-white" />
                    <Line label="Quantidade" value={`${h.qty} ${h.symbol}`} tone="text-muted-foreground" />
                    <Line label="Valor" value={fmtUsd(value)} tone="text-white" />
                    {invested > 0 && (
                      <Line label="Lucro/Prejuízo" value={`${pnl >= 0 ? "+" : ""}${fmtUsd(pnl)} (${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%)`} tone={pnl >= 0 ? "text-emerald-300" : "text-rose-300"} />
                    )}
                    {!coin && <div className="text-[10px] text-amber-300/70 font-mono">Moeda não encontrada no top 250 (verifique o símbolo).</div>}
                  </div>
                  {reading && (
                    <div className="px-4 pb-4 space-y-1.5 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/80 mb-1">
                        <Sparkles className="h-3 w-3" /> Leitura
                        <InfoHint term="Leitura da carteira" what="Estado atual + zonas sugeridas de venda (realização) e recompra, a partir de RSI e estrutura de preço reais." how="São pontos de estudo, NÃO ordens. A decisão e o risco são seus." />
                      </div>
                      <Line label="Estado" value={reading.estado} tone={reading.rsi >= 70 ? "text-rose-300" : reading.rsi <= 30 ? "text-cyan-300" : "text-zinc-300"} icon={Crosshair} />
                      <Line label="Zona de venda" value={fmtUsd(reading.sellZone)} tone="text-emerald-300" icon={Target} />
                      <Line label="Zona de recompra" value={fmtUsd(reading.rebuyZone)} tone="text-cyan-300" icon={Target} />
                      <button onClick={() => navigate(`/dashboard/analysis/${h.symbol}USDT`)} className="mt-1 text-[10px] font-mono text-primary hover:underline">
                        ver análise completa ↗
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 max-w-3xl">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-mono">
            As zonas são <span className="text-white">pontos de estudo</span> gerados de dados reais — não são recomendação de investimento.
            A decisão e o risco de comprar/vender são seus. Em breve a IA narra essa leitura em linguagem simples.
          </p>
        </div>
      </PageShell>
    </DashboardLayout>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className={`text-lg font-black font-mono ${tone}`}>{value}</div>
    </div>
  );
}

function Line({ label, value, tone, icon: Icon }: { label: string; value: string; tone: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 font-mono">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </span>
      <span className={`text-[12px] font-black font-mono ${tone}`}>{value}</span>
    </div>
  );
}
