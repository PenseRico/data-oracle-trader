import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className="relative max-w-3xl mx-auto text-center rounded-2xl glass-card p-12 md:p-16 overflow-hidden">
          {/* Ambient */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/[0.06] blur-[80px] pointer-events-none" />

          <h2
            className={`font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 text-glow ${
              isVisible ? "animate-fade-up" : "opacity-0"
            }`}
          >
            Pronto para elevar seu trading?
          </h2>
          <p
            className={`text-muted-foreground text-lg mb-8 max-w-lg mx-auto ${
              isVisible ? "animate-fade-up delay-100" : "opacity-0"
            }`}
          >
            Junte-se a milhares de traders que já utilizam dados on-chain e
            análise avançada para tomar decisões melhores.
          </p>
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center ${
              isVisible ? "animate-fade-up delay-200" : "opacity-0"
            }`}
          >
            <Button variant="hero" size="lg" className="gap-2">
              Criar conta gratuita
              <ArrowRight size={16} />
            </Button>
            <Button variant="hero-outline" size="lg">
              Falar com a equipe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
