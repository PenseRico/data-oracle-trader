import { useState } from "react";
import { BrandName } from "@/components/BrandName";
import { Link } from "react-router-dom";
import { MANUAL_ABAS } from "@/lib/manual";
import {
  Zap, ArrowRight, BookOpen, Check, CircleDot, TrendingUp, TrendingDown,
  AlertTriangle, Lightbulb, ExternalLink,
} from "lucide-react";

function PlanoBadge({ plano }: { plano: "Grátis" | "Pro" }) {
  const pro = plano === "Pro";
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest rounded px-1.5 py-0.5 border ${pro ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
      {plano}
    </span>
  );
}

export default function ManualPage() {
  const [abaAtiva, setAbaAtiva] = useState(MANUAL_ABAS[0]?.id ?? "comecando");
  const aba = MANUAL_ABAS.find((a) => a.id === abaAtiva) ?? MANUAL_ABAS[0];

  return (
    <div className="min-h-screen bg-[#07080d] text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-glow">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <BrandName className="font-display font-black text-lg tracking-tighter" />
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-bold uppercase tracking-widest text-white/80">Manual</span>
          <Link to="/dashboard" className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-3 py-1.5 hover:bg-primary/25 transition-colors">
            Abrir plataforma <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-glow">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl tracking-tight text-white">Manual da Plataforma</h1>
            <p className="text-sm text-muted-foreground">Cada tela e cada indicador, explicado de forma simples — mastigado pra você.</p>
          </div>
        </div>

        {/* Abas */}
        <div className="sticky top-[57px] z-20 -mx-4 px-4 py-2 bg-[#07080d]/95 backdrop-blur border-b border-white/5 mb-8">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MANUAL_ABAS.map((a) => (
              <button
                key={a.id}
                onClick={() => { setAbaAtiva(a.id); window.scrollTo({ top: 0 }); }}
                className={`shrink-0 rounded-lg px-3.5 py-2 text-[12px] font-bold transition-colors border ${
                  a.id === abaAtiva
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-white/[0.03] border-white/5 text-muted-foreground hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {a.titulo}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-8">
          {/* Índice da aba */}
          <aside className="hidden lg:block">
            <nav className="sticky top-32 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{aba.titulo}</p>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed pb-1">{aba.descricao}</p>
              <ul className="space-y-0.5 border-l border-white/5">
                {aba.paginas.map((p) => (
                  <li key={p.id}>
                    <a href={`#${p.id}`} className="block pl-3 py-1 text-[12px] text-muted-foreground hover:text-white hover:border-l hover:border-primary -ml-px transition-colors">
                      {p.titulo}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Conteúdo da aba */}
          <main className="space-y-8 min-w-0">
            {aba.paginas.map((p) => (
              <article key={p.id} id={p.id} className="glass-card rounded-xl border border-white/[0.06] bg-black/40 p-5 scroll-mt-40">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-black text-white">{p.titulo}</h3>
                  <PlanoBadge plano={p.plano} />
                  {p.rota.startsWith("/dashboard") && (
                    <Link to={p.rota} className="ml-auto flex items-center gap-1 text-[10px] font-mono text-primary/70 hover:text-primary transition-colors">
                      abrir tela <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{p.resumo}</p>

                {/* Como usar */}
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Como usar</p>
                  <ul className="space-y-1.5">
                    {p.comoUsar.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground leading-relaxed">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Indicadores */}
                {p.indicadores.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                      Indicadores desta tela ({p.indicadores.length})
                    </p>
                    {p.indicadores.map((ind, i) => (
                      <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5">
                        <p className="flex items-center gap-1.5 text-[13px] font-bold text-white/90 mb-1">
                          <CircleDot className="h-3.5 w-3.5 text-primary shrink-0" />{ind.nome}
                        </p>
                        <p className="text-[12px] text-muted-foreground leading-relaxed mb-2">{ind.oQueE}</p>
                        <p className="text-[12px] text-white/75 leading-relaxed mb-2">
                          <span className="font-bold text-white/60 uppercase text-[9px] tracking-widest mr-1.5">Como ler</span>
                          {ind.comoLer}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {ind.sinalCompra && (
                            <p className="flex items-start gap-1.5 text-[11.5px] text-emerald-300/90 leading-relaxed rounded-md bg-emerald-500/[0.06] border border-emerald-500/15 px-2.5 py-1.5">
                              <TrendingUp className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span>{ind.sinalCompra}</span>
                            </p>
                          )}
                          {ind.sinalVenda && (
                            <p className="flex items-start gap-1.5 text-[11.5px] text-rose-300/90 leading-relaxed rounded-md bg-rose-500/[0.06] border border-rose-500/15 px-2.5 py-1.5">
                              <TrendingDown className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span>{ind.sinalVenda}</span>
                            </p>
                          )}
                        </div>
                        {ind.cuidado && (
                          <p className="flex items-start gap-1.5 text-[11.5px] text-amber-300/85 leading-relaxed mt-2">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{ind.cuidado}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Dicas */}
                {p.dicas && p.dicas.length > 0 && (
                  <div className="mt-4 rounded-lg border border-primary/15 bg-primary/[0.04] p-3.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 mb-2">Dicas rápidas</p>
                    <ul className="space-y-1.5">
                      {p.dicas.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground leading-relaxed">
                          <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}

            <p className="text-[11px] text-muted-foreground/50 italic pt-4 border-t border-white/5">
              ⚠️ Nada aqui é recomendação de investimento. As ferramentas mostram dados e estudos — a decisão e o risco são sempre seus.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
