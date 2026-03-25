import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, BarChart3, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

      {/* Pulsing rings */}
      <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full border border-primary/10 animate-ping opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-24 h-24 rounded-full border border-primary/5 animate-pulse opacity-30 pointer-events-none" />

      <div ref={ref} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary/80 mb-8 ${
              isVisible ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Análise de mercado em tempo real
          </div>

          {/* Headline */}
          <h1
            className={`font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-glow mb-6 ${
              isVisible ? "animate-fade-up delay-100" : "opacity-0"
            }`}
          >
            Domine o mercado cripto com{" "}
            <span className="text-primary">inteligência</span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed ${
              isVisible ? "animate-fade-up delay-200" : "opacity-0"
            }`}
            style={{ textWrap: "pretty" }}
          >
            Indicadores on-chain, alertas de compra e venda, setups
            personalizados e comunidade ativa — tudo em uma plataforma.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 ${
              isVisible ? "animate-fade-up delay-300" : "opacity-0"
            }`}
          >
            <Button variant="hero" size="lg" className="gap-2 px-8" <Button variant="hero" size="lg" className="gap-2 px-8" onClick={() => navigate("/auth")}>
              Acessar plataforma
              <ArrowRight size={16} />
            </Button>
            <Button variant="hero-outline" size="lg">
              Ver demonstração
            </Button>
          </div>

          {/* Stats */}
          <div
            className={`grid grid-cols-3 gap-6 max-w-lg mx-auto ${
              isVisible ? "animate-fade-up delay-400" : "opacity-0"
            }`}
          >
            {[
              { value: "24/7", label: "Monitoramento" },
              { value: "150+", label: "Indicadores" },
              { value: "8.2k", label: "Traders ativos" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview card */}
        <div
          className={`mt-16 max-w-4xl mx-auto ${
            isVisible ? "animate-fade-up delay-500" : "opacity-0"
          }`}
        >
          <div className="glass-card rounded-xl p-1 animate-pulse-glow">
            <div className="rounded-lg bg-card p-6">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-destructive/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  dashboard.cryptoedge.io
                </div>
              </div>
              {/* Mock chart area */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-48 rounded-lg bg-secondary/50 border border-border/30 flex items-center justify-center">
                  <BarChart3 size={48} className="text-primary/30" />
                </div>
                <div className="space-y-3">
                  <div className="h-[60px] rounded-lg bg-secondary/50 border border-border/30 flex items-center justify-center">
                    <TrendingUp size={20} className="text-green-400/50" />
                  </div>
                  <div className="h-[60px] rounded-lg bg-secondary/50 border border-border/30 p-3">
                    <div className="h-2 w-16 rounded bg-primary/20 mb-2" />
                    <div className="h-2 w-12 rounded bg-muted-foreground/10" />
                  </div>
                  <div className="h-[60px] rounded-lg bg-secondary/50 border border-border/30 p-3">
                    <div className="h-2 w-14 rounded bg-primary/20 mb-2" />
                    <div className="h-2 w-10 rounded bg-muted-foreground/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
