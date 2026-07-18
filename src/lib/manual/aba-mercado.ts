import type { AbaManual } from "./types";

/**
 * Aba "Mercado ao Vivo" — páginas de leitura de mercado em tempo real:
 * Terminal de Comando, Market, Heatmap + Calendário, TradingView Pro,
 * Painel de Gráficos, Moeda em Detalhe e Terminal de Notícias.
 */
export const ABA_MERCADO: AbaManual = {
  id: "mercado",
  titulo: "Mercado ao Vivo",
  descricao:
    "As telas que mostram o mercado agora: preços, termômetros de sentimento, gráficos profissionais, mapa de calor, detalhe de cada moeda e notícias.",
  paginas: [
    // ─────────────────────────────────────────────
    // TERMINAL DE COMANDO (/dashboard)
    // ─────────────────────────────────────────────
    {
      id: "terminal",
      titulo: "Terminal de Comando",
      rota: "/dashboard",
      plano: "Grátis",
      resumo:
        "É a tela inicial do painel. Junta num lugar só: liquidações ao vivo, mercados internacionais, gráfico do Bitcoin, 6 termômetros de sentimento, planos de trade prontos, visão geral do mercado, bolhas de cripto, melhores oportunidades do dia e notícias.",
      comoUsar: [
        "Comece pelo topo: a barra vermelha fina mostra as liquidações acontecendo ao vivo (traders alavancados sendo estourados).",
        "Se aparecer um banner colorido logo abaixo, leia com atenção. Ele só surge em Medo Extremo ou Ganância Extrema.",
        "Olhe a faixa de mercados internacionais (S&P 500, Ouro, Dólar...) pra sentir o clima fora da cripto.",
        "Confira os 6 Termômetros ao lado do gráfico do BTC. Eles resumem o humor do mercado em segundos.",
        "Desça pros 'Planos de Trade Prontos': cada cartão já traz entrada, alvos e stop calculados. É estudo, não ordem.",
        "Role por 'Visão de Mercado', 'Crypto Bubbles' e 'Melhores Oportunidades do Dia' pra ver quem sobe e quem cai.",
        "Clique em qualquer moeda pra abrir a análise completa dela. As notícias ficam no fim da página.",
      ],
      indicadores: [
        {
          nome: "Ticker de Liquidações (barra do topo)",
          oQueE:
            "Faixa que rola no topo mostrando liquidações ao vivo: posições alavancadas (dinheiro emprestado) fechadas à força quando o preço vai contra o trader.",
          comoLer:
            "Cada item mostra a moeda, o lado (LONG = aposta na alta, SHORT = aposta na baixa) e o valor em milhares de dólares. Vermelho = long estourado. Verde = short estourado.",
          sinalCompra:
            "Chuva de LONGS liquidados costuma marcar queda exagerada. Pode indicar fundo se aproximando.",
          sinalVenda:
            "Chuva de SHORTS liquidados costuma marcar alta esticada. Pode indicar topo se aproximando.",
          cuidado:
            "Liquidação é consequência, não previsão. Use como termômetro de pânico/euforia, nunca como gatilho sozinho.",
        },
        {
          nome: "Banner Macro (Medo/Ganância Extrema)",
          oQueE:
            "Aviso grande que só aparece quando o Fear & Greed cripto está em extremo: 25 ou menos (Medo Extremo) ou 80 ou mais (Ganância Extrema).",
          comoLer:
            "Banner azul-ciano = Medo Extremo, zona onde historicamente grandes compradores acumulam. Banner vermelho = Ganância Extrema, zona onde grandes players costumam realizar lucro.",
          sinalCompra: "Medo Extremo (F&G até 25) historicamente marcou boas regiões de acumulação gradual.",
          sinalVenda: "Ganância Extrema (F&G 80+) sugere reduzir alavancagem e considerar realizar parciais.",
          cuidado:
            "Estatística passada não garante resultado futuro. O medo pode ficar mais extremo antes de virar. Nada aqui é promessa de ganho.",
        },
        {
          nome: "Faixa de Mercados Internacionais (TradFi)",
          oQueE:
            "Tira com cotações ao vivo do mercado tradicional: S&P 500, NASDAQ 100, VIX, Ouro, Brent (petróleo), DXY (índice do dólar), USD/BRL, além de BTC e ETH.",
          comoLer:
            "Verde subindo, vermelho caindo. Bolsas dos EUA subindo = apetite a risco (bom pra cripto). DXY (dólar) forte e VIX (índice do medo) acima de 20 = ambiente hostil pra cripto.",
          cuidado:
            "A correlação com as bolsas muda com o tempo. Em dias de crise ela aumenta muito; em altseason ela afrouxa.",
        },
        {
          nome: "Gráfico BTC/USDT ao vivo",
          oQueE:
            "Gráfico profissional do TradingView com o Bitcoin em tempo real (candles de 1 hora, dados da Binance), com Volume e RSI já plotados embaixo. No cabeçalho aparecem o preço atual e a variação de 24h.",
          comoLer:
            "Variação em verde = BTC subiu nas últimas 24h; em rosa = caiu. No RSI do rodapé do gráfico: abaixo de 30 = sobrevendido (caiu rápido demais), acima de 70 = sobrecomprado (subiu rápido demais).",
          cuidado:
            "O BTC dita o ritmo de quase todas as moedas. Antes de operar qualquer altcoin, olhe primeiro o que o BTC está fazendo.",
        },
        {
          nome: "Termômetro F&G Cripto (Fear & Greed)",
          oQueE:
            "Medidor de 0 a 100 da emoção do mercado cripto, calculado com volatilidade, volume, dominância e buscas. É o primeiro dos 6 termômetros.",
          comoLer:
            "0–25 = Medo Extremo. 26–45 = Medo. 46–54 = Neutro. 55–74 = Ganância. 75–100 = Ganância Extrema. A bolinha branca marca onde estamos no arco colorido.",
          sinalCompra: "Abaixo de 30 (medo) costuma ser região melhor pra estudar compras aos poucos.",
          sinalVenda: "Acima de 70 (ganância) liga o alerta de topo. Hora de pensar em proteger lucro.",
          cuidado:
            "O índice pode ficar semanas em extremo. Ele mostra o clima, não o dia exato da virada.",
        },
        {
          nome: "Termômetro F&G Tradicional",
          oQueE:
            "O mesmo medidor de medo e ganância, mas do mercado tradicional (bolsa dos EUA), calculado pela CNN.",
          comoLer:
            "Mesma escala de 0 a 100. Compare com o F&G Cripto: quando os dois estão em medo extremo juntos, o pessimismo é geral; quando divergem, um mercado pode puxar o outro.",
          sinalCompra: "Medo extremo nas bolsas + medo extremo na cripto = pânico generalizado, zona historicamente de acumulação.",
          sinalVenda: "Ganância nos dois mercados ao mesmo tempo = euforia geral, mais risco de correção conjunta.",
          cuidado: "Cripto costuma seguir as bolsas, mas com atraso e exagero (cai mais e sobe mais).",
        },
        {
          nome: "Termômetro Altseason",
          oQueE:
            "Mede quantas altcoins (moedas que não são o Bitcoin) do top 50 estão rendendo mais que o BTC nos últimos 30 dias. Embaixo do painel aparece a contagem exata (ex.: 12/46 altcoins > BTC em 30d).",
          comoLer:
            "0–25 = Bitcoin Season (dinheiro concentrado no BTC). 26–74 = Mercado Neutro. 75–100 = Altcoin Season (altcoins bombando).",
          sinalCompra:
            "Índice subindo de baixo pra cima pode indicar início de rotação do BTC pras altcoins.",
          sinalVenda:
            "Altseason no extremo (perto de 100) costuma ser fase final de ciclo — euforia em moedas pequenas.",
          cuidado:
            "Em queda geral do mercado, altcoins caem mais que o BTC. Altseason só faz sentido em mercado saudável.",
        },
        {
          nome: "Termômetro RSI BTC",
          oQueE:
            "O RSI (Índice de Força Relativa) do Bitcoin: um medidor de 0 a 100 que mostra se o BTC subiu ou caiu rápido demais. Calculado sobre os preços dos últimos 7 dias.",
          comoLer:
            "30 ou menos = Sobrevendido (esticado pra baixo). 70 ou mais = Sobrecomprado (esticado pra cima). Entre eles = Neutro.",
          sinalCompra: "BTC sobrevendido costuma anteceder repique que arrasta o mercado todo pra cima.",
          sinalVenda: "BTC sobrecomprado liga o alerta de correção geral.",
          cuidado:
            "Em tendência forte o RSI pode ficar esticado por muito tempo. Sobrecomprado não é ordem de venda automática.",
        },
        {
          nome: "Termômetro Dominância BTC",
          oQueE:
            "Fatia (%) que o Bitcoin representa do valor total do mercado cripto.",
          comoLer:
            "Dominância subindo = capital buscando segurança no BTC (altcoins sofrem). Caindo = capital migrando pra altcoins (mais apetite a risco).",
          cuidado:
            "Dominância caindo em mercado de queda significa que TUDO está caindo e as alts caem mais. Leia junto com a direção do preço.",
        },
        {
          nome: "Termômetro Amplitude",
          oQueE:
            "Percentual das 100 maiores moedas que estão em alta nas últimas 24 horas. Mede se a alta (ou queda) é generalizada ou concentrada.",
          comoLer:
            "60% ou mais = mercado forte (a maioria sobe junto). 35% ou menos = mercado fraco (poucos sustentando). No meio = misto.",
          sinalCompra: "Amplitude saindo de níveis muito baixos pode indicar virada de fôlego geral.",
          sinalVenda:
            "Índices subindo com amplitude fraca = alta sustentada por poucas moedas. Movimento frágil.",
          cuidado: "Amplitude é foto de 24h. Um dia não faz tendência.",
        },
        {
          nome: "Planos de Trade Prontos",
          oQueE:
            "Cartões com planos mastigados gerados pelo motor da plataforma: direção (COMPRA ou VENDA), Entrada, Alvo 1, Alvo 2, Stop, percentual de risco, relação R:R e o motivo do plano.",
          comoLer:
            "Cartão verde = plano de compra; rosa = plano de venda/realização. 'Confiança' é a nota do motor pra aquele setup. 'R:R' compara quanto se busca ganhar vs. quanto se arrisca (ex.: 2:1 = alvo duas vezes maior que o risco). Leia sempre o 'Por quê' pra entender a lógica.",
          sinalCompra: "Plano de COMPRA com confiança alta e R:R de 2:1 ou mais é o tipo de estudo mais interessante.",
          sinalVenda: "Plano de VENDA sugere região de realizar lucro ou evitar compra, não necessariamente vender a descoberto.",
          cuidado:
            "São planos de estudo automáticos, não recomendação de investimento. Quem decide (e assume o risco) é você. Respeitar o stop é o que separa estudo de prejuízo grande.",
        },
        {
          nome: "Painel Preços & Macro",
          oQueE:
            "Tabela compacta com Bitcoin, Ethereum e Solana (preço e variação 24h), mais três números do mercado inteiro: Market Cap total, Dominância BTC e Volume 24h.",
          comoLer:
            "Market Cap (capitalização) = soma do valor de todas as criptos; crescendo = mercado aquecido. Volume 24h = quanto foi negociado no dia; movimento com volume alto é mais confiável.",
          cuidado: "Volume baixo distorce tudo: preços andam mais por ruído do que por convicção.",
        },
        {
          nome: "Top Movers 24h",
          oQueE:
            "Duas listas lado a lado: as 7 moedas que mais subiram e as 7 que mais caíram nas últimas 24 horas (dentro do top 100).",
          comoLer:
            "Coluna verde = maiores altas; coluna rosa = maiores quedas, cada uma com preço e variação percentual.",
          cuidado:
            "Quem subiu 30% num dia pode devolver rápido. Perseguir topo de mover é um dos erros mais comuns de iniciante.",
        },
        {
          nome: "Tendência & Desempenho",
          oQueE:
            "Tabela com 8 moedas grandes (BTC, ETH, SOL, BNB, XRP, DOGE, ADA, AVAX) mostrando a tendência atual e o desempenho em 5 períodos: 1H, 24H, 7D, 30D e 1A (1 ano).",
          comoLer:
            "Coluna 'Tend.': ALTA (verde), BAIXA (rosa) ou LATERAL (cinza), lida pela posição do preço frente às médias. Nas células de período: verde = subiu, rosa = caiu; cor mais forte = movimento acima de 10%.",
          sinalCompra: "Moeda em tendência de ALTA que recuou no curto prazo (1H/24H vermelho) pode estar dando ponto de entrada.",
          sinalVenda: "Moeda em BAIXA em todos os períodos = evite tentar adivinhar o fundo.",
          cuidado: "Períodos curtos (1H) mudam toda hora. Dê mais peso ao 7D e 30D pra ler tendência.",
        },
        {
          nome: "Sessões Globais",
          oQueE:
            "Linha do tempo mostrando quais praças financeiras do mundo (Sydney, Tóquio, Londres, Nova York) estão abertas agora, em horário de Brasília.",
          comoLer:
            "Cada barra colorida é uma sessão. Onde duas se sobrepõem (ex.: Londres + Nova York, de manhã/tarde no Brasil) há mais dinheiro girando = mais volume e volatilidade.",
          cuidado:
            "Cripto opera 24h, mas fora das sessões grandes a liquidez seca e os movimentos ficam mais erráticos (madrugada é traiçoeira).",
        },
        {
          nome: "Crypto Bubbles",
          oQueE:
            "Caixa com bolhas flutuando: cada bolha é uma das 40 maiores moedas. O tamanho da bolha = tamanho da moeda (market cap). A cor = variação de 24h.",
          comoLer:
            "Verde = subindo, vermelho = caindo; cor mais intensa = movimento mais forte. Bolha brilhando = variação acima de 6% no dia. Clique numa bolha pra abrir a análise da moeda.",
          cuidado:
            "É uma foto do dia, ótima pra bater o olho — mas não conta a história da semana nem do mês.",
        },
        {
          nome: "Melhores Oportunidades do Dia",
          oQueE:
            "Cartões com as moedas mais bem pontuadas pelo motor de sinais da plataforma. Cada cartão mostra RSI, Score, FR (funding rate, a taxa dos alavancados) e uma nota de confiança.",
          comoLer:
            "Score positivo alto puxa pra COMPRA; score negativo puxa pra VENDA. Funding negativo = pessimismo alavancado (pode virar combustível de alta); muito positivo = euforia (risco).",
          cuidado:
            "Oportunidade filtrada por robô ainda precisa da sua análise. Abra a moeda e confirme antes de qualquer decisão.",
        },
        {
          nome: "Oráculo do Dia (Insight)",
          oQueE:
            "Cartão que resume o veredito do motor em 3 estados possíveis: Zona de Oportunidade Institucional, Alerta de Distribuição ou Scanner Institucional Ativo.",
          comoLer:
            "Zona de Oportunidade = Medo Extremo + setup de compra forte (região onde o dinheiro grande costuma acumular). Alerta de Distribuição = Ganância Extrema + setup de venda forte (região onde costumam realizar lucro). Scanner Ativo = estado neutro, sem sinal forte agora.",
          sinalCompra: "Zona de Oportunidade acesa = vale estudar compras com stop curto.",
          sinalVenda: "Alerta de Distribuição aceso = vale estudar proteção de ganhos e redução de posição.",
          cuidado: "Estado neutro é resposta válida: sem sinal claro, ficar de fora também é posição.",
        },
        {
          nome: "Notícias do Mercado (painel)",
          oQueE:
            "Feed com as últimas manchetes de cripto, atualizado sozinho, com fonte, tempo (ex.: 15min atrás) e as moedas citadas.",
          comoLer:
            "Bata o olho nos títulos antes de operar. Notícia forte (hack, regulação, decisão de juros) muda o jogo em minutos.",
          cuidado: "As manchetes vêm de portais internacionais e chegam em inglês.",
        },
      ],
      dicas: [
        "Rotina de 2 minutos: liquidações → banner → termômetros → planos prontos. Só depois pense em operar.",
        "Se os 6 termômetros discordarem entre si, o mercado está indeciso — dias assim pedem posição menor ou nenhuma.",
        "Nada nesta tela é recomendação de investimento. É leitura de mercado pra apoiar a SUA decisão.",
      ],
    },

    // ─────────────────────────────────────────────
    // MARKET (/dashboard/market)
    // ─────────────────────────────────────────────
    {
      id: "market",
      titulo: "Market (Top 100)",
      rota: "/dashboard/market",
      plano: "Grátis",
      resumo:
        "Tabela ao vivo com as 100 maiores moedas do mercado (dados CoinGecko) e um filtro por RSI na lateral. Serve pra garimpar rápido moedas esticadas pra baixo (sobrevendidas) ou pra cima (sobrecompradas).",
      comoUsar: [
        "Use o painel 'Filtro RSI' à esquerda: arraste o controle ou clique num atalho pronto.",
        "Atalhos: 'Sobrevendido (<30)' mostra possíveis fundos; 'Sobrecomprado (>70)' mostra possíveis topos; 'Neutro (30-70)' mostra o resto.",
        "Clique em 'Aplicar Filtro'. O contador no topo mostra quantos ativos passaram no filtro.",
        "Ordene a tabela clicando nos títulos das colunas (Preço, 24h %, Market Cap, Volume, RSI).",
        "Clique em qualquer linha pra abrir a página de detalhe da moeda.",
      ],
      indicadores: [
        {
          nome: "Filtro RSI (painel lateral)",
          oQueE:
            "Controle deslizante de 0 a 100 que filtra a lista pela faixa de RSI, com seletor de timeframe (4H, 12H, 24H) e três atalhos prontos.",
          comoLer:
            "Ajuste mínimo e máximo e aplique. RSI baixo = moeda que caiu rápido demais; RSI alto = que subiu rápido demais.",
          sinalCompra: "Filtrar RSI abaixo de 30 revela candidatas a repique (zonas de sobre-venda).",
          sinalVenda: "Filtrar RSI acima de 70 revela moedas em exaustão compradora (cuidado pra não comprar topo).",
          cuidado:
            "O RSI desta tabela é calculado sobre os preços dos últimos 7 dias. Confirme sempre no gráfico da moeda antes de decidir.",
        },
        {
          nome: "Coluna # (Rank)",
          oQueE: "Posição da moeda no ranking mundial por valor de mercado (1 = Bitcoin).",
          comoLer:
            "Quanto menor o número, maior e mais consolidada a moeda. Rank alto (ex.: 80+) = moeda menor, mais volátil.",
          cuidado: "Moeda pequena sobe mais rápido — e cai mais rápido também.",
        },
        {
          nome: "Coluna Preço",
          oQueE: "Preço atual da moeda em dólares, atualizado ao vivo.",
          comoLer: "Moedas baratas em dólar não são 'mais baratas' de verdade. O que importa é o valor de mercado total, não o preço unitário.",
          cuidado: "Achar que 'moeda de centavos vai virar 1 dólar' é uma das armadilhas mais clássicas do mercado.",
        },
        {
          nome: "Coluna 24h %",
          oQueE: "Quanto a moeda subiu ou caiu nas últimas 24 horas.",
          comoLer: "Verde-água com '+' = alta; vermelho com '-' = queda.",
          cuidado: "Variação de um dia é ruído. Olhe também o mini-gráfico de 7 dias na última coluna.",
        },
        {
          nome: "Coluna Market Cap",
          oQueE:
            "Valor de mercado da moeda: preço multiplicado pelas moedas em circulação. Aparece abreviado (B = bilhões, M = milhões).",
          comoLer: "É o 'tamanho' real da moeda e o critério do ranking.",
          cuidado: "Market cap alto não é garantia de segurança — mas market cap minúsculo é garantia de volatilidade.",
        },
        {
          nome: "Coluna Volume",
          oQueE: "Quanto foi negociado da moeda nas últimas 24 horas, em dólares.",
          comoLer:
            "Volume alto = fácil entrar e sair (liquidez). Movimento de preço COM volume = confiável; sem volume = suspeito.",
          cuidado: "Moeda com volume baixo pode travar você numa posição sem comprador do outro lado.",
        },
        {
          nome: "Coluna RSI",
          oQueE:
            "O RSI de cada moeda (0 a 100), num selo colorido, calculado sobre os últimos 7 dias de preço.",
          comoLer:
            "Selo verde-água = 30 ou menos (sobrevendido). Selo vermelho = 70 ou mais (sobrecomprado). Cinza = neutro.",
          sinalCompra: "RSI baixo + volume alto + tendência de alta intacta = combinação que merece estudo.",
          sinalVenda: "RSI 70+ depois de alta longa = risco de correção.",
          cuidado: "RSI sozinho erra bastante. É filtro de triagem, não sinal de entrada.",
        },
        {
          nome: "Coluna Tend. (Tendência)",
          oQueE:
            "Selo que resume a direção predominante da moeda: ALTA, BAIXA ou LATERAL, lida pela posição do preço frente às médias móveis.",
          comoLer:
            "ALTA favorece estudar compras em recuo. BAIXA favorece cautela. LATERAL = sem direção, evite forçar trade.",
          cuidado: "Operar contra a tendência é o jeito mais rápido de acumular stops.",
        },
        {
          nome: "Coluna MA 10/20/80 (Médias Móveis)",
          oQueE:
            "Os três preços médios da moeda em 10, 20 e 80 períodos (calculados no gráfico de 7 dias). Média móvel = preço médio suavizado, que funciona como 'trilho' da tendência.",
          comoLer:
            "Preço acima das três médias = tendência de alta saudável. Abaixo das três = baixa. Preço entre elas = disputa.",
          sinalCompra: "Recuo do preço até a região da MA10–MA20 numa tendência de alta é zona clássica de entrada.",
          sinalVenda: "Perder a MA80 costuma invalidar a tendência de curto prazo.",
          cuidado: "Médias atrasam: confirmam tendência, não preveem reversão.",
        },
        {
          nome: "Coluna Sinal",
          oQueE:
            "Selo automático baseado no RSI: COMPRA (RSI 30 ou menos), VENDA (RSI 70 ou mais) ou NEUTRO.",
          comoLer:
            "É um atalho visual do estado do RSI, não uma recomendação. COMPRA = moeda esticada pra baixo; VENDA = esticada pra cima.",
          cuidado:
            "Um selo 'COMPRA' numa moeda em tendência de baixa forte pode ser faca caindo. Cruze com a coluna Tend.",
        },
        {
          nome: "Coluna 7D (mini-gráfico)",
          oQueE: "Linha em miniatura (sparkline) com o desenho do preço nos últimos 7 dias.",
          comoLer: "Verde = semana positiva; vermelho = negativa. Mostra o 'formato' do movimento num relance.",
          cuidado: "É miniatura sem escala — pra análise de verdade, abra o gráfico completo.",
        },
      ],
      dicas: [
        "Combinação de triagem: RSI < 30 + Tend. ALTA + volume alto. Poucas moedas passam, e são as que valem estudo.",
        "Ordene por '24h %' decrescente pra ver os foguetes do dia — e desconfie deles.",
      ],
    },

    // ─────────────────────────────────────────────
    // HEATMAP + CALENDÁRIO (/dashboard/heatmap)
    // ─────────────────────────────────────────────
    {
      id: "heatmap",
      titulo: "Heatmap + Calendário",
      rota: "/dashboard/heatmap",
      plano: "Grátis",
      resumo:
        "Duas ferramentas visuais na mesma página: um mapa de calor do mercado inteiro (quadradinhos coloridos, via Coin360) e um calendário econômico global (via TradingView) com os eventos macro que mexem com a cripto.",
      comoUsar: [
        "Bata o olho no heatmap: quadrados grandes = moedas grandes; verde = subindo, vermelho = caindo.",
        "Um mar de vermelho ou de verde te diz o humor do dia em 2 segundos.",
        "Desça pro calendário e veja os próximos eventos: decisão de juros (FOMC), inflação (CPI), emprego (NFP), PIB.",
        "Antes de abrir qualquer operação, confira se não há evento de alto impacto nas próximas horas.",
      ],
      indicadores: [
        {
          nome: "Heatmap de Market Cap (Coin360)",
          oQueE:
            "Mapa onde cada moeda é um retângulo: o tamanho representa o valor de mercado e a cor representa a variação do preço.",
          comoLer:
            "Verde = alta, vermelho = queda; quanto mais intensa a cor, maior o movimento. BTC e ETH dominam a área porque dominam o mercado.",
          sinalCompra:
            "Mapa todo vermelho escuro = pânico generalizado. Historicamente, dias assim ficam perto de fundos locais.",
          sinalVenda: "Mapa todo verde forte com moedas pequenas explodindo = euforia, fase perigosa.",
          cuidado: "O widget é da Coin360 (externo). Ele mostra a foto do dia, não a tendência da semana.",
        },
        {
          nome: "Calendário Econômico Global (TradingView)",
          oQueE:
            "Agenda dos eventos macroeconômicos (juros, inflação, emprego, PIB) dos EUA, Europa, Brasil e China, com horário e grau de importância.",
          comoLer:
            "Cada evento mostra três números: Anterior (dado passado), Projeção (o que o mercado espera) e Atual (o que saiu). Quando o Atual vem muito diferente da Projeção, o mercado mexe forte — cripto incluída.",
          cuidado:
            "Nos minutos em torno de FOMC e CPI o preço chicoteia pros dois lados. Iniciante ganha mais ficando de fora nesses horários.",
        },
      ],
      dicas: [
        "FOMC (decisão de juros dos EUA) é o evento que mais move o Bitcoin. Anote as datas do mês.",
        "Evite carregar posição alavancada atravessando um evento de alto impacto.",
      ],
    },

    // ─────────────────────────────────────────────
    // TRADINGVIEW PRO (/dashboard/tradingview)
    // ─────────────────────────────────────────────
    {
      id: "tradingview",
      titulo: "TradingView Pro",
      rota: "/dashboard/tradingview",
      plano: "Grátis",
      resumo:
        "Gráfico profissional do TradingView embutido na plataforma, com 12 ativos, 8 tempos gráficos, pacotes de indicadores prontos, 3 estilos de gráfico, modo de 2 gráficos lado a lado e ferramentas de desenho. É onde você faz sua própria análise técnica.",
      comoUsar: [
        "Escolha o ativo no seletor: BTC, ETH, SOL, BNB, XRP, DOGE, ADA, AVAX ou os especiais DXY, S&P 500, TOTAL2 e BTC.D.",
        "Troque o tempo gráfico: 1m a 30m pra operações rápidas, 1h/4h pra swing curto, 1D/1W pra visão macro.",
        "Clique num preset de indicadores: 'Setup Padrão', 'Price Action' ou 'On-Chain Flow'.",
        "Alterne o estilo entre Candle, Heikin e Linha, e ative o modo de 2 gráficos pra comparar ativos ('Comparar com:').",
        "Use o botão do olho pra mostrar/ocultar a barra de ferramentas de desenho (linhas, suportes, Fibonacci...).",
      ],
      indicadores: [
        {
          nome: "Preset 'Setup Padrão' (RSI + MACD)",
          oQueE:
            "Pacote com dois indicadores clássicos: RSI (mede se o preço esticou demais) e MACD (compara duas médias móveis pra medir força e direção da tendência).",
          comoLer:
            "RSI: abaixo de 30 sobrevendido, acima de 70 sobrecomprado. MACD: linha cruzando pra cima = força compradora; pra baixo = força vendedora.",
          sinalCompra: "RSI saindo da zona de sobrevenda + MACD cruzando pra cima = confluência de compra.",
          sinalVenda: "RSI em sobrecompra + MACD cruzando pra baixo = confluência de venda/realização.",
          cuidado: "Nos tempos gráficos pequenos (1m, 5m) esses cruzamentos dão muito sinal falso.",
        },
        {
          nome: "Preset 'Price Action' (Bollinger + Volume)",
          oQueE:
            "Pacote com Bandas de Bollinger (faixa em volta da média que mede volatilidade) e Volume (barras de quanto foi negociado).",
          comoLer:
            "Preço colando na banda de cima = esticado (caro no curto prazo); na banda de baixo = esticado (barato). Bandas apertando = calmaria antes de movimento forte. Volume confirma: rompimento com volume alto vale mais.",
          sinalCompra: "Toque na banda inferior com volume de exaustão pode marcar repique.",
          sinalVenda: "Toque na banda superior após alta longa pede cautela.",
          cuidado: "Em tendência forte o preço 'anda' colado na banda por muito tempo. Banda tocada não é reversão garantida.",
        },
        {
          nome: "Preset 'On-Chain Flow' (RSI + MACD + Bollinger + Volume)",
          oQueE: "Pacote completo com os 4 indicadores juntos, pra quem quer a visão máxima numa tela só.",
          comoLer:
            "Procure confluência: quando RSI, MACD, Bollinger e Volume apontam pro mesmo lado, o sinal é mais forte do que qualquer um deles isolado.",
          cuidado: "Mais indicador não é mais certeza — é mais contexto. Tela poluída também atrapalha.",
        },
        {
          nome: "Estilos de gráfico (Candle / Heikin / Linha)",
          oQueE:
            "Três formas de desenhar o preço: Candle (velas tradicionais com abertura, fechamento, máxima e mínima), Heikin Ashi (velas suavizadas que filtram ruído) e Linha (só o fechamento).",
          comoLer:
            "Candle = padrão do mercado, mais informação. Heikin = sequências de cor mais limpas, bom pra enxergar tendência. Linha = visão simples pra iniciante.",
          cuidado: "Heikin Ashi suaviza tanto que o preço mostrado não é o preço real de negociação. Não use pra definir entrada e stop exatos.",
        },
        {
          nome: "Ativos especiais: DXY, S&P 500, TOTAL2 e BTC.D",
          oQueE:
            "Além das criptos, o seletor tem 4 termômetros macro: DXY (força do dólar), S&P 500 (bolsa dos EUA), TOTAL2 (valor de mercado de todas as criptos MENOS o Bitcoin) e BTC.D (dominância do Bitcoin em gráfico).",
          comoLer:
            "DXY subindo costuma pressionar a cripto. S&P 500 dá o clima de apetite a risco. TOTAL2 subindo = altcoins fortalecendo. BTC.D caindo com mercado de alta = rotação pra altcoins.",
          cuidado: "Correlações mudam com o ciclo. Use como contexto, não como gatilho.",
        },
        {
          nome: "Modo Dual (2 gráficos)",
          oQueE: "Divide a tela em dois gráficos lado a lado, com um seletor 'Comparar com:' no segundo.",
          comoLer:
            "Compare BTC com uma altcoin (quem lidera?), ou BTC com DXY (dólar pressionando?). Os dois gráficos usam o mesmo tempo gráfico e indicadores.",
          cuidado: "No celular, dois gráficos ficam apertados — prefira o modo único.",
        },
      ],
      dicas: [
        "Comece a análise sempre do tempo maior pro menor: 1W → 1D → 4h → 1h. A tendência grande manda.",
        "Menos é mais: domine RSI e médias antes de empilhar indicadores.",
      ],
    },

    // ─────────────────────────────────────────────
    // PAINEL DE GRÁFICOS (/dashboard/charts)
    // ─────────────────────────────────────────────
    {
      id: "charts",
      titulo: "Painel de Gráficos",
      rota: "/dashboard/charts",
      plano: "Grátis",
      resumo:
        "Grade com 6 gráficos ao vivo dos ativos mais estratégicos: Dólar (DXY), Bitcoin, Ethereum, S&P 500, NASDAQ e TOTAL2. Serve pra acompanhar cripto e mercado tradicional na mesma tela e entender o cenário completo.",
      comoUsar: [
        "No modo 'Grade' você vê os 6 gráficos de uma vez — é a visão macro do dia.",
        "Clique num gráfico (ou no botão 'Foco') pra ampliar um ativo só.",
        "Use a trilha no topo pra voltar da visão de foco pra grade.",
        "Compare os movimentos: cripto subindo com bolsas subindo e dólar caindo = cenário alinhado.",
      ],
      indicadores: [
        {
          nome: "Dólar (DXY)",
          oQueE:
            "Índice que mede a força do dólar americano contra as principais moedas do mundo.",
          comoLer:
            "DXY subindo = dólar forte = investidor fugindo de risco (pressiona cripto pra baixo). DXY caindo = dinheiro procurando risco (vento a favor da cripto).",
          cuidado: "A relação é tendência histórica, não lei. Há períodos em que os dois sobem juntos.",
        },
        {
          nome: "Bitcoin e Ethereum (BTC/USDT e ETH/USDT)",
          oQueE: "Os dois maiores ativos do mercado cripto, em gráfico ao vivo da Binance.",
          comoLer:
            "O BTC lidera o mercado; o ETH lidera as altcoins. Se os dois sobem juntos com força, o mercado inteiro tende a acompanhar.",
          cuidado: "ETH mais fraco que BTC por muito tempo costuma indicar pouco apetite por altcoins.",
        },
        {
          nome: "S&P 500 e NASDAQ",
          oQueE:
            "Os dois principais índices da bolsa americana: o S&P 500 (500 maiores empresas) e o NASDAQ (peso em tecnologia).",
          comoLer:
            "Cripto se comporta como 'ativo de risco': quando esses índices sobem, há apetite a risco; quando despencam, a cripto costuma sofrer junto.",
          cuidado: "O NASDAQ (tecnologia) é o que tem correlação mais forte com o Bitcoin.",
        },
        {
          nome: "TOTAL2 (mercado cripto sem o BTC)",
          oQueE:
            "Gráfico do valor de mercado somado de TODAS as criptomoedas, excluindo o Bitcoin. É o termômetro das altcoins como grupo.",
          comoLer:
            "TOTAL2 rompendo pra cima = dinheiro entrando nas altcoins (clima de altseason). TOTAL2 caindo com BTC de lado = altcoins sangrando.",
          sinalCompra: "TOTAL2 saindo de uma longa lateralização pra cima costuma anteceder boas semanas pras alts.",
          sinalVenda: "TOTAL2 perdendo suporte importante = hora de reduzir exposição em altcoins.",
          cuidado: "Altcoins amplificam tudo: sobem mais que o BTC e caem mais também.",
        },
        {
          nome: "Modos Grade e Foco",
          oQueE: "Alternador de visualização: 'Grade' mostra os 6 gráficos juntos; 'Foco' amplia um só.",
          comoLer: "Grade pra contexto, Foco pra análise detalhada de um ativo.",
        },
      ],
      dicas: [
        "Leitura clássica do cenário: DXY caindo + S&P subindo + TOTAL2 subindo = ambiente historicamente favorável a cripto.",
        "Abra esta tela antes do Terminal quando o dia estiver estranho — a resposta quase sempre está no dólar ou nas bolsas.",
      ],
    },

    // ─────────────────────────────────────────────
    // MOEDA EM DETALHE (/dashboard/coin/:id)
    // ─────────────────────────────────────────────
    {
      id: "coin-detail",
      titulo: "Moeda em Detalhe",
      rota: "/dashboard/coin/:id",
      plano: "Grátis",
      resumo:
        "A página individual de cada moeda (abre quando você clica numa moeda nas tabelas). Mostra preço, gráfico por período, cartões com os números principais, RSI, médias móveis e uma descrição do projeto.",
      comoUsar: [
        "No topo, veja nome, símbolo, posição no ranking, preço atual e o selo de sinal (COMPRA, VENDA ou NEUTRO).",
        "Troque o período do gráfico: 24h, 7d, 30d, 90d ou 1y (1 ano).",
        "Leia os 8 cartões de números: market cap, volume, variações, ATH, ATL e supply.",
        "Desça pro RSI e pras médias móveis pra ver o estado técnico da moeda.",
        "No fim, leia o 'Sobre' pra saber o que o projeto faz.",
      ],
      indicadores: [
        {
          nome: "Selo de Sinal (COMPRA / VENDA / NEUTRO)",
          oQueE:
            "Etiqueta ao lado do nome, gerada pelo RSI dos últimos 7 dias: COMPRA quando RSI está em 30 ou menos, VENDA quando está em 70 ou mais, NEUTRO no meio.",
          comoLer:
            "É um resumo automático do estado técnico, não uma ordem. COMPRA = esticada pra baixo; VENDA = esticada pra cima.",
          cuidado: "Um único indicador nunca decide um trade. Use como ponto de partida do estudo.",
        },
        {
          nome: "Gráfico de Preço (24h a 1 ano)",
          oQueE: "Gráfico de área com o histórico de preço da moeda no período escolhido.",
          comoLer:
            "Períodos curtos (24h, 7d) mostram o momento; longos (90d, 1y) mostram a tendência de verdade. Procure topos e fundos anteriores — eles viram suportes e resistências.",
          cuidado: "Julgar uma moeda só pelo gráfico de 24h é como julgar um filme por 5 segundos.",
        },
        {
          nome: "Market Cap",
          oQueE: "Valor total da moeda no mercado: preço vezes moedas em circulação.",
          comoLer: "Define o 'peso' e o ranking da moeda. Quanto maior, mais difícil dobrar de valor — e mais difícil ir a zero.",
        },
        {
          nome: "Volume 24h",
          oQueE: "Quanto dinheiro girou nessa moeda nas últimas 24 horas.",
          comoLer:
            "Compare com o market cap: volume alto em relação ao tamanho = moeda quente, com liquidez. Volume seco = pouco interesse.",
          cuidado: "Volume muito baixo dificulta sair da posição pelo preço que você quer.",
        },
        {
          nome: "Variação 24h / 7d / 30d",
          oQueE: "Quanto o preço mudou em três janelas de tempo: um dia, uma semana e um mês.",
          comoLer:
            "Verde = positivo, vermelho = negativo. As três juntas contam a história: subindo no mês mas caindo na semana pode ser só um respiro da tendência.",
          cuidado: "Não compre porque 'já caiu muito'. Pode cair mais.",
        },
        {
          nome: "ATH (topo histórico)",
          oQueE: "All-Time High: o maior preço que a moeda já atingiu na vida.",
          comoLer:
            "Compare com o preço atual pra saber a distância do topo. Perto do ATH = território de descoberta de preço (sem resistência acima).",
          cuidado:
            "'Está 90% abaixo do ATH' não é argumento de compra. Muitas moedas nunca voltam ao topo antigo.",
        },
        {
          nome: "ATL (fundo histórico)",
          oQueE: "All-Time Low: o menor preço que a moeda já atingiu.",
          comoLer: "Mostra o pior cenário que já existiu e o quanto a moeda já andou desde lá.",
        },
        {
          nome: "Circulating Supply (moedas em circulação)",
          oQueE: "Quantidade de moedas que já existe circulando no mercado.",
          comoLer:
            "É o número que, multiplicado pelo preço, dá o market cap. Moedas com emissão futura grande podem sofrer pressão de venda quando novas unidades entram no mercado.",
          cuidado: "Preço unitário baixo com supply gigante pode valer MAIS que moeda 'cara' com supply pequeno.",
        },
        {
          nome: "RSI (14 períodos, base 7 dias)",
          oQueE:
            "O Índice de Força Relativa da moeda, num cartão grande colorido, calculado sobre os preços da última semana.",
          comoLer:
            "70 ou mais = 'Sobrecomprado — considere venda'. 30 ou menos = 'Sobrevendido — oportunidade de compra'. Entre = 'Zona neutra'. As frases são leitura técnica padrão, não recomendação.",
          sinalCompra: "RSI baixo em moeda com tendência de alta preservada = candidata a estudo de compra.",
          sinalVenda: "RSI alto depois de disparada = zona de realizar lucro parcial.",
          cuidado: "Em altseason, RSI fica sobrecomprado por semanas. Contexto manda mais que o número.",
        },
        {
          nome: "Médias Móveis MA 10 / 20 / 80",
          oQueE:
            "Três preços médios da moeda (10, 20 e 80 períodos do gráfico de 7 dias), cada um com uma seta dizendo se o preço atual está Acima (▲) ou Abaixo (▼) da média.",
          comoLer:
            "Três setas pra cima (▲▲▲) = tendência de alta alinhada. Três pra baixo = baixa. Misturadas = indefinição.",
          sinalCompra: "Preço voltando a fechar acima das médias após queda = possível retomada.",
          sinalVenda: "Preço perdendo as três médias = deterioração técnica.",
          cuidado: "São médias de curto prazo (base semanal). Pra visão macro, use o gráfico de 90d/1y.",
        },
        {
          nome: "Sobre a moeda",
          oQueE: "Resumo do que o projeto faz, vindo da base do CoinGecko.",
          comoLer: "Leia antes de investir: se você não consegue explicar o que a moeda faz, não deveria comprá-la.",
          cuidado: "O texto vem em inglês e é escrito pelo próprio projeto — tom de propaganda incluso.",
        },
      ],
      dicas: [
        "Checklist rápido: tendência (médias) → esticamento (RSI) → liquidez (volume) → contexto (variações). Só então pense em preço de entrada.",
        "Ranking + market cap dizem mais sobre risco do que qualquer promessa do projeto.",
      ],
    },

    // ─────────────────────────────────────────────
    // TERMINAL NOTÍCIAS (/dashboard/news)
    // ─────────────────────────────────────────────
    {
      id: "news",
      titulo: "Terminal de Notícias",
      rota: "/dashboard/news",
      plano: "Grátis",
      resumo:
        "Feed de notícias de cripto ao vivo, com as moedas citadas em cada manchete, ao lado de um calendário econômico de alto impacto. Serve pra você nunca ser pego de surpresa por notícia ou evento macro.",
      comoUsar: [
        "Role o feed: as notícias mais novas ficam no topo e a lista atualiza sozinha a cada poucos minutos.",
        "Em cada manchete, veja a fonte, o horário e as etiquetas com as moedas citadas (BTC, ETH...).",
        "Clique no título pra abrir a notícia completa em nova aba.",
        "Na lateral direita, acompanhe o calendário econômico com os eventos de alto impacto (FOMC, CPI, NFP).",
      ],
      indicadores: [
        {
          nome: "Feed de manchetes (fonte + horário)",
          oQueE:
            "Lista das últimas notícias do mercado. As manchetes são agregadas pelo servidor da plataforma direto dos portais internacionais CoinTelegraph, Decrypt e CryptoSlate (a CryptoCompare também já serviu de fonte complementar).",
          comoLer:
            "A fonte aparece em cima do título e o horário mostra quando saiu. Notícia de minutos atrás pode ainda estar mexendo no preço; notícia de ontem provavelmente já foi precificada.",
          cuidado:
            "Os portais são internacionais, então os títulos chegam em inglês. E lembre: quando a notícia chega no varejo, o dinheiro grande muitas vezes já se posicionou.",
        },
        {
          nome: "Etiquetas de moedas citadas",
          oQueE:
            "Selos (BTC, ETH, SOL...) embaixo de cada manchete indicando quais moedas a notícia menciona.",
          comoLer:
            "Use pra filtrar com o olho o que interessa pra sua carteira. Muitas manchetes seguidas sobre a mesma moeda = ela está no centro das atenções (pra bem ou pra mal).",
          cuidado: "A detecção é automática pelo título — pode escapar moeda citada só no corpo do texto.",
        },
        {
          nome: "Calendário Econômico (lateral)",
          oQueE:
            "O mesmo calendário econômico do TradingView, filtrado pra eventos de impacto, ao lado do feed.",
          comoLer:
            "Cruze as duas colunas: manchete + evento macro no mesmo dia = dia de volatilidade. Compare o dado 'Atual' com a 'Projeção' — surpresa grande move o mercado na hora.",
          cuidado:
            "Eventos macro (FOMC, CPI, NFP) movem o Bitcoin mais que a maioria das notícias de cripto.",
        },
      ],
      dicas: [
        "Ler notícia é pra entender o movimento, não pra operar em cima dela — o preço reage antes de você terminar a leitura.",
        "Crie o hábito: 5 minutos de manchetes + calendário antes de qualquer operação do dia.",
      ],
    },
  ],
};
