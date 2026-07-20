# Plano — Carteira Inteligente + Estudo da IA + Cotas (Crypto Rico)

## O que o PenseRico pediu (checklist do que foi captado)
- Carteira precisa aceitar **várias compras da MESMA moeda** em dias/preços diferentes (lotes), não 1 por moeda como hoje.
- Poder **adicionar, editar e apagar** cada compra individual.
- Ver **por moeda** (preço médio, total, lucro) e **por compra** (cada lote).
- IA lê **cada posição** e dá parecer **CURTO / MÉDIO / LONGO** dizendo se **segura ou vende (e onde)** — é o "estudo da IA", baseado nos setups reais.
- Cota da **carteira = 1x por semana**, com **timer** que roda a partir do uso.
- Cota das outras ações de IA (rodar/apertar bots, sinais) = **1x por dia**; **plano mais caro = 2x por dia**.
- Contador **durável por usuário**, **não burlável no cliente**, travado **no servidor**, com **timer na tela** mostrando quando libera.

## Visão geral (como funciona pro usuário final)
A pessoa faz login, registra cada compra que fez (moeda, quantidade, preço, data). A tela mostra cada moeda com preço médio e lucro, e por baixo a lista das compras. Uma vez por semana ela aperta "Estudo da IA" e recebe, para cada moeda, 3 cartões (curto/médio/longo prazo) dizendo segurar/vender/realizar parcial/aumentar, com as zonas de preço vindas do próprio sistema. Bots e sinais podem ser rodados 1x por dia (2x no plano premium). Tudo é contado no servidor: acabou a cota, aparece um relógio "libera em X".

## Parte A — Carteira com várias compras (lotes)
- **Banco:** nova tabela `public.purchases` (1 linha por compra): `user_id, coin_id, coin_symbol, quantity, buy_price (pode ser vazio = "não sei o preço"), buy_date, note`. RLS: cada um só vê/edita as próprias compras. Índices por usuário/moeda/data.
- **Migração do dado antigo:** hoje a carteira vive no navegador (`localStorage`). No 1º acesso logado, o código copia cada moeda antiga como 1 lote para o banco. Só marca "migrado" se deu certo; **nunca apaga** o backup local. Sem login, tenta de novo depois.
- **Mudança:** a carteira passa a **exigir login** (hoje funciona sem) — bate com o roadmap de assinatura.
- **Tela:** card por moeda (total, preço médio ponderado, valor atual, lucro R$/%, % da carteira) que **expande** na lista de compras; cada compra tem ✏️ editar e 🗑️ apagar; botão ＋ adicionar compra. Formulário simples em modal.
- **Cálculo:** preço médio e "investido" usam só lotes **com preço**; lotes sem preço entram no patrimônio mas não inflam o lucro (mostra aviso "P/L parcial").

## Parte B — Estudo da IA curto/médio/longo por posição
- **Regra de ouro:** os **números saem do código** (RSI, médias, Fibonacci, zonas de compra/venda dos setups já existentes); a **IA só escolhe a palavra do veredito e escreve 1 linha de porquê**. Nada de preço inventado; se a IA falhar, os cartões ainda aparecem.
- **Entrada:** para cada moeda o código monta uma "ficha" com preço médio (dos lotes), preço atual, lucro, momentum e o regime de cada horizonte. Falta hoje o **MÉDIO prazo** → criar `evaluateMidTermSetup` (swing de dias/semanas, MA20/MA50, RSI 4h/1d), espelhando os de curto e longo que já existem.
- **Saída:** a IA devolve **JSON** com, por moeda, 3 vereditos (`Segurar` · `Realizar parcial` · `Vender` · `Aumentar`) + porquê (≤140 caracteres). O código junta as **zonas reais** (venda/recompra) de cada horizonte.
- **Tela:** por moeda, cabeçalho + **3 cartões lado a lado** (CURTO/MÉDIO/LONGO) com selo colorido, zona de venda, zona de recompra e a frase da IA. Rodapé fixo: "não é recomendação". Se o JSON vier quebrado, cai num modo só-código (cartões com zonas + veredito automático).
- **Custo/limite:** modelo atual (`gpt-4o-mini`), até ~8 moedas por chamada (o resto em 2 lotes).

## Parte C — Cotas de IA (1x/semana carteira · 1x/dia bots · premium 2x/dia)
- **Por que o de hoje não serve:** o limite atual vive na **memória** da função Vercel (some ao reciclar, é por-instância, não separa carteira de bot). Não é cota.
- **Banco:** tabela `public.ai_usage` (`user_id, action, window_start, count`), 1 linha por usuário+ação. RLS deixa o usuário **só ler** a própria; **ninguém escreve pelo cliente** (só o servidor). Nova coluna `profiles.plan` (`free/pro/premium`) = **única fonte da verdade** da cota.
- **Enforcement (no servidor, à prova de corrida):** função no banco `consume_quota` que **trava a linha, confere e incrementa numa transação só** — dois cliques ao mesmo tempo não furam a cota. Janelas: carteira = **7 dias rolando** a partir do uso; bots/sinais = **reseta à meia-noite de São Paulo**. Se a IA (OpenRouter) falhar, **estorna** o uso.
- **Fluxo do proxy:** valida login → exige `action` (sem `action` válida = recusa) → lê o **plano no banco** (não confia no navegador) → consome cota → só então chama a IA → devolve quanto sobrou e quando libera.
- **Tela:** hook `useQuota` lê `/api/quota`; botão desabilitado quando zerou, com contagem regressiva "próxima análise em 5d 3h". No erro 429, mostra quando libera.
- **Anti-burla:** conta no servidor **antes** de chamar a IA, chaveado pelo `user_id` do token validado, em linha que o cliente não consegue escrever; se a checagem falhar, **nega** (falha fechada).

## Ordem de execução (fases pequenas)
1. **Fase 1 — Fundação da carteira:** rodar SQL da tabela `purchases`; criar CRUD + migração localStorage→banco + hook. (base pra tudo)
2. **Fase 2 — Tela de lotes:** reescrever a carteira (cards por moeda, lista de compras, adicionar/editar/apagar, cálculos).
3. **Fase 3 — Cotas (infra):** rodar SQL de `ai_usage`/`profiles.plan`/`consume_quota`; PenseRico põe a `service_role` na Vercel; ligar enforcement no proxy.
4. **Fase 4 — Estudo da IA:** motor do médio prazo + fichas + JSON + 3 cartões, já respeitando a cota da Fase 3.
5. **Fase 5 — Timers/UI de cota** em carteira, bots e sinais.

## Migrations SQL necessárias (resumo — detalhe fica pra implementação)
- `purchases_lotes.sql`: tabela `purchases` + RLS (dono) + índices.
- `ai_quotas.sql`: tabela `ai_usage` + RLS (só leitura do dono) + funções `consume_quota`/`refund_quota` + coluna `profiles.plan`.
- Todas idempotentes (podem rodar 2x, nada destrutivo), no padrão das migrations que já existem.

## Tabela-resumo
| Item | Quem faz | Fase | Esforço |
|---|---|---|---|
| SQL tabela `purchases` (colar no Supabase) | PenseRico | 1 | 1 clique |
| CRUD + migração localStorage + hook | Claude | 1 | ~1 sessão |
| Reescrita da tela da carteira (lotes) | Claude | 2 | ~2 sessões |
| SQL `ai_usage`/`profiles.plan`/funções | PenseRico | 3 | 1 clique |
| `service_role` na Vercel + Redeploy | PenseRico | 3 | painel |
| Proxy: exigir `action`, ler plano, consumir/estornar cota + `/api/quota` | Claude | 3 | ~1–2 sessões |
| Motor médio prazo + fichas + JSON + 3 cartões | Claude | 4 | ~1,5–2 dias |
| Hook `useQuota` + timers + botões desabilitados | Claude | 5 | ~1 sessão |
| Definir plano de usuário pago em `profiles` | PenseRico | pós-pgto | painel |

**Total estimado:** ~7–9 sessões de código; PenseRico entra ~3 vezes (2 SQLs + 1 env var), tudo passo a passo.

## Decisões que dependem do PenseRico (com recomendação)
1. Preço da compra pode ficar **em branco** ("não sei quanto paguei")? **Recomendo permitir vazio** — não perde quem importou a carteira antiga sem custo.
2. Carteira exigir **login** a partir de agora? **Recomendo sim** — já bate com o plano de assinatura e é benefício Pro.
3. Nomes dos planos: **`free / pro / premium`**, com o **banco** mandando na cota (o `localStorage` fica só pra enfeite de tela). **Recomendo padronizar assim.**
4. Confirmar os limites: carteira **1x/semana pra todos**, bots/sinais **1x/dia** (comum) e **2x/dia** (premium). **Recomendo esses números** — mudáveis num objeto de config no código.
5. Carteira é **7 dias rolando a partir do uso** (não semana de calendário). **Recomendo rolante** — foi o "ao usar, ativa o timer".
