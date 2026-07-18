import type { AbaManual } from "./types";

export const ABA_SINAIS: AbaManual = {
  id: "sinais",
  titulo: "Sinais & Setups",
  descricao:
    "As telas que varrem o mercado por você e apontam onde pode haver oportunidade de compra ou de venda — sempre como estudo, nunca como ordem.",
  paginas: [
    {
      id: "central",
      titulo: "Central de Sinais MTF RSI",
      rota: "/dashboard/central",
      plano: "Pro",
      resumo:
        "Painel com duas colunas: Compras (verde) e Vendas (rosa). Ele mede o RSI (termômetro de força, de 0 a 100) das 50 maiores moedas em 4 tempos gráficos ao mesmo tempo e só mostra o que está em zona de compra ou de venda. MTF significa multi-timeframe (vários tempos gráficos juntos). Analogia: o Diário é o mapa do país, o 4h é o mapa da cidade, o 1h é o bairro e o 5m é a rua onde você está. O sinal fica forte quando os mapas grandes concordam — e a rua (5m) só serve pra dizer a hora exata de sair de casa.",
      comoUsar: [
        "Escolha a Sensibilidade no topo: Estrito (20/80), Moderado (25/75) ou Amplo (30/70).",
        "Olhe a coluna verde (Compras) e a rosa (Vendas). Cada cartão é uma moeda em zona de sinal.",
        "No cartão, veja a nota (0 a 6), a etiqueta de força e a mini-tabela com o RSI de cada tempo gráfico.",
        "Espere o selo 'Gatilho' acender. Sem gatilho, o setup ainda está em formação.",
        "Clique no cartão pra abrir a Análise Completa da moeda antes de qualquer decisão.",
        "Painel vazio é normal: significa que nada está esticado agora. Afrouxe a sensibilidade ou aguarde.",
      ],
      indicadores: [
        {
          nome: "Score de Confluência (0 a 6)",
          oQueE:
            "Nota que soma os tempos gráficos alinhados. Cada tempo tem um peso: Diário vale 3 pontos, 4h vale 2 e 1h vale 1. Máximo: 6.",
          comoLer:
            "Score 1 ou 2 = sinal fraco/médio (só observação). Score 3 ou mais = confluência forte (vários tempos concordando). Na coluna verde a nota conta tempos sobrevendidos; na rosa, sobrecomprados.",
          sinalCompra: "Score alto na coluna Compras + gatilho aceso = setup de compra mais maduro.",
          sinalVenda: "Score alto na coluna Vendas + gatilho aceso = zona de realizar lucro ou evitar comprar.",
          cuidado:
            "Score alto sem gatilho não é entrada — é só um mercado esticado que pode esticar mais. O Diário pesa 3 justamente porque tempo grande manda no jogo.",
        },
        {
          nome: "Força (FORTE / MÉDIO / FRACO)",
          oQueE: "Etiqueta que traduz o score: 3+ pontos = FORTE, 2 = MÉDIO, 1 = FRACO.",
          comoLer:
            "Atenção às cores, que vêm do indicador original: FORTE aparece em vermelho, MÉDIO em laranja e FRACO em amarelo. Aqui o vermelho NÃO é 'ruim' — é o sinal mais forte.",
          cuidado: "Não confunda com as cores das colunas (verde = compra, rosa = venda). A cor da etiqueta mede intensidade, não direção.",
        },
        {
          nome: "Selo Gatilho (5m)",
          oQueE:
            "Confirmação de curtíssimo prazo. Acende quando o RSI de 5 minutos também entra na zona extrema E pelo menos um tempo maior já está alinhado.",
          comoLer:
            "Cartão com selo 'Gatilho' e borda brilhando (verde na compra, rosa na venda) = o setup disparou agora. Sem selo = em formação.",
          sinalCompra: "Gatilho aceso na coluna Compras = momento de estudar a entrada, com stop definido.",
          sinalVenda: "Gatilho aceso na coluna Vendas = momento de estudar a saída ou proteção.",
          cuidado:
            "O gatilho vem do gráfico de 5 minutos, que muda muito rápido. Ele pode acender e apagar na mesma hora. Use junto com o score, nunca sozinho.",
        },
        {
          nome: "Mini-tabela de RSI (D · 4h · 1h · 5m)",
          oQueE:
            "Quatro quadradinhos no cartão, um por tempo gráfico, mostrando o RSI de cada um. Ao lado do nome aparece o peso (D·3, 4h·2, 1h·1) e o 5m traz um raio (é o gatilho, não pontua).",
          comoLer:
            "Quadradinho aceso (verde ou rosa) = aquele tempo está alinhado com o sinal. Número em ciano = RSI 30 ou menos (sobrevendido). Número em rosa = RSI 70 ou mais (sobrecomprado). Cinza = neutro.",
          cuidado: "Um único quadradinho aceso vale pouco. O que interessa é o conjunto — quanto mais acesos, melhor.",
        },
        {
          nome: "Sensibilidade (20/80 · 25/75 · 30/70)",
          oQueE:
            "Régua que define o que conta como sobrevendido/sobrecomprado. Estrito = RSI 20/80. Moderado = 25/75. Amplo = 30/70.",
          comoLer:
            "Estrito: poucos sinais, porém mais raros e confiáveis. Amplo: mais sinais, capta setups em formação, mas com mais ruído (sinais falsos).",
          cuidado: "Trocar a sensibilidade muda as notas e os gatilhos na hora. Compare sempre no mesmo preset pra não se confundir.",
        },
        {
          nome: "Contadores de gatilho (topo)",
          oQueE: "Dois selos no cabeçalho mostrando quantos gatilhos long (compra) e short (venda) estão disparados agora.",
          comoLer:
            "Muitos gatilhos long ao mesmo tempo = mercado todo esticado pra baixo (possível fundo geral). Muitos short = euforia generalizada.",
          cuidado: "Os cartões vêm ordenados: gatilho disparado primeiro, depois maior score, depois RSI de 5m mais extremo. O topo da lista é o mais quente.",
        },
      ],
      dicas: [
        "Comece no Estrito. Se passar dias sem sinal, teste o Moderado — mas saiba que a qualidade média cai.",
        "Cruze com a tela Exaustão RSI: lá você vê o mapa completo; aqui, só o que já virou sinal.",
      ],
    },
    {
      id: "buy-signals",
      titulo: "Sinais de Compra",
      rota: "/dashboard/buy-signals",
      plano: "Pro",
      resumo:
        "Lista só com as moedas que o motor de sinais pontuou com nota 5 ou mais — ou seja, vários indicadores independentes apontando compra ao mesmo tempo (isso é confluência). A tabela vem ordenada da nota mais alta pra mais baixa. Stablecoins (moedas atreladas ao dólar) ficam de fora.",
      comoUsar: [
        "Leia os 3 cartões do topo: lógica de entrada (score ≥ 5), cruzar com o Mapa de Liquidez e gestão de risco.",
        "Percorra a tabela: nota, selo do sinal, RSI, tendência das médias e Fib/BB de cada moeda.",
        "Clique na setinha no fim da linha pra expandir e ver POR QUE a moeda pontuou (categorias + gatilhos).",
        "Clique na moeda pra abrir a análise completa antes de decidir.",
        "Regra de proteção sugerida na tela: stop abaixo da mínima do candle de 4h e risco de 1 a 2% do capital por operação.",
      ],
      indicadores: [
        {
          nome: "Score (nota do motor)",
          oQueE:
            "Nota total que soma pontos de 6 categorias: momentum (força), tendência, volume, sentimento, volatilidade e derivativos. Positiva puxa pra compra, negativa pra venda.",
          comoLer:
            "8 ou mais = 💎 COMPRA INSTITUCIONAL (verde). 5 a 7 = 📈 ALTA TÉCNICA (amarelo). 3 a 4 = ⚪ NEUTRO. 1 a 2 = 📉 BAIXA TÉCNICA (laranja). 0 ou menos = 🔥 DISTRIBUIÇÃO FORTE (vermelho). A barrinha embaixo do número repete essa cor.",
          sinalCompra: "Nesta tela só entram notas 5+. Quanto maior a nota, mais indicadores concordando.",
          cuidado: "Nota alta não é garantia de nada — é leitura de probabilidade. Mercado em queda forte derruba tudo junto, mesmo com nota boa.",
        },
        {
          nome: "Como a nota é montada (as 6 categorias)",
          oQueE: "O detalhe de onde vêm os pontos, visível ao expandir a linha da moeda.",
          comoLer:
            "Momentum: RSI 10 ou menos ('Golden Zone') soma +5; RSI até 25 soma +3; até 30 soma +2; RSI 85+ ('Exhaustion') tira 5; 75+ tira 3; 70+ tira 2. Sobrevenda junta em 1h+4h+Diário soma +4 (e sobrecompra junta tira 4). StochRSI no fundo soma +2, no topo tira 2. MACD cruzado pra cima soma +2, pra baixo tira 2. Tendência: preço acima da MA10 +1; MA10 acima da MA20 +2; MA20 acima da MA80 +1 (os contrários tiram pontos). Fibonacci: preço no Golden Pocket (0.618) soma +4; no 0.382 soma +2; no 0.5 soma +1. Volatilidade: preço na banda de baixo de Bollinger +2, na de cima -2. Volume: giro acima de 15% do valor da moeda +3; acima de 8% +2; abaixo de 2% tira 1. Sentimento: Medo & Ganância em medo extremo soma +2, medo +1, ganância -1, ganância extrema -2. Derivativos: funding bem negativo soma +3 (aposta contrária demais), funding muito alto tira 2.",
          cuidado: "Nenhuma categoria manda sozinha. O valor da nota está justamente na soma de fatores independentes.",
        },
        {
          nome: "Selo do sinal + High Confluence",
          oQueE:
            "Etiqueta com emoji que traduz a nota (💎, 📈, ⚪, 📉, 🔥). Abaixo dela pode aparecer o selo 'High Confluence' (confluência alta).",
          comoLer:
            "High Confluence acende quando pelo menos 2 destes 3 extremos acontecem juntos: RSI abaixo de 30 com preço abaixo da banda de Bollinger; RSI abaixo de 15; Medo & Ganância abaixo de 20 (pânico). Na linha expandida, o 'Status Final' mostra High, Medium ou Low.",
          sinalCompra: "Nota alta + High Confluence = o cenário mais raro e mais estudável da tela.",
        },
        {
          nome: "Coluna RSI (com selos Golden e Exhaust)",
          oQueE: "O RSI da moeda calculado sobre a última semana de preços.",
          comoLer:
            "Número em ciano = 30 ou menos (sobrevendido). Vermelho = 70 ou mais (sobrecomprado). RSI 10 ou menos pisca em ciano com o selo 'Golden' (fundo raro); 85 ou mais pisca em vermelho com 'Exhaust' (euforia). A linha inteira ganha um fundinho ciano ou vermelho nesses extremos.",
          sinalCompra: "Golden Zone = esticado demais pra baixo; historicamente boas zonas de repique.",
          sinalVenda: "Exhaust = esticado demais pra cima; zona de proteger lucro.",
          cuidado: "Em queda forte, o RSI pode ficar 'sobrevendido' por dias. Extremo indica elástico esticado, não data da reversão.",
        },
        {
          nome: "Coluna MAs (Bull ▲ / Bear ▼)",
          oQueE: "Resumo da tendência curta usando médias móveis (preço médio suavizado).",
          comoLer: "Bull ▲ (verde) = MA10 acima da MA20, embalo comprador. Bear ▼ (vermelho) = MA10 abaixo da MA20, embalo vendedor.",
          cuidado: "É uma foto da tendência curtinha. Confirme a tendência maior na análise da moeda.",
        },
        {
          nome: "Coluna Fib / BB",
          oQueE: "Junta dois avisos: retração de Fibonacci e Bandas de Bollinger (faixa de volatilidade em volta da média).",
          comoLer:
            "Selo piscando 'Fib 0.618' = preço no Golden Pocket, zona clássica de recompra institucional. 'BB Lower' (ciano) = preço colado na banda de baixo (barato/esticado). 'BB Upper' (vermelho) = colado na banda de cima (caro/esticado). 'Neutral BB' = no meio da faixa.",
          sinalCompra: "Fib 0.618 + BB Lower na mesma moeda é confluência forte de suporte.",
        },
        {
          nome: "FR (Funding Rate)",
          oQueE:
            "Etiqueta pequena embaixo do nome da moeda com a taxa que traders alavancados pagam entre si nos futuros perpétuos.",
          comoLer:
            "FR em verde = negativo: os vendidos estão pagando (pessimismo demais, combustível pra 'short squeeze', uma alta forçada). FR cinza = normal/positivo.",
          cuidado: "Funding muito positivo = euforia alavancada; qualquer susto vira queda rápida.",
        },
        {
          nome: "Preço, 24h, Volume e 7D",
          oQueE: "Colunas de contexto: preço atual, variação em 24 horas, volume negociado e mini-gráfico dos últimos 7 dias.",
          comoLer:
            "24h em verde = subindo, vermelho = caindo. O mini-gráfico (sparkline) mostra o desenho da semana de relance. Dá pra ordenar a tabela clicando nos títulos das colunas.",
          cuidado: "Sinal de compra com volume muito baixo é menos confiável — pouca gente sustentando o movimento.",
        },
        {
          nome: "Linha expandida (Confluência + Gatilhos de Ação)",
          oQueE:
            "Ao clicar na setinha, abre o raio-X do sinal: a pontuação de cada categoria (momentum, trend, volatility, volume, sentiment) em barrinhas, o Status Final e a lista de 'Drivers' — cada motivo com os pontos que somou ou tirou.",
          comoLer:
            "Barrinha verde = categoria somando pontos; vermelha = tirando. Nos Drivers, leia as frases: é o motor explicando a nota em português (ex.: 'RSI baixo — sobrevendido', 'Volume explosivo').",
          cuidado: "Sempre expanda antes de agir. Duas moedas com a mesma nota podem ter motivos bem diferentes.",
        },
      ],
      dicas: [
        "Cruze o sinal com o Mapa de Liquidez: zonas de liquidação atraem o preço como ímã.",
        "Tabela vazia ('Aguardando confluência...') é informação também: o mercado não está dando desconto agora.",
      ],
    },
    {
      id: "sell-signals",
      titulo: "Sinais de Venda",
      rota: "/dashboard/sell-signals",
      plano: "Pro",
      resumo:
        "O espelho da tela de compra: lista só as moedas com nota 0 ou menos — quando os indicadores apontam exaustão da compra (o embalo acabou) e possível distribuição (dinheiro grande vendendo aos poucos). Serve principalmente pra proteger lucro e evitar comprar topo, não pra apostar na queda.",
      comoUsar: [
        "Leia os 3 cartões do topo: lógica de distribuição (score ≤ 0), 'liquidity flush' no Mapa de Liquidez e take profit (realizar lucro).",
        "Percorra a tabela — ordenada da nota mais negativa pra menos negativa (o pior primeiro).",
        "Se você TEM a moeda listada: estude realizar lucro parcial ou subir seu stop.",
        "Se você NÃO tem: é um aviso pra não comprar agora, por mais que o gráfico pareça bonito.",
        "Expanda a linha pra ver os motivos da nota antes de qualquer decisão.",
      ],
      indicadores: [
        {
          nome: "Score ≤ 0 (Distribuição Forte)",
          oQueE:
            "Só entram aqui moedas com nota zero ou negativa, que ganham o selo 🔥 DISTRIBUIÇÃO FORTE (vermelho). A nota fica negativa quando RSI sobrecomprado, médias viradas pra baixo, ganância no mercado e funding esticado tiram mais pontos do que os fatores positivos somam.",
          comoLer: "Quanto mais negativa a nota, mais indicadores gritando exaustão ao mesmo tempo.",
          sinalVenda: "Moeda sua na lista com nota bem negativa = hora de estudar saída parcial e proteção de ganhos.",
          cuidado:
            "Sinal de venda não é convite pra operar vendido (short). Short é operação avançada e alavancada — pra iniciante, 'venda' aqui significa realizar lucro ou ficar de fora.",
        },
        {
          nome: "Tabela de sinais (mesmas colunas da tela de Compra)",
          oQueE:
            "A tabela é idêntica à de Sinais de Compra: Score com barrinha, selo do sinal, Preço, 24h, RSI (com selo Exhaust), MAs (Bull/Bear), Fib/BB, Volume, gráfico 7D, FR e linha expandida com categorias e drivers.",
          comoLer:
            "Aqui o que mais acende é o lado vermelho: RSI 85+ piscando com 'Exhaust', 'BB Upper' (preço colado na banda de cima) e MAs em Bear ▼. Consulte a seção Sinais de Compra deste manual pra descrição completa de cada coluna.",
          cuidado: "Moeda pode seguir subindo mesmo 'exausta' — euforia dura mais do que parece. Por isso a saída parcial é mais sensata que a total.",
        },
      ],
      dicas: [
        "Combine com o Medo & Ganância: nota negativa + ganância extrema no mercado é o combo clássico de topo.",
        "Lista vazia ('Aguardando sinais de exaustão...') = nenhum extremo de venda agora.",
      ],
    },
    {
      id: "rsi",
      titulo: "Exaustão RSI (Heatmap)",
      rota: "/dashboard/rsi",
      plano: "Grátis",
      resumo:
        "Um mapa de calor com o RSI das 50 maiores moedas em 5 tempos gráficos: 1D, 4h, 1h, 15m e 5m. Cada quadradinho é o RSI de uma moeda em um tempo. De um olhar você acha o que está esticado demais pra baixo (ciano) ou pra cima (vermelho). É a matéria-prima da Central de Sinais, mostrada crua.",
      comoUsar: [
        "Leia por cores: ciano = sobrevendido (possível fundo); vermelho = sobrecomprado (possível topo); cinza escuro = neutro.",
        "Varra a linha de cada moeda da esquerda (1D) pra direita (5m): esquerda é o filme, direita é o agora.",
        "Procure linhas inteiras da mesma cor — o alinhamento em todos os tempos é o setup mais forte ('Master Buy' quando tudo ciano).",
        "Passe o mouse num quadradinho pra ver o valor exato do RSI e a etiqueta (OVERSOLD, NEUTRAL, OVERBOUGHT...).",
        "Achou algo interessante? É tela de triagem: confirme na análise completa da moeda antes de agir.",
      ],
      indicadores: [
        {
          nome: "RSI multi-timeframe (1D · 4h · 1h · 15m · 5m)",
          oQueE:
            "O RSI (força relativa, 0 a 100) calculado em 5 tempos gráficos pra cada moeda. Tempo grande (1D) mostra a maré; tempo pequeno (5m) mostra a onda da vez.",
          comoLer:
            "Abaixo de 30 = sobrevendido. Acima de 70 = sobrecomprado. O que importa aqui é comparar os tempos: sobrevenda só no 5m é ruído; sobrevenda no 1D + 4h + 1h ao mesmo tempo é elástico esticado de verdade.",
          sinalCompra: "Linha da moeda toda em tons de ciano (o 'Setup Master Buy') = capitulação em todos os tempos.",
          sinalVenda: "Linha toda em tons de vermelho = euforia em todos os tempos; risco alto de topo.",
          cuidado: "Sobrevendido pode ficar mais sobrevendido. O heatmap mostra o esticão, não a data da virada.",
        },
        {
          nome: "Escala de cores (legenda do topo)",
          oQueE: "A régua que traduz número em cor, com 7 faixas.",
          comoLer:
            "Ciano brilhante = RSI abaixo de 10 (sobrevenda EXTREMA, brilha e aumenta de tamanho). Ciano médio = abaixo de 25. Ciano escuro = abaixo de 35. Cinza = 35 a 65 (neutro). Vinho = acima de 65. Vermelho = acima de 75. Vermelho brilhante = acima de 90 (euforia EXTREMA, também brilha).",
          cuidado: "Os quadradinhos com RSI abaixo de 15 ou acima de 85 ficam maiores de propósito — são os extremos que merecem seu olho primeiro.",
        },
        {
          nome: "Tooltip da célula (valor exato)",
          oQueE: "Caixinha que abre ao passar o mouse: moeda, tempo gráfico, RSI com uma casa decimal e a etiqueta de leitura.",
          comoLer:
            "Etiquetas: EXTREME OVERSOLD (abaixo de 10), OVERSOLD (abaixo de 25), NEUTRAL (meio), OVERBOUGHT (acima de 75), EXTREME OVERBOUGHT (acima de 90).",
        },
        {
          nome: "Selo STREAMING ATIVO",
          oQueE: "Indica que os dados estão chegando ao vivo da Binance e o painel se atualiza sozinho.",
          comoLer: "Célula com traço (-) = aquele par não tem dado naquele tempo ainda; moedas sem nenhum dado somem da lista.",
        },
      ],
      dicas: [
        "Use esta tela grátis como radar diário: 2 minutos de varredura já mostram onde o mercado está esticado.",
        "O passo seguinte natural é a Central de Sinais (Pro), que transforma este mapa em notas e gatilhos prontos.",
      ],
    },
    {
      id: "short-term",
      titulo: "Setup Curto Prazo — Intraday",
      rota: "/dashboard/short-term",
      plano: "Pro",
      resumo:
        "Filtro pra operações rápidas (de 1h a 4h de duração). A lógica: achar moedas em tendência clara que fizeram um pullback (recuo curto do preço, o 'respiro') até a zona das médias de 10 e 20 períodos, com RSI baixo confirmando. A tendência é vigiada pela média de 80 (MA80) — perdeu a MA80, o setup morre.",
      comoUsar: [
        "Abra e veja a lista: só aparecem moedas com setup ativo AGORA (confiança 55 ou mais), ordenadas da maior confiança pra menor.",
        "Leia os 2 cartões do topo: a lógica de ignição (pullback nas MAs 10/20) e a proteção (stop abaixo da MA80).",
        "Clique numa moeda pra abrir a Análise Completa e conferir o gráfico antes de agir.",
        "Lista vazia ('Aguardando gatilhos...') = nenhum pullback limpo no momento. Não force operação.",
      ],
      indicadores: [
        {
          nome: "Filtro de tendência (MA20 x MA80)",
          oQueE:
            "O porteiro do setup. Compra só é considerada se a MA20 está acima da MA80 E o preço está acima da MA80 (tendência de alta intraday). Venda, só no espelho: MA20 abaixo da MA80 e preço abaixo dela.",
          comoLer: "Pense na MA80 como o chão da tendência do dia. Acima dela, procuramos compras; abaixo, só vendas.",
          cuidado: "Moeda andando de lado (preço cruzando a MA80 toda hora) não gera setup — e é bom que não gere.",
        },
        {
          nome: "Zona de pullback (MA10–MA20)",
          oQueE:
            "O coração do setup: o preço recuar até a faixa entre a média de 10 e a de 20 períodos. É onde quem perdeu o movimento costuma entrar. Vale +40 pontos de confiança.",
          comoLer:
            "Preço tocando essa zona numa tendência de alta = possível reabastecimento antes de seguir. Na tendência de baixa, a mesma zona vira ponto de venda.",
          sinalCompra: "Recuo na MA10–MA20 com tendência de alta intacta (preço ainda acima da MA80).",
          sinalVenda: "Repique até a MA10–MA20 numa tendência de baixa.",
          cuidado: "Nem todo recuo é pullback — às vezes é o começo da virada. Por isso o stop na MA80 é inegociável.",
        },
        {
          nome: "Confiança (0 a 100)",
          oQueE:
            "Nota do setup somando: pullback na zona MA10–MA20 (+40), RSI baixo na tendência de alta (+30), histograma do MACD positivo (+15) e RSI de 15m abaixo de 35 (+15). Pra venda, os espelhos: RSI esticado (+30), MACD negativo (+15), 15m acima de 65 (+15).",
          comoLer:
            "Só entra na lista com 55 ou mais. 55–70 = setup ok. 85+ = todas as condições batendo juntas (raro). A lista vem ordenada por essa nota.",
          cuidado: "Confiança alta mede alinhamento de critérios, não probabilidade garantida. Intraday é a modalidade mais difícil — respeite o stop sempre.",
        },
        {
          nome: "RSI de 15 minutos",
          oQueE: "Confirmação de curtíssimo prazo: mostra se o recuo já esgotou a pressão vendedora no micro tempo.",
          comoLer: "Abaixo de 35 na compra = exaustão do recuo, timing melhor. Acima de 65 na venda = euforia de curtíssimo prazo, topo iminente do repique.",
        },
        {
          nome: "Histograma do MACD",
          oQueE: "Mede se a força compradora está voltando (positivo) ou se a vendedora está aumentando (negativo).",
          comoLer: "Positivo durante o pullback de compra = o recuo está perdendo força, bom sinal. Negativo no repique de venda = vendedores retomando.",
        },
        {
          nome: "Tabela de sinais",
          oQueE:
            "A mesma tabela do motor de sinais (colunas descritas na seção Sinais de Compra): Score, selo, RSI, MAs, Fib/BB, volume, 7D e linha expandida com os motivos.",
          comoLer: "Aqui ela vem filtrada pelo setup intraday e ordenada pela confiança. Use a linha expandida pra ver os drivers de cada moeda.",
        },
      ],
      dicas: [
        "Stop sugerido pela própria tela: logo abaixo da MA80. Preço perdeu a MA80 no intraday = setup invalidado, saia sem discutir.",
        "Operação pensada pra durar de 1h a 4h. Se virou 'vou segurar pra ver', você mudou de estratégia no meio do jogo — erro clássico.",
      ],
    },
    {
      id: "long-term",
      titulo: "Setup Longo Prazo — Swing",
      rota: "/dashboard/long-term",
      plano: "Pro",
      resumo:
        "Filtro pra operações de semanas (swing/position). A ideia: esperar moedas grandes, em tendência macro de alta, corrigirem até as médias longas (MA100–MA200 do diário) — a zona onde o dinheiro institucional historicamente recompra. É a tela da paciência: pode ficar vazia por semanas, e isso é normal.",
      comoUsar: [
        "Veja a lista de ativos em zona de compra macro (confiança 65 ou mais), ordenada da maior confiança pra menor.",
        "Leia os 2 cartões: a base de preço institucional (descanso na MA200) e a gestão de swing (RSI diário + Golden Pocket).",
        "Clique num ativo pra abrir a Análise Completa e planejar entrada, alvo e stop com calma.",
        "Tela vazia ('Nenhum ativo gigante em zona de compra macro...') = o mercado não corrigiu o suficiente. Esperar também é posição.",
      ],
      indicadores: [
        {
          nome: "Tendência macro (MA50 x MA200)",
          oQueE:
            "O porteiro do setup de longo prazo. Compra só é estudada se a MA50 está acima da MA200 (o famoso mercado em tendência macro de alta).",
          comoLer:
            "MA50 acima da MA200 = estrutura de alta; correções são oportunidade. MA50 abaixo = estrutura de baixa; repiques viram zona de venda, não de compra.",
          cuidado: "Médias longas viram devagar. Elas confirmam a tendência, não preveem o futuro.",
        },
        {
          nome: "Zona de acumulação (MA100–MA200)",
          oQueE:
            "A condição principal (+50 pontos): o preço corrigir até a faixa entre a média de 100 e a de 200 períodos — o 'suporte vital' onde grandes players costumam acumular.",
          comoLer: "Preço descansando nessa faixa numa tendência macro de alta = o setup clássico institucional que a tela procura.",
          sinalCompra: "Toque na MA100–MA200 com a estrutura de alta preservada.",
          sinalVenda: "Na tendência de baixa, o espelho: preço retestando a MA50–MA100 por baixo (+50) é zona histórica de distribuição.",
          cuidado: "Suporte não é piso mágico. Se romper com força, a mesma zona vira resistência.",
        },
        {
          nome: "RSI diário",
          oQueE: "O termômetro de força no tempo gráfico grande, usado como confirmação (+30 pontos).",
          comoLer:
            "Abaixo de 35 durante tendência macro de alta = pessimismo exagerado numa estrutura saudável (o que o setup quer). Acima de 65 em mercado de baixa = euforia de 'bear market rally' (repique enganoso), condição de venda.",
        },
        {
          nome: "Golden Pocket (Fibonacci 0.618)",
          oQueE:
            "A retração de Fibonacci de 61,8% do último movimento — a zona onde compradores institucionais historicamente recompram. Vale +20 pontos quando o preço chega nela.",
          comoLer: "Preço no Golden Pocket + zona MA100–MA200 + RSI diário baixo = a tríplice confluência que gera as maiores notas da tela.",
          cuidado: "Fibonacci é zona de atenção, não linha exata. Trabalhe com faixa de preço, nunca com um número cravado.",
        },
        {
          nome: "Confiança (0 a 100)",
          oQueE:
            "Nota do setup: zona MA100–MA200 (+50), RSI diário abaixo de 35 (+30) e Golden Pocket (+20). Pra venda em mercado de baixa: reteste MA50–MA100 (+50) e RSI acima de 65 (+30).",
          comoLer: "Só entra na lista com 65 ou mais — corte mais exigente que o do curto prazo, de propósito. 80+ = confluência quase completa.",
          cuidado: "Setup de semanas pede stop de semanas: mais largo e com posição menor. Não use stop de day trade em operação de swing.",
        },
        {
          nome: "Tabela de sinais",
          oQueE:
            "A mesma tabela do motor de sinais (colunas descritas na seção Sinais de Compra), filtrada pelo setup macro e ordenada por confiança.",
          comoLer: "Expanda a linha pra conferir os drivers — no swing, procure motivos de tendência e Fibonacci entre eles.",
        },
      ],
      dicas: [
        "Esta é a tela mais 'chata' da plataforma — e talvez a mais valiosa. Setups macro aparecem poucas vezes por ano.",
        "Combine com a aba On-Chain: fundo de ciclo lá + preço na MA200 aqui é confluência de outro nível.",
        "Nada aqui é recomendação de investimento. É leitura de mercado; a decisão e o risco são sempre seus.",
      ],
    },
  ],
};
