import type { AbaManual } from "./types";

/**
 * Aba "Liquidez & Risco" — Livro de Ordens, Mapa de Liquidez e Simulador de Risco.
 * Aqui o iniciante aprende onde está o dinheiro grande, onde as apostas alavancadas
 * estouram e quanto risco cada alavancagem realmente carrega.
 */
export const ABA_LIQUIDEZ: AbaManual = {
  id: "liquidez",
  titulo: "Liquidez & Risco",
  descricao:
    "Onde está o dinheiro grande (paredes de compra e venda), onde as apostas alavancadas estouram (liquidações) e quanto risco cada alavancagem carrega — antes de você entrar em qualquer operação.",
  paginas: [
    // ─────────────────────────── LIVRO DE ORDENS ───────────────────────────
    {
      id: "orderbook",
      titulo: "Livro de Ordens",
      rota: "/dashboard/orderbook",
      plano: "Grátis",
      resumo:
        "Um rastreador de baleias (investidores gigantes) em tempo real. Ele mostra as GRANDES ordens de compra e venda paradas no livro da Binance Spot — as famosas 'paredes' de dinheiro. Parede de compra costuma segurar quedas (suporte); parede de venda costuma frear altas (resistência).",
      comoUsar: [
        "Escolha o ativo no seletor do topo: BTC, ETH, SOL, BNB, XRP ou DOGE.",
        "Escolha o tempo gráfico (1m, 5m, 15m, 30m, 1h, 4h ou 1D) pra ajustar o zoom do gráfico de profundidade.",
        "Olhe os 4 cartões do topo: Total Bids, Total Asks, Bid/Ask Ratio e Spot Price. Eles resumem o placar entre compradores e vendedores grandes.",
        "No painel da direita (Whale Orders), as linhas verdes são paredes de COMPRA (abaixo do preço) e as vermelhas são paredes de VENDA (acima do preço). A linha SPOT no meio é o preço agora.",
        "Passe o mouse em qualquer ordem pra abrir o cartão de detalhes: preço, quantidade, valor total, distância do preço atual e há quanto tempo a parede está lá.",
        "Confira o selo LIVE: verde piscando = dados chegando ao vivo. Se aparecer ERRO, a Binance pode estar bloqueada na sua rede.",
      ],
      indicadores: [
        {
          nome: "Total Bids",
          oQueE:
            "A soma, em dólar, de todas as grandes ordens de COMPRA paradas no livro (bid = oferta de compra). Mostra também quantas 'paredes ativas' existem.",
          comoLer:
            "Número alto = muito dinheiro grande querendo comprar mais barato. Essas paredes funcionam como colchões: se o preço cair até elas, tendem a segurar a queda.",
          sinalCompra:
            "Total Bids bem maior que Total Asks sugere que o dinheiro grande está posicionado pra comprar — o mercado tem 'chão' por perto.",
          cuidado:
            "Parede pode ser retirada a qualquer momento. Baleia também blefa: coloca ordem gigante só pra assustar e cancela antes de ser executada (isso se chama spoofing).",
        },
        {
          nome: "Total Asks",
          oQueE:
            "A soma, em dólar, de todas as grandes ordens de VENDA paradas no livro (ask = oferta de venda), com a contagem de paredes ativas.",
          comoLer:
            "Número alto = muito dinheiro grande querendo vender mais caro. Essas paredes funcionam como tetos: o preço costuma ter dificuldade de passar por elas.",
          sinalVenda:
            "Uma parede de venda enorme logo acima do preço atual é um alvo natural pra realizar lucro ANTES dela — o preço tende a frear ali.",
          cuidado:
            "Paredes de venda também somem sem aviso. Se o mercado estiver muito forte, ele 'come' a parede e continua subindo.",
        },
        {
          nome: "Bid / Ask Ratio",
          oQueE:
            "A divisão entre o total de compra e o total de venda das grandes ordens. É o placar do cabo de guerra entre baleias compradoras e vendedoras.",
          comoLer:
            "Acima de 1 = mais dinheiro na compra (o número fica verde a partir de ~1,10). Abaixo de 1 = mais dinheiro na venda (fica vermelho abaixo de ~0,90). Perto de 1 = equilíbrio.",
          sinalCompra: "Ratio bem acima de 1 e subindo = pressão compradora dos grandes players.",
          sinalVenda: "Ratio bem abaixo de 1 = pressão vendedora dominando o livro.",
          cuidado:
            "O ratio muda a cada poucos segundos. Use como leitura de contexto, não como gatilho único de entrada.",
        },
        {
          nome: "Spot Price",
          oQueE:
            "O preço à vista do ativo agora, na Binance Spot, junto com o total de grandes ordens sendo monitoradas.",
          comoLer:
            "É a sua referência: tudo na página gira em torno dele. Paredes verdes ficam abaixo, vermelhas ficam acima.",
        },
        {
          nome: "Gráfico de profundidade (candles + paredes)",
          oQueE:
            "O gráfico grande mostra o preço em candles (velas) e desenha as paredes de baleia por cima, no nível de preço onde elas estão.",
          comoLer:
            "A barra horizontal de cada parede representa o TEMPO que a ordem está no livro: quanto mais comprida, mais antiga (e mais respeitada) é a parede. Só entram ordens acima de um valor mínimo por ativo: BTC US$ 250 mil, ETH US$ 100 mil, SOL e BNB US$ 50 mil, XRP e DOGE US$ 25 mil. Fonte: Binance Spot, atualizada a cada 4 segundos.",
          cuidado:
            "Ordem pequena não aparece aqui de propósito — a página filtra só o dinheiro grande. O varejo (pessoas comuns) não move paredes.",
        },
        {
          nome: "Painel Whale Orders (Preço · Notional · Idade)",
          oQueE:
            "A lista lateral com cada parede: o preço dela, o notional (valor total em dólar = preço × quantidade) e a idade (há quanto tempo está parada no livro).",
          comoLer:
            "Verde (BID · COMPRA) = suporte em potencial. Vermelho (ASK · VENDA) = resistência em potencial. A barra colorida atrás da linha compara o tamanho: quanto mais cheia, maior a ordem. Passe o mouse pra ver os detalhes completos: quantidade em moeda, distância do spot em % e em dólar, hora em que foi vista pela primeira vez e última confirmação.",
          sinalCompra:
            "Parede de compra grande, ANTIGA (idade alta) e perto do preço = nível de suporte que o mercado respeita. Muita gente usa como região de compra com stop logo abaixo dela.",
          sinalVenda:
            "Parede de venda grande logo acima = alvo pra realizar lucro parcial antes do preço bater nela.",
          cuidado:
            "Idade alta aumenta a confiança, mas não garante nada: a baleia pode cancelar a ordem 1 segundo antes de o preço chegar. Nunca aposte tudo numa parede.",
        },
      ],
      dicas: [
        "Cruze com o Mapa de Liquidez: quando uma parede de compra do livro coincide com uma zona de liquidação de longs, aquele nível fica ainda mais importante.",
        "Parede que 'anda' junto com o preço (some e reaparece mais perto) costuma ser algoritmo, não intenção real de compra.",
        "Isto é leitura de mercado, não recomendação. Toda decisão de compra ou venda é sua.",
      ],
    },

    // ─────────────────────────── MAPA DE LIQUIDEZ ───────────────────────────
    {
      id: "liquidity",
      titulo: "Mapa de Liquidez",
      rota: "/dashboard/liquidity",
      plano: "Grátis",
      resumo:
        "Mostra onde as apostas alavancadas podem estourar (zonas de liquidação), o clima dos futuros (funding, open interest, long/short) e as liquidações acontecendo AO VIVO na Binance. Ideia central: o preço age como ímã pras regiões onde tem muita gente pra ser liquidada.",
      comoUsar: [
        "Escolha o ativo nos botões do topo: BTC, ETH, SOL, BNB, XRP ou DOGE.",
        "Leia os 4 cartões do snapshot: Preço, Funding, Long/Short (contas) e Open Interest — é o raio-X dos futuros daquele ativo.",
        "Veja os 3 cartões de liquidações ao vivo: Longs Liq, Shorts Liq e Total da sessão, com a leitura de qual lado está apanhando.",
        "Na escada 'Zonas de Liquidação', olhe as paredes: acima do preço estouram os shorts (vendidos), abaixo estouram os longs (comprados). Cada linha mostra a alavancagem (5x a 100x), o preço em que ela quebra e a distância em %.",
        "Leia o 'Mini Relatório': ele traduz tudo em frases prontas, coloridas por tom (verde = viés de alta, vermelho = viés de queda, âmbar = alerta).",
        "Desça pro Heatmap Nativo (liquidações que DE FATO aconteceram) e, por último, o mapa completo da CoinGlass embutido na página.",
      ],
      indicadores: [
        {
          nome: "Preço (mark price)",
          oQueE:
            "O preço de referência dos futuros da Binance pro ativo escolhido. Se a Binance estiver bloqueada, a página usa o preço da CoinGecko como reserva.",
          comoLer:
            "Aparece no selo 'preço vivo' do topo e no cartão de Preço. Todas as zonas de liquidação são calculadas a partir dele.",
        },
        {
          nome: "Funding",
          oQueE:
            "A taxa que comprados (longs) e vendidos (shorts) pagam entre si nos futuros perpétuos, tipo um 'aluguel' cobrado a cada 8 horas de quem está do lado mais cheio da aposta.",
          comoLer:
            "Positivo (verde) = maioria comprada pagando pra manter a posição. Negativo (vermelho) = maioria vendida pagando. O valor aparece em % com 4 casas decimais — parece pequeno, mas se repete o dia inteiro.",
          sinalCompra:
            "Funding negativo forte (abaixo de -0,05%) = excesso de vendidos pagando caro. Isso vira combustível pra 'short squeeze': se o preço sobe, os shorts são forçados a comprar e empurram a alta.",
          sinalVenda:
            "Funding muito positivo (acima de +0,05%) = euforia alavancada. Todo mundo comprado e pagando pra ficar — cenário clássico de correção pra baixo (long squeeze).",
          cuidado:
            "Funding extremo pode continuar extremo por dias em tendência forte. Ele avisa que a corda está esticada, não QUANDO ela arrebenta.",
        },
        {
          nome: "Long/Short (contas)",
          oQueE:
            "O placar de contas na Binance Futures: quantas estão apostando na alta (long) contra quantas apostando na baixa (short). Mostra a razão e os percentuais de cada lado.",
          comoLer:
            "Acima de 1 = mais contas compradas (ex.: 2,00 = o dobro de longs). Abaixo de 1 = mais contas vendidas. Embaixo aparece o detalhe: % long em verde e % short em vermelho.",
          sinalCompra:
            "Razão abaixo de ~0,70 = mercado lotado de vendidos. Multidão costuma errar: qualquer alta força os shorts a recomprar (squeeze).",
          sinalVenda:
            "Razão acima de ~1,50 = mercado lotado de comprados. A parede de baixo (liquidação de longs) fica mais perigosa: uma queda pode virar cascata.",
          cuidado:
            "Conta pequena e baleia valem igual nessa métrica (ela conta CONTAS, não dólares). O varejo lotado de long não impede o dinheiro grande de estar vendido.",
        },
        {
          nome: "Open Interest",
          oQueE:
            "O total de dinheiro parado em contratos futuros abertos daquele ativo, convertido pra dólar. É o tamanho da mesa de apostas alavancadas.",
          comoLer:
            "OI subindo junto com o preço = dinheiro novo entrando e confirmando o movimento. OI caindo = posições sendo fechadas, movimento perdendo força.",
          cuidado:
            "OI muito alto = muita alavancagem acumulada no sistema. Qualquer movimento brusco liquida gente em cascata e amplifica a volatilidade pros dois lados.",
        },
        {
          nome: "Longs Liq · ao vivo",
          oQueE:
            "Quanto (em dólar) de posições COMPRADAS já foi liquidado na sessão atual, direto do feed da Binance Futures. Liquidação = a corretora fecha a posição à força porque o prejuízo comeu a margem do trader.",
          comoLer:
            "Cartão vermelho. Número crescendo rápido = o preço está caindo e estourando comprados em série.",
          sinalCompra:
            "Uma enxurrada de longs liquidados costuma marcar quedas exageradas — depois da faxina, o mercado às vezes encontra fundo local.",
          cuidado:
            "'Às vezes' não é 'sempre'. Em queda forte, cascata pode puxar mais cascata. Não tente segurar faca caindo só por causa desse número.",
        },
        {
          nome: "Shorts Liq · ao vivo",
          oQueE:
            "O espelho do anterior: quanto de posições VENDIDAS foi liquidado na sessão. Short liquidado é forçado a COMPRAR pra fechar, o que empurra o preço pra cima.",
          comoLer:
            "Cartão verde. Número crescendo rápido = alta forte queimando os vendidos (short squeeze em andamento).",
          sinalVenda:
            "Squeeze gigante de shorts costuma marcar altas exageradas — topo local é comum depois que os vendidos acabam de ser expulsos.",
          cuidado:
            "Os valores somam apenas o que passou pelo feed durante a sua sessão aberta. Não é o total do dia inteiro do mercado.",
        },
        {
          nome: "Total · sessão (lado dominante)",
          oQueE:
            "A soma das liquidações de longs + shorts na sessão, com a leitura pronta de quem está apanhando mais.",
          comoLer:
            "Se liquidou mais LONGS, aparece '↓ pressão vendedora' (a queda dominou). Se liquidou mais SHORTS, aparece '↑ pressão compradora' (a alta dominou). 'Aguardando feed' = ainda sem dados.",
        },
        {
          nome: "Zonas de Liquidação (escada por alavancagem)",
          oQueE:
            "Um cálculo transparente de ONDE cada alavancagem quebra a partir do preço atual: 100x, 50x, 25x, 10x e 5x, pra cima e pra baixo. A conta é simples: preço de liquidação ≈ preço × (1 − 1/alavancagem) pros longs e preço × (1 + 1/alavancagem) pros shorts.",
          comoLer:
            "Acima do 'Preço agora' ficam as zonas dos SHORTS (linhas cianas, com distância em +%): se o preço subir até lá, os vendidos estouram. Abaixo ficam as dos LONGS (linhas vermelhas, com −%): se cair até lá, os comprados estouram. Na prática: 100x quebra com ~1% de movimento contra, 50x com ~2%, 25x com ~4%, 10x com ~10%, 5x com ~20%. A barra mais intensa (100x) é a zona mais próxima e mais cheia de gente.",
          sinalCompra:
            "A parede de baixo (longs 100x/50x) funciona como ímã e suporte: o preço costuma visitar essas zonas, liquidar quem estava alavancado e só então repicar. Muitos traders esperam o preço 'coletar' essa liquidez pra comprar.",
          sinalVenda:
            "A parede de cima (shorts) funciona como ímã e resistência: o preço sobe até estourar os vendidos e muitas vezes devolve depois. Boa região pra realizar lucro parcial.",
          cuidado:
            "São ESTIMATIVAS matemáticas, não ordens reais. O cálculo ignora taxa de manutenção e fees da corretora, então na vida real a liquidação vem um pouco ANTES do nível mostrado.",
        },
        {
          nome: "Mini Relatório",
          oQueE:
            "Um resumo mastigado, em frases prontas, juntando as zonas de liquidação, o funding, a razão long/short e as liquidações da sessão.",
          comoLer:
            "Cada frase tem uma cor de tom: verde = leitura pró-alta, vermelho = leitura pró-queda, âmbar = alerta (ex.: funding esticado, mercado lotado de long), cinza = neutro/informativo. A última linha sempre lembra: zonas são estimativa, não recomendação.",
          cuidado:
            "O relatório interpreta números, não prevê o futuro. Use como ponto de partida do seu estudo, nunca como ordem de compra ou venda.",
        },
        {
          nome: "Heatmap Nativo (Model 3 Heatmap)",
          oQueE:
            "Um mapa de calor de preço × tempo (últimas 24 horas) mostrando onde as liquidações DE FATO aconteceram na Binance Futures — só dado real, sem invenção.",
          comoLer:
            "Eixo vertical = preço; eixo horizontal = tempo. Tons de ciano/azul-petróleo = calor de SHORTS liquidados (resistência testada). Rosa/índigo = calor de LONGS liquidados (suporte testado). AMARELO = densidade crítica: muita grana liquidada naquele preço e hora. Passe o mouse numa célula pra ver preço e volume.",
          cuidado:
            "Se aparecer 'Sem liquidações no feed ainda', é porque nada foi liquidado desde que você abriu a página — ou a Binance está bloqueada na sua rede/região. O mapa enche com o tempo.",
        },
        {
          nome: "Mapa de Níveis Completo (CoinGlass embutido)",
          oQueE:
            "O heatmap profissional da CoinGlass, embutido na página, agregando liquidações estimadas de TODAS as exchanges — a versão completa do mapa de ímãs de preço.",
          comoLer:
            "Faixas mais quentes (amarelas/claras) = mais liquidez esperando pra ser liquidada naquele preço. O preço tende a caminhar em direção às faixas mais quentes. Se o quadro ficar em branco, é bloqueio de segurança da própria CoinGlass — use o botão 'CoinGlass ↗' pra abrir no site deles. O botão 'Coinank ↗' abre a alternativa em nova aba (eles não permitem embutir).",
          cuidado:
            "Heatmap mostra probabilidade de liquidez, não destino garantido. O preço pode nunca visitar uma zona quente.",
        },
      ],
      dicas: [
        "Combine as três camadas: zona calculada (escada) + calor real (heatmap nativo) + mapa CoinGlass. Quando as três apontam pro mesmo preço, o nível é muito relevante.",
        "Funding esticado + mercado lotado de um lado só + zona de liquidação próxima = receita clássica de squeeze. Fique atento, não alavancado.",
        "Nada aqui é recomendação de investimento. É leitura de mercado pra estudo — a decisão e o risco são sempre seus.",
      ],
    },

    // ─────────────────────────── SIMULADOR DE RISCO ───────────────────────────
    {
      id: "leverage",
      titulo: "Simulador de Risco",
      rota: "/dashboard/leverage",
      plano: "Grátis",
      resumo:
        "Uma calculadora de alavancagem pra você ver o risco ANTES de operar. Alavancagem é como pegar dinheiro emprestado da corretora pra apostar maior: 10x significa operar com 10 vezes o que você tem. O simulador mostra, numa matriz, quanto cada cenário renderia e — mais importante — em que preço a corretora fecharia sua posição à força (liquidação).",
      comoUsar: [
        "Digite seu Capital Inicial (a margem: o dinheiro que você de fato coloca na mesa).",
        "Digite o Preço de Entrada, ou clique em 'Reset para BTC' pra puxar o preço atual do Bitcoin.",
        "Escolha o lado da simulação: BULL (LONG) = apostando na alta, ou BEAR (SHORT) = apostando na queda.",
        "Leia a matriz: cada coluna é uma alavancagem (1x, 5x, 10x, 20x, 50x, 100x) e cada linha é um movimento de preço a favor (+1% até +100%).",
        "Em cada célula, veja o lucro estimado em dólar, o PnL em %, o selo de risco e o preço de liquidação ('Liq').",
        "Compare os cenários e pergunte a si mesmo: 'eu aguento o movimento CONTRA antes do movimento a favor?' — essa é a pergunta que a matriz responde.",
      ],
      indicadores: [
        {
          nome: "Capital Inicial (Margem)",
          oQueE:
            "O dinheiro que você deposita como garantia da operação. Na alavancagem, é só a sua parte — o resto é 'emprestado' pela corretora.",
          comoLer:
            "Tudo na matriz é calculado sobre esse valor. Exemplo: margem de US$ 1.000 a 10x = você controla uma posição de US$ 10.000.",
          cuidado:
            "Quando a operação dá errado, é a SUA margem que evapora primeiro — o empréstimo da corretora nunca fica no prejuízo, ela se protege liquidando você antes.",
        },
        {
          nome: "Preço de Entrada",
          oQueE: "O preço em que você abriria a operação simulada.",
          comoLer:
            "A matriz calcula, pra cada linha, o preço-alvo do movimento ('Price At') e o preço de liquidação a partir desse valor. O botão 'Reset para BTC' preenche com o preço real do Bitcoin.",
        },
        {
          nome: "Seletor BULL (LONG) / BEAR (SHORT)",
          oQueE:
            "Escolhe o lado da aposta: LONG lucra se o preço SOBE; SHORT lucra se o preço CAI.",
          comoLer:
            "No modo LONG os movimentos da matriz são de alta; no modo SHORT, de queda. A conta de risco é espelhada: o que liquida um long na queda, liquida um short na subida.",
        },
        {
          nome: "Lucro estimado + PnL %",
          oQueE:
            "Quanto a posição renderia em dólar e em porcentagem sobre a sua margem, em cada combinação de movimento × alavancagem. PnL = profit and loss (lucro e prejuízo).",
          comoLer:
            "A conta é direta: PnL% = movimento do preço × alavancagem. Um movimento de +5% a 10x = +50% sobre a margem. O mesmo vale ao contrário: -5% a 10x = -50%.",
          cuidado:
            "A matriz mostra os movimentos A FAVOR. Lembre sempre que o espelho existe: os mesmos +100% que te animam viram -100% (perda total) se o preço andar contra na mesma proporção.",
        },
        {
          nome: "Selo de risco (Seguro / Risco Alto / Risco Crítico / Liquidado)",
          oQueE:
            "Uma etiqueta colorida que traduz o perigo de cada célula, comparando o movimento com a folga da alavancagem (folga = 100 ÷ alavancagem).",
          comoLer:
            "Verde SEGURO = movimento usa menos da metade da folga. Laranja RISCO ALTO = passou da metade. Vermelho RISCO CRÍTICO = acima de 80% da folga (com ícone de alerta). Vermelho piscando LIQUIDADO (ícone de caveira) = o movimento contra desse tamanho já teria estourado a posição.",
          cuidado:
            "Repare como a coluna 100x fica LIQUIDADO já na primeira linha (1%): não existe célula segura em alavancagem extrema.",
        },
        {
          nome: "Preço de liquidação (Liq)",
          oQueE:
            "O preço em que a corretora fecha sua posição à força e fica com a sua margem. Aparece em cada célula da matriz.",
          comoLer:
            "A folga até a liquidação é aproximadamente 100 ÷ alavancagem (o simulador usa ~95% disso, imitando a taxa de manutenção real): 5x aguenta ~19% contra, 10x ~9,5%, 20x ~4,75%, 50x ~1,9%, 100x ~0,95%. Quanto maior a alavancagem, mais colado no preço de entrada fica o 'Liq'.",
          cuidado:
            "CUIDADO MÁXIMO AQUI: a 100x, um espirro de 1% — que acontece VÁRIAS vezes por dia em cripto — zera sua margem inteira. Não é 'perder um pouco': é perder TUDO que colocou, em segundos, sem chance de esperar recuperar. Pavios de vela e flash crashes (quedas relâmpago) caçam exatamente essas zonas. Se você é iniciante, a leitura honesta desta página é: alavancagem alta não é ferramenta de lucro, é máquina de liquidação.",
        },
        {
          nome: "Cartões de orientação (Capital Control · Volatilidade x Sobrevivência · Confluência Ótima)",
          oQueE:
            "Três cartões abaixo da matriz com regras práticas de gestão de risco usadas pela plataforma.",
          comoLer:
            "Capital Control: acima de 20x, a folga até a liquidação é menor que 5% — exige precisão cirúrgica. Volatilidade x Sobrevivência: a sugestão de estudo da casa é 5x-10x apenas em confluências de tempos gráficos maiores (4h+). Confluência Ótima: o cartão destaca 10x como teto de referência — nunca como promessa de resultado.",
        },
        {
          nome: "Cartões de insight (5x · 10x · 20x+ · Risk Management)",
          oQueE:
            "Quatro cartões no rodapé resumindo o perfil de cada faixa de alavancagem e a regra de ouro de gestão.",
          comoLer:
            "5x = folga de ~20%, perfil de swing trade (operações de dias) com análise no gráfico diário. 10x = folga de ~10%, exige entrada muito bem escolhida. 20x+ = zona crítica, risco de liquidação imediata em flash crashes. Risk Management: nunca comprometa mais de 3% do seu capital total numa única margem — assim, mesmo uma liquidação não te tira do jogo.",
          cuidado:
            "A regra dos 3% é a mais importante da página inteira. Quem arrisca 50% do capital numa posição alavancada precisa de sorte; quem arrisca 3% precisa só de disciplina.",
        },
      ],
      dicas: [
        "Antes de qualquer operação alavancada, abra o Mapa de Liquidez e veja se o SEU preço de liquidação cai dentro de uma zona-ímã. Se cair, o mercado vai te caçar.",
        "Simule sempre o cenário CONTRA primeiro: 'se cair X%, eu sobrevivo?'. Só depois olhe o lucro.",
        "Este simulador é ferramenta de estudo. Nenhum número aqui é promessa de ganho — operar alavancado pode gerar perda total da margem, e a responsabilidade pela decisão é 100% sua.",
      ],
    },
  ],
};
