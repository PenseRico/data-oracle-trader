# Previsão de gastos de IA — Crypto Rico

> Modelo em uso: **openai/gpt-4o-mini** (via OpenRouter) — o tier mais barato.
> Preço: **US$ 0,15 / milhão de tokens de entrada** e **US$ 0,60 / milhão de tokens de saída**.
> Câmbio usado: ~R$ 5,50 / US$ (aproximado).

## Quanto custa CADA análise

| Ação | Entrada (tokens) | Saída (tokens) | Custo por chamada |
|---|---|---|---|
| Estudo da carteira (6 moedas, típico) | ~1.000 | ~800 | **US$ 0,0006** (~R$ 0,003) |
| Estudo da carteira (20 moedas, pesado) | ~2.400 | ~1.300 | **US$ 0,0011** (~R$ 0,006) |
| IA de bot/sinal (futuro) | ~1.200 | ~800 | **US$ 0,0007** (~R$ 0,004) |

**Ou seja: cada análise custa menos de 1 centavo de real.** O teto está travado: `max_tokens` de saída limitado, entrada limitada (24 mil caracteres), e a **cota** limita a frequência.

## Quanto custa POR USUÁRIO (pior caso: usa TODA a cota, toda semana)

- **Carteira (1x/semana)** = ~4,3 análises/mês × US$ 0,0008 = **~US$ 0,0035/usuário/mês** (~R$ 0,02).
- **IA de bot (1x/dia, quando existir)** = ~30/mês × US$ 0,001 = **~US$ 0,03/usuário/mês** (~R$ 0,16).

> Uso real costuma ser 25–40% disso (nem todo mundo usa a cota inteira toda vez).

## Projeção por nº de usuários (PIOR CASO — todos no limite)

### Hoje (só a IA da carteira, 1x/semana)
| Usuários | Custo/mês (US$) | Custo/mês (R$) |
|---|---|---|
| 100 | US$ 0,35 | ~R$ 1,90 |
| 1.000 | US$ 3,50 | ~R$ 19 |
| 10.000 | US$ 35 | ~R$ 190 |

### Futuro (carteira 1x/sem + IA de bot 1x/dia)
| Usuários | Custo/mês (US$) | Custo/mês (R$) |
|---|---|---|
| 100 | US$ 3,40 | ~R$ 19 |
| 1.000 | US$ 34 | ~R$ 185 |
| 10.000 | US$ 340 | ~R$ 1.850 |

*(Realista ~1/3 desses valores.)*

## Por que você NÃO vai tomar susto na fatura

1. **Cota travada no banco** (não burlável): carteira 1x/semana, demais 1x/dia — teto por usuário é conhecido.
2. **Login obrigatório** pra usar IA → sem abuso anônimo.
3. **`max_tokens` limitado** → cada resposta tem tamanho máximo.
4. **Entrada limitada** (tamanho do prompt) → não tem como mandar prompt gigante.
5. **Rate-limit 15/min por usuário** → sem rajada.
6. **Modelo mais barato** (gpt-4o-mini) — se um dia precisar, dá pra trocar por outro ainda mais barato.

## Conta do plano pago (fundador R$ 129/ano ≈ R$ 10,75/mês)

Mesmo no **pior caso** com IA de bot diária (~R$ 0,18/usuário/mês), o custo de IA é **menos de 2%** da mensalidade. Sobra praticamente tudo. A IA **não** inviabiliza o negócio — a cota existe pra segurar pico e permitir o tier premium mais generoso sem risco.

## Recomendação de teto de segurança
- Defina um **limite de gasto mensal no OpenRouter** (ex.: US$ 20) enquanto está em testes. Se estourar, corta sozinho — proteção contra qualquer surpresa.
