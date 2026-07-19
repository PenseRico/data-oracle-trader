Confirmado nos arquivos reais. Segue o plano consolidado.

---

# 🛡️ Plano de Blindagem — Crypto Rico (cryptorico.app)

## Nota de segurança geral
**Nível: OK (base boa, com 2 vazamentos de dinheiro em aberto).** Os testes ao vivo provaram o mais difícil: banco fechado (RLS não vaza nem deixa escrever), nenhum segredo no site publicado, IA da Vercel exige login, e cabeçalhos de proteção presentes. O que falta é fechar os ralos de **custo da IA** e um proxy esquecido — nada disso é teoria, é explorável hoje.

---

## 🔴 CRÍTICO — fazer já

1. **Proxy de IA fantasma, aberto pra qualquer um** — existe um segundo proxy da IA (`supabase/functions/ai-proxy/index.ts`) SEM login, com CORS `*`, usando a MESMA chave paga. Se estiver no ar, qualquer pessoa da internet queima seus créditos sem nem ter conta.
   - [PenseRico/painel] Rodar `supabase functions list` nos dois projetos; se aparecer `ai-proxy`, `supabase functions delete ai-proxy`.
   - [Claude/código] Apago a pasta `supabase/functions/ai-proxy/` do repo pra ninguém redeployar por acidente.

2. **Rotacionar as chaves vazadas (OpenRouter + Resend)** — foram coladas em chat/commits antigos; quem as tiver gasta seu dinheiro. Não existe "des-vazar", só trocar.
   - [PenseRico/painel] OpenRouter: gerar chave nova, revogar a antiga, atualizar `OPENROUTER_API_KEY` na Vercel. Resend: revogar (e, se não usa mais, só revogar).

3. **A IA cobra "só estar logado", não cobra plano nem tamanho** — sem captcha no cadastro, um robô cria N contas grátis, pega o token e chama `/api/ai-proxy` direto com textos gigantes (`api/ai-proxy.ts:76`, sem limite de tamanho) → conta de OpenRouter explode.
   - [Claude/código] Em `api/ai-proxy.ts`: limitar nº e tamanho das mensagens (ex.: ≤12 msgs / ≤24k caracteres), validar formato, e injetar o roteiro da IA no servidor (hoje mora no cliente e é burlável).
   - [PenseRico/painel] Ligar hCaptcha/Turnstile no cadastro e no "esqueci a senha" (Supabase → Attack Protection).

---

## 🟠 IMPORTANTE — esta semana

4. **Admin identificado por e-mail, não por conta fixa** (`admin_single.sql:35`) — se a confirmação de e-mail estiver desligada, alguém pode cadastrar/trocar para `pensericodigital@gmail.com` e virar admin (apaga mensagens de todos).
   - [PenseRico/painel] Confirmar que a conta admin JÁ existe e está confirmada; ligar "Confirm email" e "Secure email change".
   - [Claude/código] Trocar `is_admin()` pra checar pelo **UID** da sua conta (imune a e-mail); enquanto isso, exigir e-mail confirmado.

5. **Login em modo "implicit" deixa o token na URL** (`client.ts:17`) — link de recuperação/Google vira sessão completa que vaza por histórico/print. Combinado com allowlist frouxo = roubo de conta (até a sua).
   - [Claude/código] Trocar `flowType: "implicit"` → `"pkce"`.
   - [PenseRico/painel] Redirect URLs só com endereços exatos (zero `*`, zero `localhost` em produção).

6. **Trava de plano é 100% no navegador** (`plan.ts:18`, default vira "pro") — hoje tudo liberado pra teste; no dia do Pro pago, qualquer um digita uma linha no console e libera tudo. A regra tem que morar no servidor.
   - [Claude/código] Quando ligar o pago: `getPlan()` lê `profiles.plan` do login, default "free"; e o `ai-proxy` checa plano antes de responder.
   - [PenseRico/painel] Criar coluna `profiles.plan` + policies; RLS por plano nas tabelas Pro.

7. **CSP só "avisa", não bloqueia** (`vercel.json:17`, Report-Only) — qualquer XSS futuro rouba a sessão (que fica no localStorage). Como a CSP já lista os hosts certos, ligar é baixo risco.
   - [Claude/código] Adicionar `lh3.googleusercontent.com` no `img-src` (foto do Google), renomear header pra `Content-Security-Policy` (enforce), adicionar `Cross-Origin-Opener-Policy: same-origin-allow-popups`.
   - [PenseRico/painel] Confirmar que imagens da comunidade vêm do Supabase Storage antes de ligar.

8. **Rate-limit da IA é furável** (`ai-proxy.ts:16`, contador na memória de 1 instância) — em paralelo, o teto de 15/min multiplica. Sem cota diária.
   - [Claude/código + PenseRico] Contador por usuário/dia em store compartilhado (tabela Supabase ou Upstash) com teto duro (ex.: 200 req/dia).

---

## 🟢 BOM TER — depois

9. [PenseRico/painel] Senha mínima 8+ e ligar "leaked-password protection" (HaveIBeenPwned); ligar mitigação de enumeração de e-mail.
10. [PenseRico/painel] Corrigir `config.toml` (aponta pro projeto Supabase errado, `tqgacehhbrldbybmhqle` ≠ produção `ndffflhndftyifcmwcbe`) — evita deploy/migration no lugar errado.
11. [Claude/código] Bloquear conta logada com e-mail não confirmado no `ProtectedRoute`.
12. [Claude/código] Erros das funções devolvem mensagem genérica (não `String(e)`); timeout nos `fetch`; validar protocolo do link em `CoinDetail.tsx:118` (só `http/https`).
13. [Claude/código] Tirar `host: true` do `vite.config.ts` (as 2 vulns do npm audit só valem no `npm run dev` em rede aberta; produção não é afetada).
14. [PenseRico/painel] Confirmar que o repo GitHub é **privado** (os docs versionados descrevem a arquitetura de segurança). Declarar na Política de Privacidade que a carteira vai pra IA de terceiro (OpenRouter).

---

## ✅ Já protegido (provado pelos testes)
- **Banco (RLS):** anônimo não lê nenhuma tabela nem escreve; tabela `admins` não vaza. Fronteira real de dados está sólida.
- **Site publicado:** nenhum segredo (`sk-`, `re_`, `service_role`) no bundle — só as chaves públicas por design.
- **IA da Vercel:** exige token Supabase válido (401 sem login), CORS fechado, auth por Bearer (sem CSRF), modelos em allowlist, `max_tokens` limitado.
- **Sem XSS explorável, sem open redirect, sem SSRF:** widgets usam símbolo fixo; navegação é hardcoded pra `/dashboard`; funções chamam só hosts fixos.
- **Cabeçalhos:** HSTS, X-Frame-Options, X-Content-Type, Referrer-Policy, Permissions-Policy presentes.
- **npm audit:** as 2 vulns só afetam build/dev, não a produção.

**Raiz comum dos criticos #1 e #3: "confiar no cliente/no 'estar logado' para autorizar gasto".** Fechando o proxy fantasma + limite de input + captcha + cota por usuário, o ralo de dinheiro seca. Arquivos que EU altero: `supabase/functions/ai-proxy/` (apagar), `api/ai-proxy.ts`, `src/integrations/supabase/client.ts`, `vercel.json`, `src/lib/plan.ts`, `supabase/migrations/*is_admin*`, `vite.config.ts`, `src/pages/CoinDetail.tsx`.
