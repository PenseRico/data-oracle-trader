import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  BarChart3,
  Bell,
  LineChart,
  MessageCircle,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: LineChart,
    title: "Análise On-Chain",
    description:
      "Dados de blockchain em tempo real: fluxo de exchanges, distribuição de holders, métricas de rede e muito mais.",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description:
      "Configure alertas personalizados de preço, volume, liquidações e padrões técnicos para nunca perder uma oportunidade.",
  },
  {
    icon: BarChart3,
    title: "Setups de Trading",
    description:
      "Crie e salve seus próprios setups com pontos de entrada, stop loss e take profit baseados em indicadores.",
  },
  {
    icon: Zap,
    title: "Sentimento de Mercado",
    description:
      "Índice de medo e ganância, análise de redes sociais e métricas de sentimento para antecipar movimentos.",
  },
  {
    icon: MessageCircle,
    title: "Comunidade Ativa",
    description:
      "Chat em tempo real com outros traders, compartilhe análises e aprenda com a comunidade.",
  },
  {
    icon: Shield,
    title: "Mapas de Liquidação",
    description:
      "Visualize zonas de liquidação, orderbook heatmaps e fluxo institucional para entender a pressão do mercado.",
  },
];

export function FeaturesSection() {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary/80 mb-6 ${
              isVisible ? "animate-fade-up" : "opacity-0"
            }`}
          >
            Recursos
          </div>
          <h2
            className={`font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 ${
              isVisible ? "animate-fade-up delay-100" : "opacity-0"
            }`}
          >
            Tudo que você precisa para operar com confiança
          </h2>
          <p
            className={`text-muted-foreground text-lg ${
              isVisible ? "animate-fade-up delay-200" : "opacity-0"
            }`}
          >
            Ferramentas profissionais reunidas em uma interface intuitiva
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`glass-card rounded-xl p-6 transition-all duration-300 group cursor-default ${
                isVisible
                  ? `animate-fade-up`
                  : "opacity-0"
              }`}
              style={{
                animationDelay: isVisible ? `${(i + 3) * 80}ms` : undefined,
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 mb-4 transition-all duration-300 group-hover:box-glow">
                <feature.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
