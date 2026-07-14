import { Link } from "react-router-dom";
import { Zap, ArrowLeft, ShieldCheck } from "lucide-react";

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

function LegalBase({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[10px] font-black uppercase tracking-widest rounded px-1.5 py-0.5 border bg-primary/10 border-primary/30 text-primary align-middle">
      {children}
    </span>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07080d] text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-glow">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-black text-lg tracking-tighter text-primary">Matrix</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-bold uppercase tracking-widest text-white/80">Privacidade</span>
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
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl tracking-tight text-white">Política de Privacidade</h1>
            <p className="text-sm text-muted-foreground">
              Como a Matrix trata seus dados pessoais, em conformidade com a LGPD (Lei nº 13.709/2018).
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/60 italic mb-8">Última atualização: julho de 2026</p>

        <div className="space-y-6">
          <Section title="1. Quem somos e nosso papel">
            <p>
              A <strong className="text-white/90">Matrix</strong> é uma plataforma de análise do mercado de
              criptomoedas: oferecemos gráficos, indicadores on-chain, RSI, sinais de estudo, leitura de carteira por
              inteligência artificial e um chat de comunidade. <strong className="text-white/90">Não somos uma
              corretora (exchange), não custodiamos seus fundos e não prestamos recomendação ou consultoria de
              investimentos.</strong>
            </p>
            <p>
              Para os fins da Lei Geral de Proteção de Dados (LGPD), a Matrix atua como{" "}
              <strong className="text-white/90">Controladora</strong> dos dados pessoais tratados nesta plataforma,
              decidindo sobre as finalidades e os meios do tratamento. O contato do encarregado (DPO) e do controlador
              está na seção final desta política.
            </p>
          </Section>

          <Section title="2. Dados que coletamos e base legal">
            <p>Coletamos apenas o necessário para operar a plataforma. Cada categoria abaixo indica sua base legal na LGPD (art. 7º).</p>

            <div className="space-y-4 pt-1">
              <div>
                <p className="font-bold text-white/90 mb-1">a) Dados de conta</p>
                <p>
                  E-mail, senha (armazenada de forma cifrada/hash pelo nosso provedor de autenticação, o Supabase),
                  além de nome de usuário e foto de perfil (avatar) opcionais. <LegalBase>Execução de contrato</LegalBase>{" "}
                  — necessários para criar e manter sua conta.
                </p>
              </div>
              <div>
                <p className="font-bold text-white/90 mb-1">b) Dados de uso e preferências</p>
                <p>
                  Alertas pessoais e "setups" que você salva, além de preferências de plano armazenadas no seu
                  navegador. <LegalBase>Execução de contrato</LegalBase> e <LegalBase>Legítimo interesse</LegalBase> —
                  para entregar as funcionalidades e melhorar a experiência.
                </p>
              </div>
              <div>
                <p className="font-bold text-white/90 mb-1">c) Dados da comunidade</p>
                <p>
                  Mensagens que você publica no chat da comunidade e imagens que você opcionalmente envia.{" "}
                  <LegalBase>Consentimento</LegalBase> — o envio é voluntário; lembre-se de que mensagens em espaços
                  compartilhados ficam visíveis a outros usuários.
                </p>
              </div>
              <div>
                <p className="font-bold text-white/90 mb-1">d) Dados enviados à IA (leitura de carteira)</p>
                <p>
                  Quando você usa a leitura de carteira por IA, os ativos que você <strong className="text-white/90">informa
                  manualmente</strong> são enviados a um provedor de inferência para gerar uma análise educacional de
                  leitura (read-only). <LegalBase>Consentimento</LegalBase> — o recurso só é acionado por sua
                  iniciativa. Não coletamos chaves de corretora, saldos reais nem acesso a fundos.
                </p>
              </div>
            </div>
          </Section>

          <Section title="3. Finalidade do tratamento">
            <p>Tratamos seus dados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
              <li>Autenticar seu acesso e manter sua conta e sessão.</li>
              <li>Disponibilizar as ferramentas de análise, alertas, setups e a leitura de carteira por IA.</li>
              <li>Permitir sua participação no chat da comunidade.</li>
              <li>Garantir a segurança, prevenir abusos e cumprir obrigações legais.</li>
              <li>Aprimorar as funcionalidades da plataforma.</li>
            </ul>
            <p>Não vendemos seus dados pessoais e não os utilizamos para publicidade direcionada de terceiros.</p>
          </Section>

          <Section title="4. Compartilhamento e subprocessadores">
            <p>
              Para operar, a Matrix se apoia em prestadores de serviço (operadores/subprocessadores) que tratam dados
              em nosso nome, sob obrigações contratuais de segurança e confidencialidade:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
              <li><strong className="text-white/90">Supabase</strong> — autenticação, banco de dados e armazenamento de arquivos (avatares e imagens do chat).</li>
              <li><strong className="text-white/90">Vercel</strong> — hospedagem da aplicação e funções de servidor.</li>
              <li><strong className="text-white/90">OpenRouter</strong> — inferência de IA para a leitura de carteira (recebe apenas os dados que você envia ao recurso).</li>
              <li><strong className="text-white/90">APIs de dados de mercado</strong> — CoinGecko, TradingView (embeds de gráficos), CNN Fear &amp; Greed e feeds de notícias (RSS), usados para exibir informações públicas de mercado.</li>
            </ul>
            <p>
              Não utilizamos ferramentas de analytics ou rastreamento além dos serviços listados acima. Também podemos
              compartilhar dados quando exigido por lei, ordem judicial ou autoridade competente.
            </p>
          </Section>

          <Section title="5. Cookies e armazenamento local">
            <p>Utilizamos apenas mecanismos essenciais, sem cookies de publicidade ou rastreamento:</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
              <li><strong className="text-white/90">Token de sessão (Supabase)</strong> — essencial/autenticação: mantém você logado.</li>
              <li><strong className="text-white/90">oracle:plan</strong> — essencial/preferência: guarda seu plano localmente para ajustar a interface.</li>
            </ul>
            <p>Esses itens são necessários para o funcionamento básico da plataforma e ficam no seu próprio navegador.</p>
          </Section>

          <Section title="6. Segurança">
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
              <li>Criptografia em trânsito (HTTPS/TLS) em toda a comunicação.</li>
              <li>Senhas armazenadas de forma cifrada (hash) pelo provedor de autenticação Supabase — nunca temos acesso à sua senha em texto puro.</li>
              <li>Controle de acesso a nível de linha (RLS — Row Level Security) no banco de dados, de modo que cada usuário só acessa os próprios registros (perfil, mensagens, alertas e setups).</li>
            </ul>
            <p>
              Nenhum sistema é 100% infalível. Caso identifique qualquer vulnerabilidade ou uso indevido, entre em
              contato pelos canais desta política.
            </p>
          </Section>

          <Section title="7. Retenção e exclusão">
            <p>
              Mantemos seus dados pessoais enquanto sua conta estiver ativa e pelo período necessário às finalidades
              descritas ou ao cumprimento de obrigações legais. Ao solicitar a exclusão da conta, removemos ou
              anonimizamos os dados associados, ressalvadas as informações que a lei nos obrigue a reter. Mensagens já
              publicadas no chat da comunidade podem permanecer visíveis de forma desvinculada, quando aplicável.
            </p>
          </Section>

          <Section title="8. Seus direitos como titular (LGPD, art. 18)">
            <p>A qualquer momento, você pode exercer os seguintes direitos sobre seus dados pessoais:</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
              <li><strong className="text-white/90">Confirmação</strong> da existência de tratamento.</li>
              <li><strong className="text-white/90">Acesso</strong> aos dados que mantemos.</li>
              <li><strong className="text-white/90">Correção</strong> de dados incompletos, inexatos ou desatualizados.</li>
              <li><strong className="text-white/90">Anonimização, bloqueio ou eliminação</strong> de dados desnecessários ou tratados em desconformidade com a lei.</li>
              <li><strong className="text-white/90">Portabilidade</strong> dos dados a outro fornecedor, mediante requisição.</li>
              <li><strong className="text-white/90">Eliminação</strong> dos dados tratados com base no consentimento.</li>
              <li><strong className="text-white/90">Informação</strong> sobre entidades com as quais compartilhamos dados.</li>
              <li><strong className="text-white/90">Revogação do consentimento</strong> e informação sobre as consequências da negativa.</li>
            </ul>
            <p>
              Para exercer qualquer um desses direitos, escreva para{" "}
              <a href="mailto:privacidade@matrix.app" className="text-primary hover:underline font-bold">privacidade@matrix.app</a>.
              Responderemos dentro dos prazos previstos na legislação.
            </p>
          </Section>

          <Section title="9. Transferência internacional de dados">
            <p>
              Alguns de nossos provedores (como Supabase, Vercel e OpenRouter) processam e armazenam dados em servidores
              localizados fora do Brasil, inclusive nos Estados Unidos. Nesses casos, buscamos garantir que a
              transferência ocorra com salvaguardas adequadas e em conformidade com a LGPD (arts. 33 a 36).
            </p>
          </Section>

          <Section title="10. Dados de menores">
            <p>
              A Matrix não é destinada a menores de 18 anos e não coletamos intencionalmente dados de crianças ou
              adolescentes. Caso identifiquemos o cadastro de um menor, tomaremos medidas para encerrar a conta e
              eliminar os dados associados.
            </p>
          </Section>

          <Section title="11. Alterações desta política">
            <p>
              Podemos atualizar esta Política de Privacidade a qualquer momento para refletir mudanças legais ou de
              funcionalidade. A data de "última atualização" no topo indica a versão vigente. Recomendamos a revisão
              periódica deste documento.
            </p>
          </Section>

          <Section title="12. Contato do encarregado (DPO) e do controlador">
            <p>
              Para dúvidas sobre esta política, sobre o tratamento dos seus dados ou para exercer seus direitos, fale
              com nosso encarregado de proteção de dados (DPO) e controlador pelo e-mail{" "}
              <a href="mailto:privacidade@matrix.app" className="text-primary hover:underline font-bold">privacidade@matrix.app</a>.
            </p>
          </Section>

          <p className="text-[11px] text-muted-foreground/50 italic pt-2 border-t border-white/5">
            Este documento tem caráter informativo e não constitui recomendação de investimento. As ferramentas da
            Matrix mostram dados e estudos — a decisão e o risco são sempre seus.
          </p>
        </div>
      </div>
    </div>
  );
}
