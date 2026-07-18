# Apêndice A — Arquitetura do Painel Admin

# Painel Admin Crypto Rico — Projeto Separado na Vercel

## 1) Setup

### Repo e stack
- **Repo:** `PenseRico/cryptorico-admin` (privado). Nada de fork do app público — repo limpo, sem histórico (lembrando que o repo atual tem chave OpenRouter em commits antigos; não herdar esse histórico).
- **Stack:** o MESMO do app principal — **Vite + React + funções `/api` na Vercel + Supabase client**. Justificativa:
  - Você (Claude) já tem os padrões prontos nesse repo: `api/ai-proxy.ts` já faz "valida JWT Supabase → age com chave secreta" — é exatamente o esqueleto de todo endpoint admin.
  - Zero curva de aprendizado para o PenseRico: mesmo painel Vercel, mesmo fluxo de deploy (push → deploy), mesmas env vars.
  - Alternativas descartadas: **Next.js** (ganho marginal aqui, mais conceitos novos), **Retool/Supabase Studio direto** (Studio dá acesso total ao banco sem trilha de auditoria e sem UI de moderação; Retool é pago e vira mais um lugar com credenciais). Um admin interno de usuário único não precisa de SSR.

### Domínio: subdomínio vs domínio obscuro
**Recomendação: `admin.cryptorico.app`** com as proteções abaixo — não domínio obscuro.

| | `admin.cryptorico.app` | Domínio obscuro (ex: `painel-xyz123.vercel.app`) |
|---|---|---|
| Segurança real | Igual — segurança vem da auth, não do nome | "Security by obscurity": vaza no certificado TLS (CT logs são públicos!), em histórico de browser, em referer |
| Cookies/CORS | Domínio raiz compartilhado facilita config Supabase | Mais um domínio para gerenciar |
| Praticidade dono | Fácil de lembrar | Fácil de perder |

Domínio obscuro é falsa segurança: **qualquer certificado emitido aparece em Certificate Transparency logs** em minutos — bots varrem isso. O que protege de verdade:
1. **Vercel Deployment Protection** (senha ou Vercel Auth na frente de tudo — camada 0, antes mesmo do app carregar). Está no plano Pro da Vercel; se não quiser pagar, um **Basic Auth simples via middleware/env var** já corta 100% dos scanners.
2. `X-Robots-Tag: noindex` + `robots.txt` disallow all.
3. Auth forte (item 2 abaixo).
4. CSP estrita (não Report-Only como no app público — aqui pode ser `enforce` desde o dia 1, superfície é pequena).

## 2) Autenticação do admin

### Mesmo projeto Supabase (`ndffflhndftyifcmwcbe`)
Sim, mesmo banco — os dados que o admin gerencia (users, messages, subs) estão lá. Criar segundo projeto = sincronizar dados, dobro de custo, zero ganho.

### Fluxo de login (3 portões em série)
1. **Portão 0 (Vercel):** Deployment Protection / Basic Auth — bloqueia scanners antes do app existir.
2. **Portão 1 (Supabase Auth):** login e-mail/senha (`pensericodigital@gmail.com`). Desabilitar signup público no client do admin (o app admin nunca chama `signUp`; e o endpoint `/api/*` rejeita qualquer e-mail que não passe em `is_admin()`).
3. **Portão 2 (MFA TOTP obrigatório):** Supabase Auth MFA nativo. No primeiro login o PenseRico escaneia QR code com Google Authenticator/Authy. O front do admin exige `aal2`:
   - Após login, checar `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`; se `currentLevel !== 'aal2'`, forçar tela de código TOTP antes de renderizar qualquer coisa.
   - **Crucial:** os endpoints `/api` também validam `aal === 'aal2'` no JWT — senão o MFA seria só cosmético (alguém com a senha chamaria a API direto).
4. Sessão curta: `JWT expiry` padrão, sem "lembrar por 30 dias".

### service_role: por que NUNCA no browser
A `service_role` key **ignora todo RLS** — quem a tem lê/apaga qualquer tabela, banco inteiro. Tudo que vai ao browser é público por definição (bundle JS, DevTools, extensões). Uma `service_role` no bundle = banco inteiro vazado = incidente LGPD completo (dados pessoais de todos os usuários).

**Onde ela vive:** env var `SUPABASE_SERVICE_ROLE_KEY` **só no projeto Vercel do admin** (Settings → Environment Variables, escopo Production, sem prefixo `VITE_` — nunca entra no bundle). O browser do admin usa apenas a `anon` key para login; toda ação privilegiada passa por `/api/*`.

```
Browser admin (anon key + JWT do PenseRico)
      │  fetch /api/users  +  Authorization: Bearer <JWT>
      ▼
/api/* (Vercel serverless, projeto admin)
      │  1. valida JWT  2. checa is_admin()  3. checa aal2
      ▼
Supabase com service_role (só aqui)
```

Detalhe da `is_admin()` existente: ela checa `auth.jwt()->>'email'` — funciona para RLS, mas nas funções `/api` valide pelo **e-mail extraído do JWT verificado via `supabase.auth.getUser(token)`** consultando a tabela `admins` com service_role (não confie em claims parseados manualmente do token).

## 3) Funcionalidades por prioridade

### MVP (fazer agora)
1. **Dashboard de métricas** — cards: cadastros totais, novos 7d/30d, usuários ativos (última mensagem/login), MRR placeholder (liga no Stripe depois). Fonte: queries agregadas em `auth.users` + `profiles` + `messages`.
2. **Gestão de usuários** — tabela com busca por e-mail/username: ver perfil, **banir** (`ban_duration` via Admin API do Supabase), **deletar** (GDPR/LGPD: apaga auth + profiles + messages + storage), **reset de senha** (dispara e-mail via Resend), **virar PRO manual** (grava `profiles.plan = 'pro'` — pré-requisito: migrar `src/lib/plan.ts` do localStorage para ler `profiles.plan`; isso é tarefa no app principal, já planejada como "Sprint E" no comentário do próprio arquivo).
3. **Moderação do chat** — feed das últimas mensagens (realtime), apagar qualquer mensagem, silenciar usuário (coluna `profiles.muted_until`; o RLS de INSERT em `messages` checa isso).
4. **Avisos/anúncios** — tabela `announcements(id, title, body, active, created_at)`; app público lê e mostra banner. Simples e resolve "comunicar manutenção/novidade".

### Fase 2 (depois dos testes / junto do Stripe)
5. **Assinaturas** — status por usuário (via Stripe API: `customer`, `subscription.status`, próxima cobrança); **reembolso = link direto pro dashboard do Stripe** (não reimplementar — o dashboard do Stripe já é o painel financeiro perfeito, com o Stripe cuidando de compliance). O admin só mostra e linka: `https://dashboard.stripe.com/customers/{id}`.
6. **Suporte** — começar SEM feature: e-mail `contato@cryptorico.app` + campo de anotações por usuário (`admin_notes`). Ticket system é overkill agora.

### Fase 3 — Aulas em vídeo (Academy)
| Opção | Custo | Esforço | Contra |
|---|---|---|---|
| **YouTube não listado** | R$ 0 | ~zero (colar link no admin, embed no app) | Link vaza fácil (qualquer assinante compartilha); branding YouTube |
| Supabase Storage + `<video>` | Barato até certo ponto | Médio | Sem streaming adaptativo; banda fica cara com volume; player ruim em 3G |
| Mux | ~US$ 0.007/min entregue | Médio | Custo em dólar recorrente |

**Recomendação: começar com YouTube não listado.** É grátis, zero código de vídeo, e na fase inicial o risco de vazamento de link é aceitável (o conteúdo ainda está sendo validado). Estrutura no admin: tabela `lessons(id, title, youtube_id, module, order, published)` — CRUD simples. Quando a academy virar diferencial pago de verdade, migrar para **Mux** (só trocar o player; a tabela `lessons` já existe). Pular Supabase Storage para vídeo — pior dos dois mundos.

## 4) Endpoints /api do projeto admin

**Todo endpoint começa com o mesmo guard** (extrair para `api/_lib/adminAuth.ts`):
```ts
// 1. Bearer token → supabase.auth.getUser(token)  (verifica assinatura)
// 2. user.email está em public.admins?  (query com service_role)
// 3. JWT aal === 'aal2'?  (MFA feito)
// Falhou qualquer um → 401, sem detalhes no corpo. Só então instancia o client service_role.
```

### Endpoints MVP
| Método | Rota | Faz |
|---|---|---|
| GET | `/api/metrics` | Contagens agregadas: users total/7d/30d, ativos, msgs/dia |
| GET | `/api/users?q=&page=` | Lista/busca usuários (join auth.users + profiles + plan) |
| GET | `/api/users/[id]` | Detalhe: perfil, plano, últimas mensagens, notas |
| POST | `/api/users/[id]/ban` | Ban via Supabase Admin API (`ban_duration`); body: duração |
| POST | `/api/users/[id]/unban` | Remove ban |
| DELETE | `/api/users/[id]` | Deleta auth + profiles + messages + avatar no storage (LGPD) |
| POST | `/api/users/[id]/reset-password` | `generateLink({type:'recovery'})` → e-mail via Resend |
| POST | `/api/users/[id]/plan` | Body `{plan:'pro'|'free'}` → grava `profiles.plan` |
| GET | `/api/chat/recent?limit=` | Últimas N mensagens com autor |
| DELETE | `/api/chat/messages/[id]` | Apaga mensagem (e imagem no bucket se houver) |
| POST | `/api/users/[id]/mute` | Body `{until}` → `profiles.muted_until` |
| GET/POST/DELETE | `/api/announcements` | CRUD de avisos |
| — | *(fase 2)* `/api/billing/[userId]` | GET status Stripe + link pro dashboard |

Extra barato que vale ouro: tabela `admin_audit_log(action, target, at)` — cada endpoint grava uma linha. Se algo der errado, há trilha.

## 5) Esforço estimado (sessões de trabalho)

| Bloco | Sessões | Conteúdo |
|---|---|---|
| **0. Pré-requisitos** | 1 | Rotacionar chave Resend + OpenRouter (pendência conhecida!), confirmar tabela `admins` + `is_admin()` aplicadas, habilitar MFA no Supabase |
| **1. Setup projeto** | 1 | Repo, Vite scaffold, projeto Vercel, `admin.cryptorico.app`, env vars, headers/CSP enforce, portão 0 |
| **2. Auth completa** | 1–2 | Login + enrolamento TOTP + guard `aal2` no front + `adminAuth.ts` nas funções |
| **3. Usuários + métricas** | 2 | Endpoints users/* + metrics + telas de listagem/detalhe/ações |
| **4. Moderação + avisos** | 1–2 | Chat feed, delete, mute, announcements + banner no app público |
| **5. Migrar plan.ts p/ Supabase** | 1 | `profiles.plan` + trocar `getPlan()` (mexe no app principal) |
| **6. Stripe (fase 2)** | 2–3 | Checkout anual cartão+Pix no app, webhook → `profiles.plan`, tela de assinaturas no admin |
| **7. Academy YouTube (fase 3)** | 1 | Tabela lessons + CRUD admin + página no app |

**MVP funcional (blocos 0–4): ~6–7 sessões.** Divisão de papéis: Claude escreve todo o código; **PenseRico faz** — criar repo privado no GitHub, importar na Vercel, colar `SUPABASE_SERVICE_ROLE_KEY` nas env vars, apontar DNS do subdomínio, rotacionar as chaves Resend/OpenRouter nos respectivos painéis, e escanear o QR do TOTP no primeiro login.


---

# Apêndice B — Segurança

# Blindagem Crypto Rico — Plano de Segurança (app público + painel admin)

---

## 1) Modelo de ameaça resumido

| Quem ataca | Como ataca | O que quer |
|---|---|---|
| **Script kiddies / bots de varredura** | Escaneiam a internet procurando Supabase aberto, chaves expostas, endpoints sem auth | Qualquer coisa fácil: chaves de API, banco aberto |
| **Credential stuffing** | Testam listas de e-mail+senha vazadas de outros sites no seu login | Contas de assinantes (acesso PRO grátis, revenda) |
| **Abusadores de IA** | Criam contas grátis ou raspam o `/api/ai-proxy` | Gastar seus créditos OpenRouter — prejuízo direto em R$ |
| **Scrapers** | Copiam seus sinais, setups e indicadores para revender | Seu conteúdo pago sem pagar |
| **Spammers de chat** | Contas descartáveis inundando o chat com golpes/phishing | Alcançar seus usuários (público cripto = alvo de scam) |
| **Atacante direcionado** | Vai atrás do painel admin e da conta pensericodigital@gmail.com | Controle total: usuários, dados LGPD, e no futuro o Stripe |
| **Insider/vazamento acidental** | Chave colada em chat, commitada no git (já aconteceu 2x) | Acesso aos serviços em seu nome |

**Ativos mais valiosos:** créditos de IA (custo real imediato), dados pessoais dos usuários (LGPD/multa), a conta admin única (chave do reino), e futuramente o Stripe.

---

## 2) AÇÕES IMEDIATAS — checklist priorizado

### CRÍTICO AGORA (fazer hoje, nesta ordem)

- [ ] **1. Rotacionar a chave Resend** — [PenseRico/painel]
  Por quê: a chave foi colada num chat; quem a tiver manda e-mail como `contato@cryptorico.app` (phishing perfeito contra seus usuários).
  Como: resend.com → API Keys → Delete na antiga → Create new → colar a nova no Supabase (Auth → SMTP Settings). Testar enviando um e-mail de reset de senha.

- [ ] **2. Rotacionar a chave OpenRouter antiga** — [PenseRico/painel]
  Por quê: ela está em commits antigos do git; histórico do GitHub é público/permanente, bots acham chaves em minutos e queimam seu saldo.
  Como: openrouter.ai → Keys → Revoke na antiga → criar nova → atualizar a env var `OPENROUTER_API_KEY` no projeto Vercel (data-oracle-trader → Settings → Environment Variables) → Redeploy. Aproveite e defina **limite de gasto (credit limit)** na chave nova.
  Nota: não adianta "apagar o commit" — a chave já deve ser considerada queimada; revogar é o único remédio.

- [ ] **3. Conferir que nenhum segredo está no bundle do Vite** — [Claude/código]
  Por quê: tudo que começa com `VITE_` vai parar no navegador de qualquer visitante. Segredo só em env var da Vercel, usado dentro de `/api/*`.
  Como: grep no repo por chaves e por `VITE_` suspeitos; segredos ficam só em `process.env` das funções serverless (já é o padrão do projeto — validar).

- [ ] **4. Supabase Auth — proteção de senha vazada** — [PenseRico/painel]
  Por quê: bloqueia senhas que já apareceram em vazamentos (HaveIBeenPwned) — mata boa parte do credential stuffing de graça.
  Como: Supabase → Authentication → Policies/Settings → "Leaked password protection" → ativar. Aproveitar e exigir senha mínima de 8+ caracteres.

- [ ] **5. Captcha (Cloudflare Turnstile) no signup e login** — [PenseRico/painel] + [Claude/código]
  Por quê: sem captcha, um bot cria mil contas por hora para spammar o chat e drenar a IA.
  Como: PenseRico cria o site key no Cloudflare Turnstile (grátis) e ativa em Supabase → Auth → Attack Protection → CAPTCHA; Claude adiciona o widget Turnstile nas telas de login/cadastro e libera o domínio `challenges.cloudflare.com` na CSP.

- [ ] **6. Rate limits de Auth no Supabase** — [PenseRico/painel]
  Por quê: limita tentativas de login/cadastro/reset por IP — o atacante de força bruta bate na parede.
  Como: Supabase → Auth → Rate Limits: reduzir sign-in/sign-up/OTP para valores conservadores (ex.: 10-20/h por IP); e-mails de reset 3-4/h.

### CRÍTICO ESTA SEMANA

- [ ] **7. Revisão completa de RLS** — [Claude/código] (SQL) + [PenseRico/painel] (rodar no SQL Editor)
  Por quê: RLS é o cadeado de cada gaveta do banco; uma policy errada = qualquer usuário lê/apaga dados dos outros.
  Checklist por tabela:
  - `messages`: SELECT para autenticados; INSERT só com `user_id = auth.uid()`; **DELETE/UPDATE só do próprio autor** (admin apaga via função is_admin());
  - `profiles`: SELECT público ok (username/avatar); **UPDATE/INSERT só do dono** (`id = auth.uid()`); nunca expor e-mail nesta tabela;
  - `alerts`, `setups`: SELECT/INSERT/UPDATE/DELETE só do dono;
  - `admins`: **NENHUMA policy pública** (nem SELECT) — só a função `is_admin()` (security definer) consulta; confirmar que RLS está ENABLED e sem policy = ninguém lê;
  - Teste prático: logar com uma conta de teste comum e tentar apagar mensagem de outro / editar profile alheio via console.

- [ ] **8. Storage `chat-images`: limitar tamanho e tipo** — [PenseRico/painel] + [Claude/código]
  Por quê: sem limite, alguém sobe arquivos de 500 MB (estoura sua cota e sua conta) ou HTML malicioso disfarçado de imagem.
  Como: no bucket, definir file size limit (ex.: 2 MB) e allowed MIME types (`image/png, image/jpeg, image/webp, image/gif`); policy de INSERT restrita a autenticados gravando na própria pasta (`(storage.foldername(name))[1] = auth.uid()::text`); no front, validar tamanho/tipo antes do upload (UX).

- [ ] **9. Blindar o `/api/ai-proxy` contra abuso de custo** — [Claude/código]
  Por quê: é a torneira de dinheiro; já tem auth Supabase + rate limit, mas precisa de teto.
  Como: validar tamanho máximo do prompt (ex.: 4-8k chars), limite diário por usuário (não só por minuto), modelo fixado no servidor (cliente nunca escolhe modelo caro), timeout, e log de consumo por user_id. Somado ao credit limit da chave OpenRouter (item 2) = dano máximo conhecido.

- [ ] **10. CSP: de Report-Only para enforcing** — [Claude/código]
  Por quê: hoje a CSP só "anota" violações; valendo de verdade, ela impede script injetado de roubar sessão (XSS vira tiro n'água).
  Como: rodar 3-7 dias em Report-Only durante os testes, revisar relatórios/console, corrigir o que quebrar (o `unsafe-eval` do TradingView já está contemplado no vercel.json atual), então renomear o header para `Content-Security-Policy`. Adicionar Turnstile (item 5) antes de virar a chave.

### IMPORTANTE, PODE ESPERAR ALGUMAS SEMANAS

- [ ] **11. Sair do gating por localStorage** — [Claude/código]
  Por quê: hoje `src/lib/plan.ts` guarda o plano no navegador com default "pro" — qualquer um edita o localStorage e vira PRO. Ok para fase de testes, inaceitável com cobrança.
  Como: quando o Stripe entrar, plano vem de tabela `subscriptions` no Supabase (escrita só por webhook Stripe verificado, leitura RLS do dono) e o ProGate consulta o servidor. **Regra de ouro: recurso pago caro (IA) valida o plano no `/api/*`, não só no front.**

- [ ] **12. Moderação básica de chat** — [Claude/código]
  Por quê: chat cripto atrai scam de "suporte" e links de phishing contra seus próprios usuários.
  Como: rate limit de mensagens por usuário (ex.: 1 msg/2s via policy ou trigger), filtro de links na primeira semana de conta, botão de reportar; ban = coluna `banned_at` em profiles checada por policy.

- [ ] **13. Pre-commit hook anti-segredo (gitleaks) + `npm audit` de rotina** — [Claude/código]
  Por quê: já vazou chave 2x; um robô no computador que barra commit com chave evita a 3ª.

---

## 3) Blindagem do painel admin separado (novo projeto Vercel)

Arquitetura: **4 camadas independentes** — o atacante precisa vencer todas.

1. **Camada 0 — Obscuridade (não é defesa, mas ajuda)** — [PenseRico/painel] + [Claude/código]
   Por quê: o que não é encontrado não é atacado à toa.
   Domínio não divulgado (ex.: subdomínio aleatório tipo `ops-x7k2.cryptorico.app` ou domínio à parte), `robots.txt` com `Disallow: /`, meta `noindex`, header `X-Robots-Tag: noindex, nofollow`, zero links a partir do app público.

2. **Camada 1 — Vercel Deployment Protection** — [PenseRico/painel]
   Por quê: um porteiro ANTES do site carregar; bots nem veem sua tela de login.
   Como: projeto admin → Settings → Deployment Protection → ativar **Vercel Authentication** (só sua conta Vercel entra) ou Password Protection (nota: em alguns planos é recurso pago — Vercel Auth costuma bastar). Vale para preview E production.

3. **Camada 2 — Login Supabase com allowlist + MFA obrigatório** — [Claude/código] + [PenseRico/painel]
   Por quê: mesmo que alguém passe do porteiro, precisa ser você, com seu celular na mão.
   - Allowlist: todo endpoint/página admin valida `is_admin()` (tabela `admins` contém só `pensericodigital@gmail.com`); cadastro desabilitado no projeto admin;
   - **MFA TOTP obrigatório**: Supabase MFA (app autenticador tipo Google Authenticator); o painel checa `aal2` no JWT — sem segundo fator, não entra mesmo com senha certa; [PenseRico] escaneia o QR uma vez e guarda os códigos de recuperação em papel/gerenciador de senhas;
   - Conta Google (pensericodigital) também com 2FA — ela reseta tudo o resto. E 2FA nas contas Vercel, GitHub, Supabase, Resend, OpenRouter (5 minutos cada, proteção enorme).

4. **Camada 3 — Backend admin nunca no navegador** — [Claude/código]
   Por quê: a `service_role key` do Supabase (chave mestra que ignora RLS) só pode existir em função serverless do projeto admin, jamais em código que chega ao navegador.
   Toda ação admin (banir, resetar, ver assinaturas) = função `/api/admin/*` que: valida JWT + `aal2` + `is_admin()` → executa → grava auditoria.

5. **Auditoria — tabela `audit_log`** — [Claude/código]
   Por quê: se algo der errado, você sabe quem fez o quê e quando; sem isso, invasão é invisível.
   Colunas: `id, admin_email, action, target_user_id, details jsonb, ip, user_agent, created_at`. **Insert-only**: nenhuma policy de UPDATE/DELETE (nem para admin) — log que pode ser apagado não é log. Toda função `/api/admin/*` escreve nela antes de responder.

6. **Sessões curtas** — [Claude/código] + [PenseRico/painel]
   Por quê: aba admin esquecida aberta = porta aberta.
   JWT expiry curto no projeto (ex.: 1 h), logout automático por inatividade (15-30 min) no front do painel.

7. **Futuro academy (vídeos)**: uploads só pelo painel admin via função serverless com URL assinada; bucket privado; entrega ao app público por URL assinada com expiração — [Claude/código], quando chegar a hora.

---

## 4) Dados / LGPD

- [ ] **Backups** — [PenseRico/painel]
  Por quê: ransomware, erro de SQL ou dedo nervoso não podem apagar seu negócio.
  Como: plano gratuito do Supabase tem backup diário limitado; no plano Pro ativar **PITR** (point-in-time recovery — volta o banco para qualquer minuto). Antes do lançamento pago, migrar para Pro. Testar uma restauração 1x (backup não testado = esperança, não backup).

- [ ] **Retenção e minimização** — [Claude/código]
  Por quê: LGPD manda guardar só o necessário; dado que você não tem não vaza.
  Coletar só e-mail + username; definir política: logs de aplicação 30-90 dias; contas inativas/deletadas purgadas após prazo definido (ex.: 30 dias pós-exclusão).

- [ ] **Exportar/apagar dados a pedido (direitos do titular)** — [Claude/código] + [PenseRico/painel]
  Por quê: qualquer usuário pode exigir cópia ou exclusão dos seus dados; a lei dá prazo (15 dias para confirmação simplificada).
  Como: botão no painel admin "Exportar dados do usuário" (JSON com profile, mensagens, alerts, setups) e "Excluir usuário" (deleta Auth + linhas + imagens do storage; mensagens de chat podem virar "[usuário removido]" para não quebrar o histórico). Registrar o pedido no audit_log. Página de Política de Privacidade com canal de contato (contato@cryptorico.app).

- [ ] **O que NUNCA logar** — [Claude/código]
  Por quê: log vaza fácil (aparece em painel da Vercel, em print, em suporte).
  Proibido em qualquer console.log/log de função: senhas, tokens/JWT, chaves de API, corpo completo de headers `Authorization`, conteúdo integral de prompts do usuário com dados pessoais, e futuramente dados de cartão (que nem devem tocar seu servidor — ficam no Stripe). Logar apenas: user_id, ação, timestamp, status.

- [ ] **Stripe (quando entrar)** — planejar já: usar Checkout hosted (cartão nunca passa pelo seu código = PCI resolvido pelo Stripe), webhook com verificação de assinatura + idempotência, plano gravado por webhook (item 11 acima).

---

## 5) Monitoramento barato (custo ~zero)

- [ ] **Alertas de erro da Vercel** — [PenseRico/painel]
  Por quê: pico de erros = ataque ou quebra; melhor saber por e-mail do que por reclamação de cliente.
  Como: Vercel → projeto → Observability/Log Drains; no plano free, criar o hábito de olhar Logs 1x/dia durante os testes. Alternativa grátis: Sentry free tier no front — [Claude/código] instala, avisa erro por e-mail.

- [ ] **Alerta de novo admin** — [Claude/código]
  Por quê: se aparecer uma segunda linha na tabela `admins`, você foi invadido — precisa saber em minutos.
  Como: trigger no Postgres em INSERT na tabela `admins` → chama Edge Function → envia e-mail via Resend para você. O mesmo para UPDATE/DELETE no audit_log (que não deveria acontecer nunca).

- [ ] **Aviso de login suspeito na conta admin** — [Claude/código]
  Por quê: login seu de madrugada de outro país = alarme.
  Como: no painel admin, a cada login registrar IP/user-agent no audit_log e comparar com o anterior; se mudou, e-mail "Novo acesso ao painel — foi você?". (Ative também os alertas nativos do Google para a conta Gmail.)

- [ ] **Alerta de custo OpenRouter** — [PenseRico/painel]
  Por quê: abuso de IA aparece primeiro na fatura.
  Como: credit limit na chave + olhar o dashboard de usage 2x/semana; futuramente [Claude/código] soma consumo por usuário e mostra no painel admin.

- [ ] **Supabase Auth logs** — [PenseRico/painel]: olhada semanal em Authentication → Logs procurando rajadas de falha de login (credential stuffing em andamento).

---

## Resumo de prioridade (o que fazer em que ordem)

| Prioridade | Itens | Quem |
|---|---|---|
| **HOJE** | Rotacionar Resend e OpenRouter (+credit limit); conferir bundle sem segredos | PenseRico (painéis) + Claude (grep) |
| **Esta semana** | Leaked password, Turnstile, rate limits de Auth; revisão RLS; limites do storage; teto no ai-proxy | Mistos — Claude escreve SQL/código, PenseRico clica e cola |
| **Antes de abrir ao público** | CSP enforcing; moderação de chat; gitleaks; alerta de novo admin; Política de Privacidade | Claude |
| **Painel admin (novo projeto)** | 4 camadas: Vercel Auth → allowlist+MFA → backend com service_role isolado → audit_log insert-only; noindex/domínio oculto; sessões curtas | Claude constrói, PenseRico ativa MFA e Deployment Protection |
| **Antes de cobrar** | Supabase Pro + PITR; plano via Stripe webhook (matar localStorage); export/delete LGPD; 2FA em todas as contas de serviço | Mistos |

**Regra que resume tudo:** segredo nunca no navegador nem no git; toda porta com duas fechaduras (auth + limite); tudo que o admin faz deixa rastro; e chave exposta é chave morta — rotaciona primeiro, investiga depois.


---

# Apêndice C — Stripe

# Plano: Assinatura ANUAL do Crypto Rico PRO via Stripe

Baseado no estado real do projeto: `src/lib/plan.ts` hoje tem default "pro" via localStorage (comentário no código já prevê a virada no "Sprint E"), `/api` já tem 3 funções serverless (ai-proxy, news, fng-tradfi), Supabase com Auth + RLS funcionando.

---

## 1) Estrutura de produto e preço

**1 produto no Stripe: "Crypto Rico PRO"** com preços (Prices) separados. Nunca apague um Price usado — crie outro e arquive o antigo.

| Opção | Preço | Posicionamento | Prós / Contras |
|---|---|---|---|
| **A — Fundador (recomendada)** | **R$ 129/ano** | "Preço de fundador — trava esse valor enquanto assinar". Criar também um Price de R$ 297/ano *arquivado* só para âncora na landing ("de R$ 297 por R$ 129"). | Converte melhor no lançamento; quem entrar cedo renova a R$ 129 para sempre (fidelidade). Contra: receita menor por usuário. |
| **B — Preço cheio** | R$ 297/ano (~R$ 24,75/mês) | Landing mostra o equivalente mensal. Cupom de lançamento de 30–50% via código promocional do Stripe. | Mais receita, âncora honesta. Contra: fricção maior num produto ainda em prova. |
| **C — Anual + mensal depois** | R$ 129/ano no lançamento; adicionar R$ 29/mês em ~3 meses | Mensal serve de porta de entrada e faz o anual parecer barato (economia de ~63%). | Melhor grade a médio prazo. Mensal fica para fase 2 (só cartão). |

**Pagamento no Brasil:**
- **Cartão**: assinatura normal, renova sozinha todo ano (`charge_automatically`).
- **Pix**: Pix **não renova sozinho** no Stripe (não há cobrança recorrente off-session por Pix hoje; o "Pix Automático" do BC ainda não está disponível de forma geral na Stripe — verificar no dashboard na hora de implementar). Solução padrão de mercado:
  - Cartão → Checkout `mode=subscription` (renovação automática).
  - Pix → Checkout `mode=payment` (pagamento único) que libera **365 dias de acesso** na nossa tabela; e-mail automático ~15 dias antes de vencer com link para pagar de novo.
- Boleto: deixar desligado (lento, chargeback de experiência). 

---

## 2) Arquitetura no stack atual (Vite SPA + /api Vercel + Supabase)

**Regra de ouro: o front NUNCA fala com o Stripe direto e NUNCA decide preço.** Tudo passa pelas funções em `/api`, que já é o padrão do projeto (igual ao `ai-proxy`).

```
Usuário logado → clica "Assinar PRO"
  → POST /api/stripe/create-checkout  (envia JWT do Supabase, igual ai-proxy)
      valida JWT → cria/recupera Customer no Stripe (guarda supabase user_id no metadata)
      → cria Checkout Session (hosted) com o price_id fixo no servidor
  → redirect para checkout.stripe.com (página do Stripe, PCI é problema deles)
  → Stripe cobra (cartão ou Pix)
  → Stripe chama POST /api/stripe/webhook (assinatura verificada com STRIPE_WEBHOOK_SECRET)
      → grava/atualiza linha em public.subscriptions no Supabase (via service role key)
  → usuário volta para cryptorico.app/obrigado → app relê o plano → PRO liberado
```

**Peças [Claude/código]:**
- `api/stripe/create-checkout.ts` — autenticado via JWT Supabase (mesmo padrão do ai-proxy). `success_url`/`cancel_url` para o app. `price_id` vem de env var, nunca do front (evita manipulação de preço).
- `api/stripe/webhook.ts` — verifica assinatura com o SDK oficial usando o **corpo cru** da requisição (na Vercel: desligar o body parser da função, senão a verificação sempre falha — pegadinha clássica). **Idempotente**: tabela `stripe_events(event_id pk, processed_at)`; se o evento já foi processado, responde 200 e sai (Stripe reenvia eventos, chegam duplicados e fora de ordem). Responde 200 rápido.
- `api/stripe/portal.ts` — autenticado; cria sessão do **Customer Portal** do Stripe (cancelar, trocar cartão, ver recibos). Zero tela nossa para gerenciar assinatura.
- Tabela no Supabase:

```sql
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  status text not null default 'inactive',   -- active | past_due | canceled | comp
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy "dono lê a própria assinatura"
  on public.subscriptions for select using (auth.uid() = user_id);
-- NENHUMA policy de insert/update para usuários: só o webhook (service role) e o admin escrevem.
```

**Peças [PenseRico/painel]:** ver seção 5.

---

## 3) Virada do gating (plan.ts)

O comentário no próprio `plan.ts` já previu isso: "Trocar só a função getPlan() liga tudo no backend sem mexer no resto".

**[Claude/código]:**
1. `getPlan()` passa a ser assíncrono por baixo: busca `subscriptions` do usuário logado no Supabase (RLS garante que só vê a própria), com **cache em memória + localStorage com validade de ~5 min** (o hook `usePlan()` já existente continua síncrono para a UI; revalida em background e no evento de login).
2. Regra: `status in ('active','comp')` **e** `current_period_end > agora()` → "pro". Qualquer outra coisa (sem linha, deslogado, erro de rede) → **"free"**. Default seguro.
3. `setPlan()` do localStorage vira só atalho de dev (ou some).
4. `ProGate` e `PRO_BENEFITS` **não mudam nada**.

**Testers atuais (para não cortar ninguém no dia da virada):**
- **Grandfathering manual (recomendado)**: antes de virar o default para "free", inserir no `subscriptions` uma linha `status='comp'` com `current_period_end` = +60 ou +90 dias para os e-mails dos testers ativos. [Claude] faz o SQL; [PenseRico] passa a lista de e-mails. Depois, o painel admin gerencia isso (dar/estender cortesia = editar essa linha).
- Complemento: **cupom de fundador** no Stripe (ex.: `FUNDADOR50`, 50% no 1º ano) enviado por e-mail aos testers quando a cortesia estiver acabando — vira conversão em vez de corte seco.

---

## 4) Eventos de webhook que importam

| Evento | O que o handler faz |
|---|---|
| `checkout.session.completed` | Amarra tudo: pega `client_reference_id`/metadata (user_id do Supabase) + `customer` → upsert em `subscriptions`. Se foi Pix (mode=payment): `status='active'`, `current_period_end = agora + 365 dias`. Se assinatura de cartão: grava `stripe_subscription_id` e espera os eventos abaixo confirmarem período. |
| `invoice.paid` | Renovação anual do cartão passou: `status='active'`, atualiza `current_period_end` com o novo período. É este evento que mantém o cliente PRO ano após ano. |
| `customer.subscription.updated` | Espelha o estado real: atualiza `status`, `price_id`, `current_period_end`, e o caso "cancelou mas vale até o fim do período" (`cancel_at_period_end` → continua active até a data). |
| `customer.subscription.deleted` | Assinatura morreu de vez: `status='canceled'` → usuário cai para free no próximo refresh do cache. |
| `invoice.payment_failed` | Dunning: NÃO cortar na hora. `status='past_due'`; o **Smart Retries + e-mails de cobrança do próprio Stripe** (liga no painel) tentam de novo por dias. Só corta quando virar `deleted`/`canceled`. |

Sempre que possível o handler confia no **objeto re-buscado da API do Stripe** (não só no payload) e nunca no que o front diz.

---

## 5) Operacional

**Env vars — todas no painel da Vercel (projeto data-oracle-trader → Settings → Environment Variables), NUNCA com prefixo `VITE_`** (prefixo VITE vai para o bundle público — mesma regra que já usamos no ai-proxy):

| Var | O que é |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` primeiro; troca por `sk_live_...` no go-live |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` — um por endpoint de webhook (test e live têm secrets diferentes) |
| `STRIPE_PRICE_ID_ANUAL` (e `_ANUAL_PIX`) | IDs dos Prices — preço decidido no servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | já deve existir p/ ai-proxy; o webhook usa para escrever em `subscriptions` passando por cima do RLS |
| No front, só `VITE_STRIPE_PUBLISHABLE_KEY` se um dia precisar (Checkout hosted por redirect nem precisa) |

**Test vs live:** desenvolver 100% em modo test (cartão `4242 4242 4242 4242`, Pix tem simulador de pagamento no modo test; webhook local com `stripe listen` do Stripe CLI). Go-live = trocar 3 env vars + cadastrar o endpoint de webhook live + refazer produto/preço no modo live (test e live são mundos separados).

**[PenseRico/painel Stripe] — checklist de cliques:**
1. Criar conta Stripe (dados da empresa/CPF-CNPJ, banco para repasse) e concluir a ativação.
2. Ativar **Pix** em Settings → Payment methods.
3. Criar produto "Crypto Rico PRO" + preço anual BRL (modo test primeiro, depois repetir no live).
4. Billing → ativar **Customer Portal** (permitir cancelar e trocar cartão; ocultar troca de plano por enquanto).
5. Billing → **Smart Retries** + e-mails automáticos de falha de pagamento (dunning sem código).
6. Settings → Emails → ligar **recibos automáticos**; Branding → logo e cores do Crypto Rico.
7. Criar cupom `FUNDADOR50` (se optar pela via de cupons).
8. Copiar as chaves e colar nas env vars da Vercel (Claude indica exatamente onde).

**Impostos / Nota Fiscal:** o Stripe **não emite NF-e/NFS-e brasileira** — ele só processa o pagamento. Vender sem nota é risco fiscal. Opções simples para depois: **eNotas**, **NFE.io** ou **Notazz** (todas têm integração/gatilho por webhook do Stripe e emitem NFS-e automática por venda). Decisão futura junto com contador (enquadramento MEI/Simples, código de serviço). Não bloqueia o lançamento técnico, mas entra no radar do 1º mês de vendas.

---

## 6) Roteiro em etapas pequenas (sessões de ~1–2h)

| Sessão | Entrega | Quem |
|---|---|---|
| **1. Fundação** | Conta Stripe ativada, Pix ligado, produto+preço em modo test | [PenseRico] com Claude ditando os cliques |
| | Migration da tabela `subscriptions` + `stripe_events` + RLS no Supabase | [Claude] |
| **2. Checkout** | `api/stripe/create-checkout.ts` (JWT igual ai-proxy) + botão "Assinar PRO" na landing/paywall apontando pra ele; teste com cartão 4242 | [Claude] |
| **3. Webhook** | `api/stripe/webhook.ts` (assinatura + corpo cru + idempotência + 5 eventos) testado com Stripe CLI; conferir linha aparecendo no Supabase | [Claude] |
| **4. Virada do gating + portal** | `getPlan()` lendo `subscriptions` com cache, default "free"; grandfathering dos testers (`status='comp'`); `api/stripe/portal.ts` + link "Gerenciar assinatura" | [Claude] + [PenseRico] ativa o Customer Portal e passa a lista de testers |
| **5. Go-live** | Produto/preço no modo live, webhook live, trocar env vars, 1 compra real de R$ 129 (pode reembolsar), smoke test completo (assinar → PRO liga → cancelar no portal → vira free no fim do período) | [Claude] código/verificação + [PenseRico] painel e cartão |

**Estimativa total: ~5 sessões (7–10h de trabalho).** Pré-requisito de segurança antes do go-live: rotacionar a key do Resend (comprometida no chat) e a OpenRouter antiga dos commits — dinheiro de verdade entrando exige higiene de chaves em dia; e conferir se a CSP (hoje Report-Only) libera `checkout.stripe.com`/`js.stripe.com` quando for aplicada de verdade.

**Arquivos relevantes:** `/Users/pedro/data-oracle-hub/src/lib/plan.ts` (único ponto de virada do gating), `/Users/pedro/data-oracle-hub/api/ai-proxy.ts` (padrão de auth JWT a copiar), novos: `/Users/pedro/data-oracle-hub/api/stripe/create-checkout.ts`, `/Users/pedro/data-oracle-hub/api/stripe/webhook.ts`, `/Users/pedro/data-oracle-hub/api/stripe/portal.ts`.

