import { BrandName } from "@/components/BrandName";
import { Link } from "react-router-dom";
import { MANUAL } from "@/lib/manualContent";
import { Zap, ArrowRight, BookOpen, Check, CircleDot } from "lucide-react";

function PlanoBadge({ plano }: { plano: "Grátis" | "Pro" }) {
  const pro = plano === "Pro";
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest rounded px-1.5 py-0.5 border ${pro ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
      {plano}
    </span>
  );
}

export default function ManualPage() {
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
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-glow">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl tracking-tight text-white">Manual da Plataforma</h1>
            <p className="text-sm text-muted-foreground">Tudo que a Crypto Rico entrega, explicado de forma simples — tela por tela.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Índice / menu */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-4">
              {MANUAL.map((g) => (
                <div key={g.id}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1.5">{g.title}</p>
                  <ul className="space-y-0.5 border-l border-white/5">
                    {g.items.map((it) => (
                      <li key={it.id}>
                        <a href={`#${it.id}`} className="block pl-3 py-1 text-[12px] text-muted-foreground hover:text-white hover:border-l hover:border-primary -ml-px transition-colors">
                          {it.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Conteúdo */}
          <main className="space-y-10 min-w-0">
            {MANUAL.map((g) => (
              <section key={g.id} className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-[0.25em] text-primary border-b border-white/5 pb-2">{g.title}</h2>
                {g.items.map((it) => (
                  <article key={it.id} id={it.id} className="glass-card rounded-xl border border-white/[0.06] bg-black/40 p-5 scroll-mt-24">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-black text-white">{it.title}</h3>
                      <PlanoBadge plano={it.plano} />
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{it.oQueE}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Como usar</p>
                        <ul className="space-y-1.5">
                          {it.comoUsar.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground leading-relaxed">
                              <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {it.metricas.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">O que cada número mede</p>
                          <ul className="space-y-2">
                            {it.metricas.map((m, i) => (
                              <li key={i} className="text-[12px] leading-relaxed">
                                <span className="flex items-center gap-1.5 font-bold text-white/90">
                                  <CircleDot className="h-3 w-3 text-primary shrink-0" />{m.nome}
                                </span>
                                <span className="block pl-4 text-muted-foreground">{m.oQueMede}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </section>
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
