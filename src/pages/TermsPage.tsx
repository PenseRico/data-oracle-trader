import { BrandName } from "@/components/BrandName";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft, ScrollText, AlertTriangle } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-xl border border-white/[0.06] bg-black/40 p-5 md:p-6 scroll-mt-24">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary border-b border-white/5 pb-2 mb-4">
        {title}
      </h2>
      <div className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
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
          <span className="text-sm font-bold uppercase tracking-widest text-white/80">Termos de Uso</span>
          <Link
            to="/"
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-3 py-1.5 hover:bg-primary/25 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao início
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-glow">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl tracking-tight text-white">Termos de Uso</h1>
            <p className="text-sm text-muted-foreground">
              As regras para uso da plataforma Crypto Rico. Ao acessar, você concorda com estes termos.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/60 italic mb-8">Última atualização: julho de 2026</p>

        {/* Aviso de risco em destaque */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-5 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[13px] leading-relaxed text-amber-100/90">
            <p className="font-black text-amber-300 uppercase tracking-widest text-[11px] mb-1">Aviso de risco</p>
            <p>
              A Crypto Rico é uma ferramenta de <strong>análise e educação</strong>. Nada aqui constitui recomendação,
              consultoria ou oferta de investimento. O mercado de criptomoedas é extremamente volátil e você pode
              perder todo o capital investido. <strong>As decisões e os riscos são exclusivamente seus.</strong>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Section title="1. Aceitação dos termos">
            <p>
              Ao criar uma conta ou utilizar a plataforma Crypto Rico, você declara ter lido, compreendido e concordado com
              estes Termos de Uso e com a nossa{" "}
              <Link to="/privacidade" className="text-primary hover:underline font-bold">Política de Privacidade</Link>.
              Caso não concorde, não utilize a plataforma. Para usar a Crypto Rico, você deve ter capacidade civil plena e
              pelo menos 18 anos de idade.
            </p>
          </Section>

          <Section title="2. Descrição do serviço">
            <p>
              A Crypto Rico é uma plataforma de <strong className="text-white/90">análise do mercado de criptomoedas com
              finalidade educacional e informativa</strong>: gráficos, indicadores on-chain, RSI, sinais de estudo,
              leitura de carteira por inteligência artificial (read-only) e um chat de comunidade.
            </p>
            <p>
              <strong className="text-white/90">A Crypto Rico NÃO é uma recomendação de investimento.</strong> Os conteúdos,
              indicadores, sinais e análises — inclusive os gerados por IA — têm caráter meramente informativo e
              educacional, não representam aconselhamento financeiro, jurídico ou tributário, e não devem ser
              interpretados como sugestão de compra ou venda de qualquer ativo. Rentabilidade passada não garante
              resultados futuros. Consulte um profissional habilitado antes de tomar qualquer decisão de investimento.
            </p>
          </Section>

          <Section title="3. Conta e responsabilidade do usuário">
            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
              <li>Você é responsável por manter a confidencialidade das suas credenciais de acesso.</li>
              <li>Você é responsável por toda atividade realizada na sua conta.</li>
              <li>Você deve fornecer informações verdadeiras e mantê-las atualizadas.</li>
              <li>Notifique-nos imediatamente sobre qualquer uso não autorizado da sua conta.</li>
            </ul>
          </Section>

          <Section title="4. Conduta na comunidade">
            <p>Ao participar do chat da comunidade, você concorda em NÃO:</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
              <li>Publicar conteúdo ilegal, ofensivo, difamatório, discriminatório ou que incite ódio ou violência.</li>
              <li>Praticar spam, propaganda não autorizada, esquemas de "pump and dump" ou manipulação de mercado.</li>
              <li>Assediar, ameaçar ou expor dados pessoais de terceiros.</li>
              <li>Divulgar golpes, links maliciosos, malware ou conteúdo fraudulento.</li>
              <li>Passar-se por outra pessoa ou pela própria Crypto Rico.</li>
              <li>Enviar imagens ou textos que violem direitos de terceiros.</li>
            </ul>
            <p>
              Podemos moderar, remover conteúdo e suspender contas que violem estas regras, a nosso critério e sem aviso
              prévio.
            </p>
          </Section>

          <Section title="5. Propriedade intelectual">
            <p>
              A marca "Crypto Rico", o layout, os textos, o código, as interfaces e demais elementos da plataforma são
              protegidos por direitos de propriedade intelectual e pertencem à Crypto Rico ou a seus licenciadores. É vedada
              a reprodução, distribuição ou uso comercial sem autorização prévia. O conteúdo que você publica na
              comunidade continua sendo seu, mas você concede à Crypto Rico uma licença para exibi-lo dentro da plataforma.
              Dados de mercado exibidos podem pertencer a seus respectivos provedores (CoinGecko, TradingView e outros).
            </p>
          </Section>

          <Section title="6. Isenção de garantias e limitação de responsabilidade">
            <p>
              A plataforma é fornecida <strong className="text-white/90">"no estado em que se encontra"</strong>, sem
              garantias de qualquer tipo. Não garantimos que os dados, indicadores ou análises estejam livres de erros,
              atrasos, interrupções ou imprecisões — inclusive porque dependemos de fontes e provedores externos.
            </p>
            <p>
              <strong className="text-white/90">Você é o único responsável pelas suas decisões de investimento.</strong>{" "}
              Na máxima extensão permitida pela lei, a Crypto Rico não se responsabiliza por perdas, danos diretos ou
              indiretos, lucros cessantes ou prejuízos decorrentes do uso — ou da impossibilidade de uso — da
              plataforma, ou de decisões tomadas com base em qualquer conteúdo aqui apresentado.
            </p>
          </Section>

          <Section title="7. Ausência de custódia e de execução de ordens">
            <p>
              A Crypto Rico <strong className="text-white/90">não é uma corretora (exchange), não custodia fundos, não
              executa ordens de compra ou venda e não tem acesso ao seu patrimônio.</strong> Nenhuma operação
              financeira é realizada por meio da plataforma. A leitura de carteira por IA utiliza apenas os dados que
              você informa manualmente e serve exclusivamente para fins de estudo.
            </p>
          </Section>

          <Section title="8. Suspensão e rescisão">
            <p>
              Você pode encerrar sua conta a qualquer momento. Podemos suspender ou encerrar o seu acesso, com ou sem
              aviso, em caso de violação destes termos, uso indevido, exigência legal ou descontinuação do serviço. As
              cláusulas que, por sua natureza, devam subsistir (como isenções e limitações de responsabilidade)
              permanecem em vigor após o encerramento.
            </p>
          </Section>

          <Section title="9. Lei aplicável e foro">
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de
              domicílio do usuário para dirimir eventuais controvérsias, salvo disposição legal em contrário.
            </p>
          </Section>

          <Section title="10. Contato">
            <p>
              Dúvidas sobre estes Termos de Uso podem ser encaminhadas para{" "}
              <a href="mailto:privacidade@cryptorico.app" className="text-primary hover:underline font-bold">privacidade@cryptorico.app</a>.
            </p>
          </Section>

          <p className="text-[11px] text-muted-foreground/50 italic pt-2 border-t border-white/5">
            ⚠️ Nada aqui é recomendação de investimento. As ferramentas mostram dados e estudos — a decisão e o risco
            são sempre seus.
          </p>
        </div>
      </div>
    </div>
  );
}
