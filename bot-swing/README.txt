================================================================
BOT SETUP COMPRA - Scanner de sinais sobre todos os pares spot
================================================================

O QUE FAZ
---------
Varre todos os pares spot da exchange (Binance por padrao), calcula a
mesma matematica do indicador Pine "Setup Compra" no timeframe 4h, e
lista os pares que dispararam sinal de compra na ultima barra fechada.

A logica e identica ao indicador:
  - RSI(14) entre 40 e 57 (Wilder smoothing, igual ao Pine)
  - Close dentro de +/- 2% da EMA(80)
  - Volume change vs SMA(20) entre 0% e 500%
  - Trigger: high atual > high da barra anterior

O filtro BTC (BTC > EMA20 diario + estrutura) aparece como informacao
no relatorio mas NAO corta sinais (igual ao Pine original).

NAO usa API privada, NAO conecta na sua conta da exchange, NAO toca
em saldo nem em ordens. Usa apenas dados publicos de candle (OHLCV).


================================================================
PRIMEIRO USO NO WINDOWS (passo a passo)
================================================================

1) Instalar Python (uma vez so)
   - Acesse: https://www.python.org/downloads/
   - Baixe a versao mais recente para Windows
   - Execute o instalador
   - IMPORTANTE: na primeira tela, marque a caixa "Add python.exe to PATH"
   - Clique em "Install Now" e aguarde

2) Extrair a pasta do bot em qualquer lugar (ex: Documentos\Bot-Binance)

3) Duplo clique em run.bat
   - Na primeira vez ele cria o ambiente virtual e instala as bibliotecas
   - Aguarde alguns minutos
   - Depois ele roda a varredura e mostra os sinais

4) O resultado fica salvo em sinais.txt na mesma pasta

Nas proximas vezes, basta clicar em run.bat - vai direto pra varredura.


================================================================
USO NO MAC / LINUX
================================================================

Terminal:
    cd caminho/da/pasta
    ./run.sh                  # scan unico
    ./run.sh --loop           # roda a cada fechamento de 4h
    ./run.sh --validate BTCUSDT


================================================================
MODOS DE EXECUCAO
================================================================

run.bat                    -> 1 varredura, lista, salva, sai
run.bat --loop             -> roda continuamente, espera o fechamento
                              de cada barra de 4h e varre de novo
run.bat --validate BTCUSDT -> modo debug: imprime todos os valores
                              intermediarios de 1 simbolo, util pra
                              cruzar com o Data Window do TradingView
                              e confirmar que os numeros batem


================================================================
COMO TROCAR DE EXCHANGE
================================================================

Abra config.json em qualquer editor de texto. Edite a linha:

    "exchange": "binance"

Para uma das suportadas (todas funcionam, mesma logica):

    binance, bybit, okx, gate, kucoin, mexc, bitget,
    kraken, bingx, htx, coinbase, ...

Lista completa: https://github.com/ccxt/ccxt#supported-exchanges

Tambem da pra mudar o quote asset:

    "quote_filter": "USDT"   -> so pares contra USDT
    "quote_filter": "USDC"   -> so contra USDC
    "quote_filter": "ALL"    -> todos os pares spot da exchange

Salvou? Pronto, na proxima execucao ja roda na exchange escolhida.


================================================================
COMO AJUSTAR PARAMETROS DO INDICADOR
================================================================

Tudo em config.json. Os defaults ja batem com o indicador Pine
"Setup Compra" original. Pode editar qualquer um dos campos abaixo
(o que voce nao colocar volta ao default automaticamente):

    "timeframe": "4h"
        Periodo dos candles. Suportados:
        5m, 15m, 30m, 1h, 4h, 1d, 1w, 1M

    "rsi": { "length": 14, "min": 40.0, "max": 57.0 }
        length = periodo do RSI (default 14)
        min/max = faixa pra disparar sinal

    "ma": { "type": "EMA", "length": 80 }
        type = "EMA" ou "SMA"
        length = periodo da media (default 80)

    "distance_pct": 2.0
        Tolerancia +/- em % entre close e a media.
        Ex: 2.0 = close tem que estar a no maximo 2% acima ou
        abaixo da media pra valer o sinal.

    "volume": { "length": 20, "min": 0.0, "max": 500.0 }
        length = periodo da SMA do volume (default 20)
        min/max = faixa em % de variacao do volume vs essa SMA

    "btc": { "symbol": "BTC/USDT", "timeframe": "1d",
             "ma_length": 20, "ma_type": "EMA" }
        Filtro BTC informativo (nao corta sinais).
        Tambem aceita SMA, e qualquer dos timeframes acima.

Exemplos de ajustes uteis:

    Scan agressivo de 15m com RSI mais largo:
        "timeframe": "15m"
        "rsi": { "length": 14, "min": 35, "max": 65 }

    SMA50 em vez de EMA80, diario:
        "timeframe": "1d"
        "ma": { "type": "SMA", "length": 50 }

    So sinais com volume explodindo:
        "volume": { "length": 20, "min": 100, "max": 1000 }

Salvou? Roda de novo, ja vale.


================================================================
COMO VALIDAR QUE OS NUMEROS BATEM COM O TRADINGVIEW
================================================================

1) Rode:    run.bat --validate BTCUSDT
   (ou qualquer simbolo, ex: ETHUSDT, SOLUSDT)

2) Abra o TradingView no mesmo par e timeframe 4h

3) Compare:
   - RSI(14)         -> com indicador RSI no chart
   - EMA(80)         -> com indicador EMA no chart
   - Close, High     -> com Data Window do TV
   - Vol change %    -> calculo: (volume_atual - SMA20_volume) / SMA20_volume * 100

Os numeros devem bater ate 4 casas decimais. Se nao baterem, abra
um issue ou me avise.


================================================================
ARQUIVOS DA PASTA
================================================================

bot.py            -> codigo principal (nao precisa editar)
config.json       -> parametros (edite aqui o que quiser mudar)
requirements.txt  -> dependencias Python
run.bat           -> launcher Windows (clique 2x)
run.sh            -> launcher Mac/Linux
sinais.txt        -> historico de relatorios (criado na primeira execucao)
.venv/            -> ambiente Python isolado (criado automaticamente)


================================================================
LIMITES E NOTAS
================================================================

- Binance limita a 1200 requests/min. O bot respeita isso (delay de
  200ms entre requisicoes por padrao). 432 pares levam ~2-3 min.

- Se rodar em uma exchange muito grande (ex: gate, mexc com 1000+
  pares), pode levar 5-10 min por varredura.

- O bot sempre usa a ULTIMA BARRA FECHADA. Se a barra de 4h ainda
  esta em formacao, ele usa a barra anterior. Isso evita sinais que
  podem desaparecer quando a barra fechar.

- Modo --loop sincroniza com o fechamento UTC de cada timeframe:
    4h -> roda em 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC
    1d -> roda em 00:00 UTC
  Adiciona 30s de buffer pra exchange consolidar a barra.
