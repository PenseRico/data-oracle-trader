import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InfoHint } from "@/components/dashboard/InfoHint";
import { TrendBadge } from "@/components/dashboard/TrendBadge";
import { useMarkets, calculateRSI, type CoinGeckoMarket } from "@/lib/api/coingecko";
import { computeTrend } from "@/lib/trend";
import { analisarCarteira, QuotaError } from "@/lib/aiReader";
import { useQuota } from "@/hooks/useQuota";
import { Wallet, Plus, Trash2, Target, ShieldAlert, Crosshair, Sparkles, Loader2, Pencil, Check, X, Clock, Lock } from "lucide-react";

/** Um LOTE = uma compra. A mesma moeda pode ter vários lotes. */
interface Lot {
  id: string;
  symbol: string; // BTC (maiúsculo)
  qty: number;
  price: number;  // preço da compra (0 = desconhecido)
  date?: string;  // YYYY-MM-DD (opcional)
}

const STORAGE_KEY = "oracle:carteira-lotes";
const OLD_KEY = "oracle:carteira";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadLots(): Lot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // Migração do formato antigo {symbol, qty, cost}[] → 1 lote por moeda.
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const arr = JSON.parse(old) as { symbol: string; qty: number; cost: number }[];
      return arr.map((h) => ({ id: uid(), symbol: (h.symbol || "").toUpperCase(), qty: h.qty, price: h.cost || 0 }));
    }
    return [];
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
  const sellZone = Math.max(high, price) * 1.0;
  const rebuyZone = Math.min(low, price) * 0.995;
  const estado =
    rsi >= 70 ? "Sobrecomprado — atenção a realização" : rsi <= 30 ? "Sobrevendido — possível acúmulo" : "Neutro";
  return { rsi, sellZone, rebuyZone, estado };
}

export default function MinhaCarteiraPage() {
  const navigate = useNavigate();
  const { data: markets } = useMarkets(1, 250);
  const [lots, setLots] = useState<Lot[]>(loadLots);

  // form de nova compra
  const [sym, setSym] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // edição inline de um lote
  const [editId, setEditId] = useState<string | null>(null);
  const [eQty, setEQty] = useState("");
  const [ePrice, setEPrice] = useState("");
  const [eDate, setEDate] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lots));
  }, [lots]);

  const bySymbol = useMemo(() => {
    const m = new Map<string, CoinGeckoMarket>();
    (markets ?? []).forEach((c) => c.symbol && m.set(c.symbol.toLowerCase(), c));
    return m;
  }, [markets]);

  // Agrupa lotes por moeda + calcula média ponderada, valor e P/L.
  const coins = useMemo(() => {
    const groups = new Map<string, Lot[]>();
    lots.forEach((l) => {
      const s = (l.symbol || "").toUpperCase();
      groups.set(s, [...(groups.get(s) ?? []), l]);
    });
    return Array.from(groups.entries()).map(([symbol, coinLots]) => {
      const coin = bySymbol.get(symbol.toLowerCase());
      const price = coin?.current_price ?? 0;
      const totalQty = coinLots.reduce((s, l) => s + l.qty, 0);
      const invested = coinLots.reduce((s, l) => s + (l.price > 0 ? l.price * l.qty : 0), 0);
      const qtyWithPrice = coinLots.reduce((s, l) => s + (l.price > 0 ? l.qty : 0), 0);
      const avgPrice = qtyWithPrice > 0 ? invested / qtyWithPrice : 0;
      const value = price * totalQty;
      const pnl = invested > 0 ? value - invested : 0;
      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
      return { symbol, coin, coinLots, price, totalQty, invested, avgPrice, value, pnl, pnlPct };
    });
  }, [lots, bySymbol]);

  const totalValue = coins.reduce((s, c) => s + c.value, 0);
  const totalInvested = coins.reduce((s, c) => s + c.invested, 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const addLot = () => {
    const s = sym.trim().toUpperCase();
    const q = parseFloat(qty);
    if (!s || !q || q <= 0) return;
    setLots((prev) => [...prev, { id: uid(), symbol: s, qty: q, price: parseFloat(price) || 0, date: date || undefined }]);
    setSym(""); setQty(""); setPrice(""); setDate("");
  };

  const removeLot = (id: string) => setLots((prev) => prev.filter((l) => l.id !== id));

  const startEdit = (l: Lot) => {
    setEditId(l.id);
    setEQty(String(l.qty));
    setEPrice(l.price > 0 ? String(l.price) : "");
    setEDate(l.date ?? "");
  };
  const saveEdit = (id: string) => {
    const q = parseFloat(eQty);
    if (!q || q <= 0) return;
    setLots((prev) => prev.map((l) => (l.id === id ? { ...l, qty: q, price: parseFloat(ePrice) || 0, date: eDate || undefined } : l)));
    setEditId(null);
  };

  // "+ compra" de uma moeda que já existe: pré-preenche o símbolo e rola até o form.
  const addAnother = (symbol: string) => {
    setSym(symbol);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ── IA (cota Pro: 1 estudo da carteira por semana, travado no servidor) ──
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const quota = useQuota("carteira");

  const runAI = async () => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const payload = coins
        .filter((c) => c.coin)
        .map((c) => {
          const reading = readCoin(c.coin!);
          const t = computeTrend(c.coin!.sparkline_in_7d?.price);
          return {
            symbol: c.symbol,
            price: Number(c.price.toFixed(c.price >= 1 ? 2 : 6)),
            rsi: reading.rsi,
            trend: t?.dir ?? "LATERAL",
            qty: c.totalQty,
            pnlPct: c.invested > 0 ? c.pnlPct : undefined,
          };
        });
      if (!payload.length) { setAiError("Adicione moedas válidas antes de analisar."); return; }
      setAiResult(await analisarCarteira(payload));
      quota.refresh(); // consumiu 1 → atualiza o timer
    } catch (e: any) {
      if (e instanceof QuotaError) {
        setAiError("Você já usou o estudo da carteira desta semana.");
        quota.refresh();
      } else {
        setAiError(e?.message ?? "erro na IA");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const inputCls = "bg-black/40 border border-white/10 rounded-md h-8 px-2 text-[11px] font-mono text-white focus:outline-none focus:border-primary/40";

  return (
    <DashboardLayout>
      <PageShell
        title={<>Minha <span className="text-primary">Carteira</span></>}
        subtitle="Registre cada compra (mesmo da mesma moeda) · média e P/L automáticos · pontos de venda/recompra"
        icon={Wallet}
        accent="primary"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Minha Carteira" }]}
        actions={
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[9px] uppercase tracking-widest">
            {coins.length} moedas · {lots.length} compras · salvo no navegador
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

        {/* Registrar compra */}
        <section ref={formRef} className="glass-card rounded-xl border-primary/20 bg-primary/[0.04] p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-3">Registrar uma compra</div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[110px]">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">Moeda</label>
              <Input value={sym} onChange={(e) => setSym(e.target.value)} placeholder="BTC" className="bg-black/40 border-white/10 h-10 font-mono uppercase" />
            </div>
            <div className="flex-1 min-w-[90px]">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">Quantidade</label>
              <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="0.01" className="bg-black/40 border-white/10 h-10 font-mono" />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">Preço da compra</label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="60000" className="bg-black/40 border-white/10 h-10 font-mono" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">Data (opcional)</label>
              <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="bg-black/40 border-white/10 h-10 font-mono text-muted-foreground" />
            </div>
            <button onClick={addLot} className="flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/40 px-4 h-10 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors">
              <Plus className="h-4 w-4" /> Adicionar compra
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-mono mt-2">Comprou a mesma moeda outra vez? É só registrar de novo — vira um lote separado e a média se ajusta sozinha.</p>
        </section>

        {/* Análise por IA */}
        <section className="glass-card rounded-xl border-primary/30 bg-primary/[0.05] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Análise por IA</h3>
                <p className="text-[10px] text-muted-foreground/70 font-mono">
                  A IA lê sua carteira e dá venda/recompra + cenários · <span className="text-primary/80">1 estudo por semana (Pro)</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={runAI}
                disabled={aiLoading || coins.length === 0 || quota.exhausted}
                className="flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/40 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" />
                  : quota.exhausted ? <Lock className="h-4 w-4" />
                  : <Sparkles className="h-4 w-4" />}
                {aiLoading ? "Analisando…" : quota.exhausted ? "Cota usada" : "Analisar com IA"}
              </button>
              {quota.exhausted && quota.eta && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300/80">
                  <Clock className="h-3 w-3" /> próximo estudo em {quota.eta}
                </span>
              )}
            </div>
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
        {coins.length === 0 ? (
          <div className="glass-card rounded-xl border-white/5 p-10 text-center text-[12px] text-muted-foreground/70 font-mono">
            Registre suas compras acima. Cada compra vira um lote — a carteira soma tudo e calcula sua média e lucro/prejuízo.
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coins.map((c) => {
              const reading = c.coin ? readCoin(c.coin) : null;
              return (
                <div key={c.symbol} className="glass-card rounded-xl border-white/[0.06] bg-black/50 overflow-hidden">
                  {/* header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      {c.coin?.image && <img src={c.coin.image} alt="" className="h-6 w-6 rounded-full" />}
                      <span className="font-black tracking-wide text-white">{c.symbol}</span>
                      {c.coin && <TrendBadge prices={c.coin.sparkline_in_7d?.price} />}
                    </div>
                    {c.invested > 0 && (
                      <span className={`text-[11px] font-black font-mono ${c.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {c.pnl >= 0 ? "+" : ""}{c.pnlPct.toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {/* agregado */}
                  <div className="p-4 space-y-1.5">
                    <Line label="Preço atual" value={c.coin ? fmtUsd(c.price) : "—"} tone="text-white" />
                    <Line label="Quantidade total" value={`${c.totalQty} ${c.symbol}`} tone="text-muted-foreground" />
                    <Line label="Preço médio" value={c.avgPrice > 0 ? fmtUsd(c.avgPrice) : "—"} tone="text-muted-foreground" />
                    <Line label="Valor" value={fmtUsd(c.value)} tone="text-white" />
                    {c.invested > 0 && (
                      <Line label="Lucro/Prejuízo" value={`${c.pnl >= 0 ? "+" : ""}${fmtUsd(c.pnl)}`} tone={c.pnl >= 0 ? "text-emerald-300" : "text-rose-300"} />
                    )}
                    {!c.coin && <div className="text-[10px] text-amber-300/70 font-mono">Moeda não encontrada no top 250 (verifique o símbolo).</div>}
                  </div>

                  {/* compras (lotes) */}
                  <div className="px-4 pb-3 border-t border-white/5 pt-3 space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Compras ({c.coinLots.length})</span>
                      <button onClick={() => addAnother(c.symbol)} className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline">
                        <Plus className="h-3 w-3" /> nova compra
                      </button>
                    </div>
                    {c.coinLots.map((l) => (
                      <div key={l.id} className="flex items-center gap-2 text-[11px] font-mono py-0.5">
                        {editId === l.id ? (
                          <>
                            <input value={eQty} onChange={(e) => setEQty(e.target.value)} type="number" placeholder="qtd" className={`${inputCls} w-16`} />
                            <span className="text-muted-foreground/40">@</span>
                            <input value={ePrice} onChange={(e) => setEPrice(e.target.value)} type="number" placeholder="preço" className={`${inputCls} w-20`} />
                            <input value={eDate} onChange={(e) => setEDate(e.target.value)} type="date" className={`${inputCls} w-[120px]`} />
                            <button onClick={() => saveEdit(l.id)} className="ml-auto text-emerald-400 hover:text-emerald-300" aria-label="Salvar"><Check className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setEditId(null)} className="text-muted-foreground/50 hover:text-white" aria-label="Cancelar"><X className="h-3.5 w-3.5" /></button>
                          </>
                        ) : (
                          <>
                            <span className="text-white/85">{l.qty} {c.symbol}</span>
                            <span className="text-muted-foreground/40">@</span>
                            <span className="text-white/70">{l.price > 0 ? fmtUsd(l.price) : "—"}</span>
                            {l.date && <span className="text-muted-foreground/40">· {l.date}</span>}
                            <button onClick={() => startEdit(l)} className="ml-auto text-muted-foreground/40 hover:text-primary" aria-label="Editar"><Pencil className="h-3 w-3" /></button>
                            <button onClick={() => removeLot(l.id)} className="text-muted-foreground/40 hover:text-rose-400" aria-label="Apagar"><Trash2 className="h-3 w-3" /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* leitura */}
                  {reading && (
                    <div className="px-4 pb-4 space-y-1.5 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/80 mb-1">
                        <Sparkles className="h-3 w-3" /> Leitura
                        <InfoHint term="Leitura da carteira" what="Estado atual + zonas sugeridas de venda (realização) e recompra, a partir de RSI e estrutura de preço reais." how="São pontos de estudo, NÃO ordens. A decisão e o risco são seus." />
                      </div>
                      <Line label="Estado" value={reading.estado} tone={reading.rsi >= 70 ? "text-rose-300" : reading.rsi <= 30 ? "text-cyan-300" : "text-zinc-300"} icon={Crosshair} />
                      <Line label="Zona de venda" value={fmtUsd(reading.sellZone)} tone="text-emerald-300" icon={Target} />
                      <Line label="Zona de recompra" value={fmtUsd(reading.rebuyZone)} tone="text-cyan-300" icon={Target} />
                      <button onClick={() => navigate(`/dashboard/analysis/${c.symbol}USDT`)} className="mt-1 text-[10px] font-mono text-primary hover:underline">
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
            A decisão e o risco de comprar/vender são seus.
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
