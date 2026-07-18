# Plano Mestre — Admin, Segurança e Assinatura (Crypto Rico)

## Visão em 1 parágrafo (o que vamos construir e por quê)
Vamos fazer três coisas, nesta ordem: (1) fechar as brechas de segurança urgentes do app enquanto ele ainda está em testes — principalmente as duas chaves de API vazadas; (2) construir um painel admin num projeto Vercel separado (`cryptorico-admin`), onde o PenseRico controla usuários, chat e avisos, protegido por 4 camadas (porteiro da Vercel → login → código do celular → chave mestra só no servidor); (3) ligar a assinatura anual via Stripe (cartão renova sozinho; Pix vale 365 dias) e, só então, virar a chave do "tudo liberado" para "free + PRO pago". A regra que resume tudo: segredo nunca no navegador nem no git; toda porta com duas fechaduras; tudo que o admin faz deixa rastro.

## Fase 0 — Agora, durante os testes (segurança urgente)
Fazer HOJE, nesta ordem:
- [ ] **Rotacionar a chave Resend** [PenseRico]: resend.com → apagar a antiga (foi colada num chat) → criar nova → colar no Supabase (Auth → SMTP) → testar um e-mail de reset.
- [ ] **Rotacionar a chave OpenRouter** [PenseRico]: openrouter.ai → revogar a antiga (está em commits do git; chave exposta é chave morta) → nova com **limite de gasto** → atualizar env var na Vercel → redeploy.
- [ ] **Conferir que nenhum segredo está no bundle** [Claude]: grep por chaves e `VITE_` suspeitos (tudo com `VITE_` vai parar no navegador de qualquer visitante).

Esta semana:
- [ ] **Proteção de senha vazada + mínimo 8 caracteres** [PenseRico]: Supabase → Auth → ativar "Leaked password protection".
- [ ] **Captcha Turnstile no login/cadastro** [PenseRico cria a chave no Cloudflare e ativa no Supabase; Claude põe o widget e ajusta a CSP]: sem isso, um bot cria mil contas e drena a IA.
- [ ] **Rate limits de Auth** [PenseRico]: Supabase → Auth → Rate Limits (login/cadastro 10–20/h por IP; e-mails de reset 3–4/h).
- [ ] **Revisão de RLS** (o cadeado de cada tabela do banco) [Claude escreve SQL; PenseRico roda no SQL Editor]: messages/profiles/alerts/setups só o dono edita; tabela `admins` sem NENHUMA policy pública. Testar com conta comum tentando mexer em dados de outro.
- [ ] **Limites no bucket chat-images** [PenseRico + Claude]: máx. 2 MB, só imagens (png/jpeg/webp/gif), cada um grava só na própria pasta.
- [ ] **Teto no /api/ai-proxy** [Claude]: tamanho máximo de prompt, limite diário por usuário, modelo fixo no servidor — é a torneira de dinheiro.
- [ ] **CSP valendo de verdade** [Claude]: rodar 3–7 dias em Report-Only, corrigir o que quebrar, então ativar (impede script injetado de roubar sessão).

## Fase 1 — Painel Admin (projeto separado na Vercel)
1. **Pré-requisitos** [PenseRico]: confirmar tabela `admins` + `is_admin()` aplicadas; habilitar MFA no Supabase; criar repo privado `PenseRico/cryptorico-admin` (novo, sem herdar o histórico com chave vazada) e importar na Vercel.
2. **Setup** [Claude + PenseRico]: mesmo stack do app (Vite + React + funções `/api`); domínio `admin.cryptorico.app` (DNS: PenseRico); `noindex` + robots; CSP valendo desde o dia 1; **Vercel Deployment Protection** ativada (porteiro antes do site carregar).
3. **Login em 3 portões** [Claude código; PenseRico escaneia o QR]: (0) porteiro Vercel → (1) login Supabase só do e-mail `pensericodigital@gmail.com`, cadastro desabilitado → (2) **MFA obrigatório** (código do app autenticador; guarde os códigos de recuperação em papel). O front E as funções `/api` exigem o MFA feito (`aal2`) — senão seria só cosmético. Sessão curta, logout por inatividade.
4. **Regra de ouro**: a `service_role key` (chave mestra que ignora todo o RLS) vive SÓ nas env vars das funções `/api` do projeto admin — nunca no navegador. Toda ação passa por `/api/*` que valida token + admin + MFA antes de agir.
5. **Telas do MVP** [Claude], em ordem: dashboard de métricas (cadastros, ativos, msgs/dia) → gestão de usuários (buscar, banir, deletar com limpeza LGPD, reset de senha, virar PRO manual) → moderação do chat (feed, apagar mensagem, silenciar) → avisos/anúncios (banner no app público).
6. **Migrar o plano para o banco** [Claude, mexe no app principal]: `src/lib/plan.ts` sai do localStorage e passa a ler `profiles.plan` — pré-requisito do "virar PRO manual" e da Fase 2.
7. **Auditoria e alarmes** [Claude]: tabela `admin_audit_log` que só aceita inserção (log que pode ser apagado não é log); alerta por e-mail se surgir um segundo admin na tabela; aviso de login de IP/aparelho novo.
8. Ativar **2FA nas contas** Google, Vercel, GitHub, Supabase, Resend e OpenRouter [PenseRico, 5 min cada].

**MVP funcional: ~6–7 sessões.**

## Fase 2 — Assinatura anual (Stripe)
Regra de ouro: o site NUNCA fala com o Stripe direto nem decide preço — tudo passa pelas funções `/api`, e o cartão nunca toca nosso código (página de pagamento é do próprio Stripe).
1. **Fundação** [PenseRico com Claude ditando os cliques]: criar conta Stripe, ativar Pix, criar produto "Crypto Rico PRO" + preço anual em modo teste; ativar Customer Portal, Smart Retries e recibos automáticos. [Claude]: tabelas `subscriptions` + `stripe_events` no Supabase, com RLS (usuário só lê a própria; só o webhook escreve).
2. **Checkout** [Claude]: `api/stripe/create-checkout.ts` (mesmo padrão de login do ai-proxy; preço fixado no servidor) + botão "Assinar PRO"; testar com cartão 4242.
3. **Webhook** [Claude]: `api/stripe/webhook.ts` — verifica assinatura, à prova de eventos duplicados, trata os 5 eventos-chave (pagou, renovou, atualizou, cancelou, falhou — falha não corta na hora: o Stripe tenta de novo por dias).
4. **A virada do gating** [Claude + PenseRico]: `getPlan()` passa a ler `subscriptions` (cache de ~5 min); default vira **"free"** — qualquer erro ou ausência = free (hoje qualquer um edita o localStorage e vira PRO de graça). **Antes de virar**: cortesia (`status='comp'`, 60–90 dias) para os testers ativos — PenseRico passa a lista de e-mails; cupom `FUNDADOR50` quando a cortesia for acabando. Link "Gerenciar assinatura" → portal do Stripe (cancelar, trocar cartão — zero tela nossa).
5. **Pagamento BR**: cartão = renova sozinho todo ano; **Pix = pagamento único que libera 365 dias** (Pix não renova sozinho no Stripe) + e-mail ~15 dias antes de vencer. Boleto desligado.
6. **Go-live** [ambos]: produto/preço/webhook no modo live, trocar 3 env vars, 1 compra real de teste, smoke test completo. Antes de cobrar: **Supabase Pro com PITR** (backup que volta o banco a qualquer minuto) + testar uma restauração; botões "Exportar dados" e "Excluir usuário" no admin (LGPD); conferir CSP liberando `checkout.stripe.com`.
7. **Nota fiscal**: Stripe não emite NF brasileira — no 1º mês de vendas, contratar eNotas/NFE.io/Notazz com orientação de contador. Não bloqueia o lançamento.

**Estimativa: ~5 sessões (7–10h).**

## Fase 3 — Depois (aulas em vídeo, extras)
- **Academy**: começar com **YouTube não listado** (R$ 0, zero código de vídeo) + tabela `lessons` com CRUD no admin e página no app (~1 sessão). Quando virar diferencial pago de verdade, migrar para Mux (~US$ 0,007/min) — só troca o player. Pular Supabase Storage para vídeo.
- **Suporte**: sem sistema de tickets por ora — e-mail `contato@cryptorico.app` + campo de anotações por usuário no admin.
- **Extras de segurança**: gitleaks (robô que barra commit com chave — já vazou 2x), Sentry grátis para erros, moderação extra do chat (1 msg/2s, filtro de links em conta nova, botão reportar), consumo de IA por usuário no painel.
- **Plano mensal** R$ 29/mês (só cartão) em ~3 meses, como porta de entrada que faz o anual parecer barato.

## Decisões que só o PenseRico pode tomar
1. **Preço de lançamento** — **Recomendo: R$ 129/ano "preço de fundador"** (com âncora "de R$ 297") — converte melhor e fideliza; quem entra cedo renova nesse valor.
2. **Endereço do painel admin** — **Recomendo: `admin.cryptorico.app` com Vercel Deployment Protection** — domínio "escondido" é falsa segurança (certificados são públicos e bots varrem).
3. **Cortesia dos testers** — quantos dias e quais e-mails. **Recomendo: 90 dias + cupom FUNDADOR50 no fim.**
4. **Vídeos da academy** — **Recomendo: YouTube não listado agora; Mux só quando o conteúdo estiver validado.**
5. **Supabase Pro antes de cobrar** — **Recomendo: sim, pelo PITR** (dinheiro entrando exige backup de verdade).
6. **Data da virada free/PRO** — só depois do Stripe testado e da cortesia dos testers aplicada. **Recomendo: junto do go-live do Stripe, nunca antes.**

## Tabela-resumo

| Item | Quem faz | Fase | Esforço (sessões) |
|---|---|---|---|
| Rotacionar Resend + OpenRouter (+limite de gasto) | PenseRico (painéis) | 0 | 0,5 |
| Grep de segredos no bundle | Claude | 0 | 0,5 |
| Leaked password + Turnstile + rate limits Auth | PenseRico + Claude | 0 | 1 |
| Revisão RLS + limites do storage + teto no ai-proxy | Claude (SQL/código) + PenseRico (rodar) | 0 | 1–2 |
| CSP valendo de verdade | Claude | 0 | 0,5 |
| Repo admin + Vercel + domínio + porteiro | PenseRico (cliques) + Claude (config) | 1 | 1 |
| Login + MFA + guard nas funções | Claude (código) + PenseRico (QR) | 1 | 1–2 |
| Usuários + métricas (telas e endpoints) | Claude | 1 | 2 |
| Moderação chat + avisos | Claude | 1 | 1–2 |
| Migrar plan.ts para o banco | Claude | 1 | 1 |
| Auditoria + alarmes + 2FA nas contas | Claude + PenseRico | 1 | 0,5 |
| Conta Stripe + produto + tabelas | PenseRico + Claude | 2 | 1 |
| Checkout + webhook | Claude | 2 | 2 |
| Virada do gating + cortesia testers + portal | Claude + PenseRico (lista) | 2 | 1 |
| Go-live + LGPD (export/delete) + Supabase Pro/PITR | Claude + PenseRico | 2 | 1 |
| Academy YouTube (lessons + CRUD + página) | Claude | 3 | 1 |
| Nota fiscal (eNotas/NFE.io + contador) | PenseRico | 3 | — |
