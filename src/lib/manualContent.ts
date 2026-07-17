export interface ManualMetric { nome: string; oQueMede: string; }
export interface ManualItem {
  id: string;
  title: string;
  plano: "Grátis" | "Pro";
  oQueE: string;
  comoUsar: string[];
  metricas: ManualMetric[];
}
export interface ManualGroup { id: string; title: string; items: ManualItem[]; }

export const MANUAL: ManualGroup[] = [
  {
    id: "principal",
    title: "Principal",
    items: [
      {
        id: "terminal",
        title: "Terminal de Comando",
        plano: "Grátis",
        oQueE: "É a tela inicial (home) do painel. Junta num lugar só uma visão geral do mercado, o gráfico do Bitcoin ao vivo, termômetros de sentimento e as melhores oportunidades do dia já mastigadas em planos de trade.",
        comoUsar: [
          "Comece pelos 'Planos de Trade Prontos' no topo: cada cartão já traz entrada, alvo e stop de uma moeda.",
          "Olhe os Termômetros (ao lado do gráfico do BTC) pra sentir se o mercado está com medo ou ganância antes de operar.",
          "Role até 'Melhores Oportunidades do Dia' pra ver as moedas mais bem pontuadas pelo motor de sinais.",
          "Clique numa moeda pra abrir a análise completa dela; embaixo ainda tem as notícias do momento.",
        ],
        metricas: [
          { nome: "F&G Cripto (Fear & Greed)", oQueMede: "Termômetro de 0 a 100 do humor do mercado cripto: perto de 0 é medo extremo (costuma ser fundo), perto de 100 é ganância extrema (costuma ser topo)." },
          { nome: "F&G Tradicional", oQueMede: "Mesmo termômetro de medo/ganância, mas do mercado tradicional (ações), pra ver se o clima geral bate com o cripto." },
          { nome: "Altseason", oQueMede: "Mostra se o dinheiro está indo mais pro Bitcoin (Bitcoin Season) ou pras altcoins (Altcoin Season). Conta quantas altcoins bateram o BTC em 30 dias." },
          { nome: "RSI BTC", oQueMede: "Força do Bitcoin: abaixo de 30 está sobrevendido (esticado pra baixo), acima de 70 sobrecomprado (esticado pra cima)." },
          { nome: "Dominância BTC", oQueMede: "Fatia (%) que o Bitcoin representa do valor total do mercado cripto." },
          { nome: "Amplitude", oQueMede: "Percentual de moedas subindo no dia. Acima de 60% mercado forte, abaixo de 35% mercado fraco." },
          { nome: "Score do sinal", oQueMede: "Nota que o motor dá pra cada moeda somando RSI, médias, volume, sentimento e outros. Score alto (≥5) puxa pra compra; ≤0 puxa pra venda." },
          { nome: "Ticker de Liquidações", oQueMede: "Barra no topo com as liquidações acontecendo ao vivo (traders alavancados sendo estourados) na Binance Futures." },
        ],
      },
      {
        id: "carteira",
        title: "Minha Carteira",
        plano: "Pro",
        oQueE: "Onde você cadastra as moedas que tem e vê o valor atual, o lucro/prejuízo e uma leitura de estado com zonas de venda e recompra. Tem também um botão que pede pra IA analisar tudo.",
        comoUsar: [
          "Digite o símbolo da moeda (ex.: BTC), a quantidade e, se quiser, o preço médio que pagou; clique em Adicionar.",
          "Veja no topo o resumo: valor atual, quanto investiu, lucro/prejuízo e retorno em %.",
          "Em cada cartão, olhe a 'Leitura': estado da moeda + zona sugerida de venda e de recompra.",
          "Clique em 'Analisar com IA' pra receber um texto simples com venda/recompra e 2 cenários com probabilidade.",
          "Seus dados ficam salvos só no seu navegador; as zonas são estudo, não ordem de compra/venda.",
        ],
        metricas: [
          { nome: "Valor Atual / Investido / Lucro-Prejuízo / Retorno", oQueMede: "Quanto sua carteira vale hoje, quanto você colocou, a diferença em dólar e em porcentagem." },
          { nome: "Estado (RSI)", oQueMede: "Diz se a moeda está sobrecomprada (atenção a realizar lucro), sobrevendida (possível acúmulo) ou neutra." },
          { nome: "Zona de venda", oQueMede: "Preço perto da resistência recente, sugerido como ponto de estudo pra realizar lucro." },
          { nome: "Zona de recompra", oQueMede: "Preço perto do suporte recente, sugerido como ponto de estudo pra voltar a comprar." },
        ],
      },
      {
        id: "market",
        title: "Market",
        plano: "Grátis",
        oQueE: "Uma tabela ao vivo com as 100 maiores moedas, com filtro por RSI. Serve pra garimpar rapidamente moedas esticadas pra baixo (sobrevendidas) ou pra cima (sobrecompradas).",
        comoUsar: [
          "Use o painel de filtro à esquerda pra escolher a faixa de RSI que quer ver.",
          "Dica prática: RSI abaixo de 30 mostra zonas de sobre-venda; acima de 70, zonas de exaustão de compra.",
          "A tabela atualiza sozinha; o contador mostra quantos ativos passaram no filtro.",
          "Cruze o resultado com volume e funding antes de decidir qualquer entrada.",
        ],
        metricas: [
          { nome: "RSI (filtro)", oQueMede: "Indicador de força/exaustão de 0 a 100 usado pra filtrar a lista; baixo = esticado pra baixo, alto = esticado pra cima." },
          { nome: "Tabela ao vivo", oQueMede: "Preço, variação e dados das 100 maiores moedas, atualizados em tempo real (CoinGecko)." },
        ],
      },
      {
        id: "heatmap",
        title: "Heatmap + Calendário",
        plano: "Grátis",
        oQueE: "Duas ferramentas visuais numa página: um mapa de calor do mercado (quadradinhos coloridos por tamanho e variação) e um calendário econômico com os eventos macro que mexem o cripto.",
        comoUsar: [
          "No heatmap (Coin360), quadrados maiores são moedas maiores; verde subindo, vermelho caindo — bate o olho e sente o dia.",
          "No calendário, veja os próximos eventos de alto impacto (FOMC, CPI, NFP, PIB).",
          "Use o calendário pra evitar abrir operação em cima de um anúncio importante, que costuma dar movimento brusco.",
        ],
        metricas: [
          { nome: "Heatmap de Market Cap", oQueMede: "Visão geral do mercado: tamanho do quadrado = tamanho da moeda; cor = quanto subiu ou caiu." },
          { nome: "Calendário Econômico", oQueMede: "Agenda de eventos macro (juros, inflação, emprego) que costumam mover o preço do Bitcoin e das altcoins." },
        ],
      },
      {
        id: "on-chain",
        title: "Dados On-Chain",
        plano: "Grátis",
        oQueE: "Painel com indicadores 'on-chain' do Bitcoin (dados de dentro da própria rede) que ajudam a saber em que fase do ciclo o mercado está: fundo, meio ou topo. Cada indicador vem com um veredito mastigado (fundo, acumular, cautela ou topo).",
        comoUsar: [
          "Leia o cartão de cada métrica: a área verde é lucro da rede, a vermelha é prejuízo, e a linha 'base' é o equilíbrio.",
          "Olhe o selo à direita (COMPRA/FUNDO, ACUMULAR, NEUTRO, CAUTELA, VENDA/TOPO) pra ter a leitura pronta.",
          "Use como bússola de longo prazo, não pra entrada de curto prazo.",
          "As outras abas (DeFi, Whale, Rede, ETFs) ainda estão 'em breve'; hoje funciona a aba Bitcoin On-Chain.",
        ],
        metricas: [
          { nome: "MVRV — Long-Term Holders", oQueMede: "Lucro/prejuízo das mãos fortes (moedas paradas +155 dias). Quando vendem em massa marca topo; quando seguram no prejuízo marca fundo." },
          { nome: "MVRV Ratio", oQueMede: "Compara o preço com o custo médio da rede toda. Abaixo de 1, o mercado inteiro está no prejuízo — costuma ser fundo." },
          { nome: "SOPR", oQueMede: "Mostra se as moedas movimentadas hoje foram vendidas com lucro (acima de 1) ou prejuízo (abaixo de 1)." },
          { nome: "NUPL", oQueMede: "Lucro/prejuízo não realizado de toda a rede, do medo (negativo) à euforia (acima de 0,75). Mapeia a psicologia do mercado." },
          { nome: "MVRV Z-Score", oQueMede: "Versão ajustada do MVRV. Valores negativos marcaram todos os fundos históricos; acima de 7, todos os topos." },
        ],
      },
      {
        id: "tradingview",
        title: "TradingView Pro",
        plano: "Grátis",
        oQueE: "Um gráfico profissional do TradingView embutido, com seleção de ativos, tempos gráficos, indicadores prontos e ferramentas de desenho. Serve pra fazer sua própria análise técnica.",
        comoUsar: [
          "Escolha o ativo no seletor (BTC, ETH, SOL, índices como DXY, S&P 500, dominância BTC etc.).",
          "Troque o tempo gráfico (de 1m a 1 semana) conforme o tipo de operação.",
          "Clique num preset de indicadores: 'Setup Padrão' (RSI+MACD), 'Price Action' (Bollinger+Volume) ou 'On-Chain Flow'.",
          "Alterne entre 1 gráfico ou 2 lado a lado pra comparar ativos; ligue/desligue a barra de desenho.",
          "Mude o estilo do gráfico entre Candle, Heikin Ashi e Linha.",
        ],
        metricas: [],
      },
      {
        id: "charts",
        title: "Painel de Gráficos",
        plano: "Grátis",
        oQueE: "Uma grade com 6 gráficos estratégicos ao vivo (Dólar/DXY, Bitcoin, Ethereum, S&P 500, NASDAQ e TOTAL2) pra você acompanhar o mercado cripto e o tradicional na mesma tela.",
        comoUsar: [
          "No modo 'Grade' você vê os 6 gráficos de uma vez pra ter a visão macro.",
          "Clique num gráfico (ou use o modo 'Foco') pra ampliar um ativo só.",
          "Compare cripto com DXY e índices de ações — quando o dólar sobe forte, o cripto costuma sofrer.",
        ],
        metricas: [],
      },
      {
        id: "orderbook",
        title: "Livro de Ordens",
        plano: "Grátis",
        oQueE: "Um rastreador de baleias: mostra as grandes ordens de compra e venda paradas no livro da Binance (spot), em tempo real. Serve pra ver onde estão as 'paredes' de dinheiro grande.",
        comoUsar: [
          "Escolha o ativo (BTC, ETH, SOL...) e o tempo gráfico no topo do gráfico de profundidade.",
          "No painel da direita, ordens verdes (BID) são compra e vermelhas (ASK) são venda; a barra maior é a ordem mais grande.",
          "Passe o mouse numa ordem pra ver preço, valor total, distância do preço atual e há quanto tempo ela está no livro.",
          "Paredes de compra funcionam como suporte; paredes de venda, como resistência (bons alvos).",
        ],
        metricas: [
          { nome: "Total Bids / Total Asks", oQueMede: "Soma em dólar das grandes ordens de compra e de venda ativas no livro." },
          { nome: "Bid / Ask Ratio", oQueMede: "Divisão entre compra e venda. Acima de 1 = mais pressão compradora; abaixo de 1 = mais pressão vendedora." },
          { nome: "Spot Price", oQueMede: "Preço atual à vista do ativo e quantas grandes ordens estão sendo monitoradas." },
          { nome: "Idade da ordem", oQueMede: "Há quanto tempo aquela parede está parada no livro; quanto mais velha, mais respeitada pelo mercado." },
        ],
      },
      {
        id: "liquidity",
        title: "Mapa de Liquidez",
        plano: "Grátis",
        oQueE: "Mostra onde as posições alavancadas podem estourar (zonas de liquidação) por alavancagem, mais as liquidações que estão acontecendo ao vivo e um mini relatório mastigado. É a caça às 'paredes de liquidez' que atraem o preço.",
        comoUsar: [
          "Escolha o ativo nos botões (BTC, ETH, SOL, BNB, XRP, DOGE).",
          "Na escada 'Zonas de Liquidação', a parede de baixo (longs) é suporte e a de cima (shorts) é resistência — são cálculos por alavancagem, não certezas.",
          "Leia o 'Mini Relatório' pra receber a interpretação pronta do funding, long/short e liquidações.",
          "Veja o heatmap nativo (liquidações que de fato ocorreram) e, embaixo, o mapa completo da CoinGlass.",
        ],
        metricas: [
          { nome: "Funding", oQueMede: "Taxa que longs e shorts pagam entre si nos futuros. Positivo alto = excesso de compradores alavancados; negativo = excesso de vendedores." },
          { nome: "Long/Short (contas)", oQueMede: "Proporção de contas apostando na alta (long) versus na baixa (short)." },
          { nome: "Open Interest", oQueMede: "Total de dinheiro em contratos futuros abertos naquele ativo — mede o quanto de alavancagem existe no mercado." },
          { nome: "Longs Liq / Shorts Liq", oQueMede: "Quanto de posições compradas e vendidas foi liquidado ao vivo na sessão (Binance Futures)." },
          { nome: "Zonas de Liquidação (por alavancagem)", oQueMede: "Estimativa de em que preço cada alavancagem (ex.: 10x, 25x, 50x) seria estourada acima e abaixo do preço atual." },
        ],
      },
      {
        id: "leverage",
        title: "Simulador de Risco",
        plano: "Grátis",
        oQueE: "Uma calculadora de alavancagem: você coloca seu capital e o preço de entrada e vê, numa matriz, quanto ganharia e quando seria liquidado em cada alavancagem (de 1x a 100x). Serve pra entender o risco antes de operar.",
        comoUsar: [
          "Digite o capital (margem) e o preço de entrada (ou use o botão pra puxar o preço do BTC).",
          "Escolha o lado: BULL (long) ou BEAR (short).",
          "Leia a matriz: as colunas são as alavancagens e as linhas são movimentos de preço; cada célula mostra lucro, PnL% e o selo de risco (Seguro, Alto, Crítico, Liquidado).",
          "Repare na linha 'Liq': o preço em que sua posição estoura. Quanto maior a alavancagem, mais perto ela fica.",
        ],
        metricas: [
          { nome: "PnL / Lucro estimado", oQueMede: "Quanto você ganharia em dólar e em % para cada combinação de movimento de preço e alavancagem." },
          { nome: "Status de risco", oQueMede: "Selo que traduz o perigo: Seguro, Risco Alto, Risco Crítico ou Liquidado, conforme o movimento se aproxima da margem." },
          { nome: "Preço de liquidação (Liq)", oQueMede: "O preço estimado em que a posição é estourada; alavancagem acima de 20x liquida com menos de 5% de movimento contra." },
        ],
      },
    ],
  },
  {
    id: "filtros-sinais",
    title: "Filtros & Sinais",
    items: [
      {
        id: "bot-swing",
        title: "Bot Swing Trade",
        plano: "Pro",
        oQueE: "Um robô que varre todas as moedas da Binance (spot USDT) no tempo gráfico de 4h procurando o 'Setup Compra'. Quando acha, já entrega a região de compra, os alvos (parciais) e o stop.",
        comoUsar: [
          "Clique em 'Rodar Análise' e espere a barra de progresso varrer os pares.",
          "Veja os 'Sinais de Compra · Setup Cheio' (as 4 condições bateram) — cada cartão traz entrada, 2 parciais, saída total e stop.",
          "Confira os 'Em Formação' (3 de 4 condições): faltou 1 item; coloque na watchlist e acompanhe.",
          "Clique num sinal pra abrir a análise completa da moeda. Você mesmo executa na corretora (o bot não opera sozinho ainda).",
        ],
        metricas: [
          { nome: "RSI(14) entre 40 e 57", oQueMede: "Momentum saindo do fundo sem estar esticado — filtro de entrada saudável." },
          { nome: "EMA(80) a ±2%", oQueMede: "Preço colado na média de tendência de 80 períodos, funcionando como suporte dinâmico." },
          { nome: "Volume vs SMA20", oQueMede: "Interesse crescente (de 0% a +500% acima da média) sem clímax exagerado." },
          { nome: "Gatilho de rompimento", oQueMede: "A máxima da barra atual supera a máxima anterior, confirmando força na barra que fecha." },
          { nome: "Região de compra / Parciais / Stop / Risco %", oQueMede: "O plano pronto: onde comprar, onde realizar lucro em 1R e 2R, onde sair e quanto do capital arrisca." },
        ],
      },
      {
        id: "bot-scalp",
        title: "Bot Scalping",
        plano: "Pro",
        oQueE: "Um radar de operações rápidas: varre o mercado atrás de moedas entrando em sobrevenda extrema, cruzando os tempos gráficos Diário, 4h, 1h e 5m, com o contexto do Bitcoin e das altcoins.",
        comoUsar: [
          "Clique em 'Rodar Radar' e aguarde a varredura.",
          "Veja o 'Contexto do Mercado': se BTC e altcoins estão sobrevendidos nas baixas temporalidades, o repique é mais provável.",
          "Nos cartões, quanto mais timeframes sobrevendidos (ex.: 4/4), mais forte; cartão rosa = sobrevenda 'Extrema'.",
          "Cada cartão traz entrada, alvo rápido e stop. É pra operação de curtíssimo prazo — respeite o stop.",
        ],
        metricas: [
          { nome: "RSI por timeframe (1D/4h/1h/5m)", oQueMede: "Força da moeda em cada tempo gráfico; ciano = sobrevendido, rosa = extremo, vermelho = sobrecomprado." },
          { nome: "Contagem de TFs sobrevendidos", oQueMede: "Quantos dos 4 tempos gráficos estão sobrevendidos ao mesmo tempo — mais confluência, sinal mais forte." },
          { nome: "Contexto BTC + TOTAL2", oQueMede: "RSI do Bitcoin e uma média das grandes altcoins (proxy do índice TOTAL2), pra medir o clima geral do mercado." },
          { nome: "Entrada / Alvo / Stop", oQueMede: "O plano rápido de scalp: onde entrar, o alvo curto pra realizar e o ponto de proteção." },
        ],
      },
      {
        id: "central",
        title: "Central de Sinais (MTF RSI)",
        plano: "Pro",
        oQueE: "Painel que separa em duas colunas o que está em zona de compra e o que está em zona de venda, usando confluência de RSI em vários tempos gráficos (Diário, 4h, 1h) com gatilho no 5m.",
        comoUsar: [
          "Ajuste a 'Sensibilidade': Estrito (20/80) dá poucos sinais mas mais confiáveis; Amplo (30/70) capta mais setups em formação.",
          "Na coluna verde (Compras) e vermelha (Vendas), cada cartão mostra o RSI de cada tempo gráfico e uma nota de força.",
          "Um selo 'Gatilho' aparece quando o 5m confirma o movimento — é o disparo da entrada.",
          "Se estiver vazio, afrouxe a sensibilidade ou espere o gatilho disparar.",
        ],
        metricas: [
          { nome: "Score /6", oQueMede: "Pontuação de confluência somando os pesos dos tempos gráficos (Diário vale 3, 4h vale 2, 1h vale 1)." },
          { nome: "Força (Forte/Médio/Fraco)", oQueMede: "Qualidade do sinal com base em quantas temporalidades estão alinhadas." },
          { nome: "RSI por leg (D/4h/1h/5m)", oQueMede: "O RSI em cada tempo gráfico; a célula acende quando aquele tempo está alinhado com o sinal." },
          { nome: "Gatilho 5m", oQueMede: "Confirmação de curtíssimo prazo que 'dispara' o setup depois que as temporalidades maiores já estão alinhadas." },
        ],
      },
      {
        id: "buy-signals",
        title: "Sinais de Compra",
        plano: "Pro",
        oQueE: "Uma lista filtrada só com as moedas que o motor de sinais pontuou como compra de alta confluência (score maior ou igual a 5), ordenadas da mais forte pra menos forte.",
        comoUsar: [
          "Abra a tela e veja a tabela já filtrada com os sinais de alta probabilidade.",
          "Leia os 3 cartões de orientação: lógica de entrada, cruzar com o Mapa de Liquidez e gestão de risco.",
          "Regra de ouro sugerida: stop abaixo da mínima do candle de 4h e risco de 1 a 2% do capital por operação.",
          "Clique numa moeda pra abrir a análise detalhada antes de decidir.",
        ],
        metricas: [
          { nome: "Score ≥ 5", oQueMede: "Nota do motor combinando RSI sobrevendido, volume crescente, médias e sentimento; 5 ou mais indica confluência de compra." },
          { nome: "Confluência", oQueMede: "Nível de alinhamento dos fatores (Baixa/Média/Alta) — quanto maior, mais robusto o sinal." },
        ],
      },
      {
        id: "sell-signals",
        title: "Sinais de Venda",
        plano: "Pro",
        oQueE: "O espelho da tela de compra: lista as moedas que o motor marcou como exaustão/distribuição (score menor ou igual a 0), da mais fraca pra menos fraca. Serve pra proteger lucro ou evitar comprar no topo.",
        comoUsar: [
          "Veja a tabela filtrada com os alvos de venda/exaustão.",
          "Leia os cartões: lógica de distribuição, sinais de reversão no Mapa de Liquidez e ideia de take profit.",
          "Use pra saber a hora de realizar lucro parcial ou ficar de fora, não necessariamente pra vender a descoberto.",
          "Clique numa moeda pra confirmar na análise completa.",
        ],
        metricas: [
          { nome: "Score ≤ 0", oQueMede: "Nota do motor puxada pra baixo por RSI sobrecomprado, ganância e perda de tendência — indica exaustão compradora." },
        ],
      },
      {
        id: "rsi",
        title: "Exaustão RSI",
        plano: "Grátis",
        oQueE: "Um mapa de calor (heatmap) do RSI das principais moedas em vários tempos gráficos (de 5m a 1D). De um olhar você acha moedas esticadas demais pra baixo (fundo) ou pra cima (topo).",
        comoUsar: [
          "Leia por cores: ciano brilhante = sobrevenda extrema (possível fundo); vermelho = euforia (possível topo).",
          "Procure moedas com uma coluna toda ciano (alinhamento vertical) — é o chamado 'Setup Master Buy'.",
          "Cruze as temporalidades: quanto mais tempos gráficos alinhados na mesma cor, mais forte a leitura.",
          "É uma tela de triagem: achou algo interessante, confirme na análise da moeda.",
        ],
        metricas: [
          { nome: "RSI multi-timeframe", oQueMede: "Índice de Força Relativa da moeda em cada tempo gráfico (5m até 1D), mostrado como quadradinho colorido." },
          { nome: "Escala de cor", oQueMede: "Ciano = sobrevendido/exausto pra baixo; vermelho = sobrecomprado/exausto pra cima; tons neutros no meio." },
        ],
      },
      {
        id: "short-term",
        title: "Setup Curto Prazo (Intraday)",
        plano: "Pro",
        oQueE: "Filtro focado em operações rápidas (scalp/day trade de 1h a 4h). Busca pullbacks (recuos) dentro de tendências usando as médias 10, 20 e 80 e confluência de RSI nos tempos gráficos baixos.",
        comoUsar: [
          "Abra a tela e veja a lista de oportunidades intraday já rastreadas nas 50+ maiores moedas.",
          "A lógica busca preço recuando pra zona entre a MA10 e a MA20 dentro de uma tendência de alta.",
          "Proteção sugerida: stop logo abaixo da MA80; se o preço perder a MA80 no intraday, o setup é invalidado.",
          "Clique numa moeda pra ver a análise completa antes de operar.",
        ],
        metricas: [
          { nome: "Confiança (0–100)", oQueMede: "Nota de quão bom é o setup de curto prazo somando pullback nas médias, RSI e MACD; só entra na lista acima de 55." },
          { nome: "Médias 10 / 20 / 80", oQueMede: "Médias móveis usadas pra achar a zona de recuo (10 e 20) e a linha de invalidação da tendência (80)." },
          { nome: "RSI 15m", oQueMede: "Confirmação de exaustão de curtíssimo prazo pra timing da reversão rápida." },
        ],
      },
      {
        id: "long-term",
        title: "Setup Longo Prazo (Swing)",
        plano: "Pro",
        oQueE: "Filtro para operações de semanas (swing/position). Procura moedas grandes que corrigiram pra zonas de suporte importantes (médias 50, 100, 200) durante uma tendência macro de alta.",
        comoUsar: [
          "Veja a lista de ativos em zona de compra macro (pode ficar vazia quando o mercado não corrigiu).",
          "A ideia central: preço descansando na região da MA100–MA200 do diário, com RSI diário baixo.",
          "Confirmação extra: retorno ao 'Golden Pocket' (retração de Fibonacci 0.618) — paciência é a chave aqui.",
          "Clique num ativo pra abrir a análise completa.",
        ],
        metricas: [
          { nome: "Confiança (0–100)", oQueMede: "Nota do setup de longo prazo combinando suporte nas médias, RSI diário e Fibonacci; entra na lista acima de 65." },
          { nome: "Médias 50 / 100 / 200", oQueMede: "Médias móveis de longo prazo que definem a tendência macro e a zona de suporte institucional." },
          { nome: "Golden Pocket (Fib 0.618)", oQueMede: "Zona de retração de Fibonacci onde grandes players costumam recomprar." },
        ],
      },
    ],
  },
  {
    id: "ferramentas",
    title: "Ferramentas",
    items: [
      {
        id: "alerts",
        title: "Alertas",
        plano: "Grátis",
        oQueE: "Onde você cria regras personalizadas pra ser avisado quando uma moeda atingir uma condição (por exemplo, score acima de 8 ou RSI abaixo de 30). Você monta, liga/desliga e apaga cada alerta.",
        comoUsar: [
          "Clique em 'Novo Alerta' e escolha a moeda (ou 'any' pra qualquer moeda).",
          "Escolha o indicador (Score, RSI, Variação 24h ou Volume/MCap), a direção (≥ ou ≤) e o valor.",
          "Defina se é sinal de Compra ou Venda e salve.",
          "Use o botão de ligar/desligar pra pausar um alerta e a lixeira pra remover.",
        ],
        metricas: [
          { nome: "Score", oQueMede: "Nota do motor de sinais da moeda — dispara quando cruza o valor que você definir." },
          { nome: "RSI", oQueMede: "Força/exaustão da moeda; útil pra avisar sobrevenda (baixo) ou sobrecompra (alto)." },
          { nome: "Variação 24h (%)", oQueMede: "Quanto a moeda subiu ou caiu no dia." },
          { nome: "Volume/MCap (%)", oQueMede: "Volume negociado em relação ao tamanho da moeda — mede o interesse/liquidez do momento." },
        ],
      },
      {
        id: "news",
        title: "Terminal Notícias",
        plano: "Grátis",
        oQueE: "Um feed de notícias de cripto (via CryptoPanic) ao lado de um calendário econômico. Serve pra você não ser pego de surpresa por notícia.",
        comoUsar: [
          "Role o feed pra ver as notícias mais recentes do mercado, atualizadas ao vivo.",
          "As etiquetas mostram as moedas citadas na notícia.",
          "Clique no título pra abrir a notícia completa em nova aba.",
          "Do lado direito, acompanhe o calendário econômico de alto impacto (FOMC, CPI, NFP).",
        ],
        metricas: [
          { nome: "Fonte e horário", oQueMede: "De onde veio a notícia e há quanto tempo saiu." },
          { nome: "Moedas citadas", oQueMede: "Tickers detectados no título (BTC, ETH...) pra você filtrar o que te interessa." },
        ],
      },
      {
        id: "community",
        title: "Mesa de Operações",
        plano: "Grátis",
        oQueE: "Um chat ao vivo entre os membros da plataforma, com um feed de setups em destaque ao lado. É o espaço pra trocar ideia, compartilhar operações e mandar prints.",
        comoUsar: [
          "Escreva no campo embaixo e envie sua mensagem pra todos os membros.",
          "Use o botão de imagem pra anexar um print de gráfico ou setup.",
          "Acompanhe o feed 'Setups em Destaque' na lateral (ou na aba Setups no celular).",
          "Você pode apagar suas próprias mensagens; é preciso estar logado pra participar.",
        ],
        metricas: [],
      },
      {
        id: "profile",
        title: "Perfil Analista",
        plano: "Grátis",
        oQueE: "Sua página de perfil, com seu avatar, e-mail, rank e estatísticas de uso (alertas ativos e setups compartilhados). Também tem abas pra ver seus alertas e setups.",
        comoUsar: [
          "Veja no topo seu nome, e-mail, data de entrada e o rank (Bronze, Silver ou Gold).",
          "Confira os cartões de estatística: alertas ativos, setups compartilhados e precisão de sinal.",
          "Use as abas 'Meus Alertas', 'Meus Setups' e 'Configurações' pra acompanhar sua atividade.",
        ],
        metricas: [
          { nome: "Rank", oQueMede: "Nível do usuário (Bronze/Silver/Gold) que sobe conforme você compartilha mais setups." },
          { nome: "Alertas Ativos / Setups Compartilhados", oQueMede: "Contadores da sua atividade na plataforma." },
          { nome: "Sinal de Precisão", oQueMede: "Percentual exibido de acerto associado ao perfil." },
        ],
      },
    ],
  },
];
