# DEBUG — Guia de Análise de Erros

Este arquivo descreve **como capturar erros do bot** e o que mandar pro responsável (Davidson) corrigir rápido.

---

## Arquivos de log gerados automaticamente

Quando o bot roda, ele cria/atualiza estes arquivos na própria pasta:

| Arquivo | Conteúdo | Quando consultar |
|---------|----------|------------------|
| `bot.log` | Log completo: cabeçalho de cada execução, config ativa, todos os sinais detectados, todos os erros com tracebacks | Investigação geral, quero ver o que aconteceu |
| `erros.log` | **Só** os erros e avisos (níveis WARNING+) | Quando algo deu errado e quero focar no problema |
| `sinais.txt` | Histórico legível dos relatórios de cada varredura | Ver os sinais passados, sem ruído técnico |

Os arquivos `.log` rotacionam automaticamente: quando passam de 2MB, viram `.log.1`, `.log.2`, `.log.3` (mantém os 3 últimos).

---

## Como reportar um erro

**Mande estes 3 itens** pro Davidson:

1. **Print da janela preta** (Prompt de Comando) com a mensagem de erro visível
2. **Conteúdo de `erros.log`** (arquivo na pasta) — abre no Bloco de Notas, copia e cola
3. **Conteúdo de `config.json`** (pra confirmar que parâmetros estavam ativos)

Com esses 3, o diagnóstico costuma sair em minutos.

### Comando rápido pra mostrar os erros recentes (Windows)

No Prompt de Comando, dentro da pasta do bot:

```
type erros.log
```

Ou só os últimos:

```
powershell -command "Get-Content erros.log -Tail 50"
```

---

## O que é cada nível de log

| Nível | Significado | Ação |
|-------|-------------|------|
| `INFO` | Operação normal — início, fim, contagens, sinais detectados | Nenhuma. É o histórico. |
| `WARNING` | Algo estranho mas o bot continuou (rate limit, BTC indisponível) | Olhar. Pode ser intermitente, pode ser sintoma. |
| `ERROR` | Erro num símbolo específico (par delistado, sem dados) | Normal ter alguns. Se passar de 5% dos pares, investigar. |
| `CRITICAL` | Erro fatal que quebrou a execução inteira | Manda print + `bot.log` agora. |

---

## Padrões comuns e diagnósticos

### "ConnectionError" / "Read timeout" / "Max retries exceeded"
**Causa:** Internet caindo, ou exchange instável.
**Ação:** Roda de novo daqui a 1 minuto. Se persistir, troca o Wi-Fi / cabo / VPN.

### "RateLimitExceeded" em vários símbolos
**Causa:** Bot está rápido demais para a exchange.
**Ação:** Abre `config.json`, aumenta `request_delay_ms` de 200 → 400 ou 500. Salva e roda.

### Erros em pares específicos (ex: "BadSymbol", "ExchangeError")
**Causa:** Par foi delistado, ou recém-listado sem 200 candles, ou está em manutenção.
**Ação:** Normal. O bot pula esses e segue. Só investigar se for em mais de 5% dos pares.

### "FileNotFoundError: config.json"
**Causa:** Arquivo `config.json` foi apagado.
**Ação:** Roda o bot de novo — ele recria com defaults.

### Janela preta abre e fecha imediatamente
**Causa:** Erro fatal antes do logger inicializar (geralmente Python não no PATH ou `bot.py` corrompido).
**Ação:** Abre Prompt de Comando manualmente, navega até a pasta, roda `python bot.py` direto. Vai mostrar o erro real.

### Travou no "Instalando dependencias..." na primeira execução
**Causa:** pip travado, ou rede bloqueando, ou disco cheio.
**Ação:** Apaga a pasta `.venv` (dentro de Bot-Binance) e roda `run.bat` de novo.

### "ImportError: No module named 'ccxt'"
**Causa:** Venv corrompido ou Python errado sendo usado.
**Ação:** Apaga `.venv` e `run.bat` recria limpo.

---

## Debug avançado (rodar com mais verbosidade)

Se um problema for difícil de reproduzir, abre Prompt de Comando na pasta e roda:

```
.venv\Scripts\python.exe bot.py --verbose
```

Isso liga o nível DEBUG no `bot.log` — captura cada chamada de rede, cada cálculo intermediário. Arquivo cresce rápido (~5-10MB por varredura), mas mostra **tudo**.

---

## Memória entre execuções

O bot **não tem estado**: cada execução é independente. Os logs **acumulam** (até 2MB cada, depois rotacionam). Se quiser limpar manualmente:

```
del bot.log bot.log.* erros.log erros.log.* sinais.txt
```

(no Windows, na pasta do bot)

---

## Reportando bugs estruturais (não erros operacionais)

Se você acha que o bot está gerando **sinais errados** (ex: listou um par que claramente não deveria, ou ignorou um que deveria listar), mande:

1. **Símbolo** que está em desacordo (ex: `SOLUSDT`)
2. **Timeframe** e **horário UTC** da barra em questão
3. **Print do TradingView** mostrando o indicador "Setup Compra" original aplicado, com o Data Window aberto
4. **Saída do modo validate** pro mesmo símbolo:

```
run.bat --validate SOLUSDT
```

Com esses 4 itens, dá pra cruzar bit a bit e identificar onde a matemática divergiu (se é que divergiu).
