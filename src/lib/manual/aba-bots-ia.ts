import type { AbaManual } from "./types";

/**
 * Aba "Bots & IA" — Minha Carteira (IA), Bot Swing Trade, Bot Scalping e Alertas.
 * Tudo aqui é ESTUDO de mercado: os bots leem dados reais e montam planos,
 * mas quem decide (e assume o risco) é sempre você.
 */
export const ABA_BOTS_IA: AbaManual = {
  id: "bots-ia",
  titulo: "Bots & IA",
  descricao:
    "Os robôs da plataforma: a IA que lê sua carteira, os bots que varrem a Binance atrás de setups e os alertas personalizados.",
  paginas: [
    {
      id: "carteira",
      titulo: "Minha Carteira (IA)",
      rota: "/dashboard/carteira",
      plano: "Pro",
      resumo:
        "Você cadastra as moedas que tem e a página mostra quanto vale tudo hoje, seu lucro ou prejuízo e uma leitura pronta de cada moeda: estado atual, zona de venda e zona de recompra. O botão 'Analisar com IA' pede pra inteligência artificial narrar tudo em português simples, com 2 cenários e probabilidade. Importante: nada aqui é ordem de compra ou venda — são pontos de estudo.",
      comoUsar: [
        "Digite o símbolo da moeda (ex.: BTC), a quantidade e, se quiser, o preço médio que você pagou.",
        "Clique em Adicionar. A moeda vira um cartão na tela.",
        "Olhe o resumo no topo: Valor Atual, Investido, Lucro/Prejuízo e Retorno.",
        "Em cada cartão, leia o bloco 'Leitura': Estado + Zona de venda + Zona de recompra.",
        "Clique em 'Analisar com IA' pra receber o texto completo da IA sobre a carteira inteira.",
        "Quer se aprofundar numa moeda? Clique em 'ver análise completa' no cartão dela.",
        "Pra tirar uma moeda, clique na lixeira do cartão.",
      ],
      indicadores: [
        {
          nome: "Valor Atual / Investido / Lucro-Prejuízo / Retorno",
          oQueE:
            "Os 4 números do topo: quanto sua carteira vale agora, quanto você colocou, a diferença em dólar e a diferença em porcentagem.",
          comoLer:
            "Verde = você está no lucro. Vermelho = está no prejuízo. Se você não informou o preço médio de compra, aparece '—' (a página não tem como calcular).",
          cuidado:
            "Os valores são em dólar (USD), não em real. E a carteira fica salva só no SEU navegador — se trocar de computador ou limpar o histórico, precisa cadastrar de novo.",
        },
        {
          nome: "Selo de tendência (no cartão da moeda)",
          oQueE:
            "Etiqueta ao lado do nome da moeda que resume a direção do preço nos últimos 7 dias: alta, baixa ou lateral (de lado).",
          comoLer:
            "Alta = preço subindo na semana. Baixa = caindo. Lateral = andando de lado, sem direção clara.",
          cuidado:
            "Tendência de 7 dias muda rápido. Use como foto do momento, não como garantia do futuro.",
        },
        {
          nome: "Estado (baseado no RSI)",
          oQueE:
            "Diz em uma frase como a moeda está: 'Sobrecomprado — atenção a realização' (subiu rápido demais), 'Sobrevendido — possível acúmulo' (caiu rápido demais) ou 'Neutro'.",
          comoLer:
            "É calculado com o RSI (termômetro de força de 0 a 100). RSI 70 ou mais = sobrecomprado (texto em vermelho). RSI 30 ou menos = sobrevendido (texto em azul-ciano). No meio = neutro (cinza).",
          sinalCompra:
            "'Sobrevendido' sugere que a queda pode estar esticada — zona que muita gente estuda pra acumular aos poucos.",
          sinalVenda:
            "'Sobrecomprado' sugere que a alta pode estar esticada — zona de estudar realizar uma parte do lucro.",
          cuidado:
            "Em queda forte, uma moeda pode ficar sobrevendida por dias e continuar caindo. O estado é um alerta, não um gatilho automático.",
        },
        {
          nome: "Zona de venda",
          oQueE:
            "Um preço sugerido pra estudar a realização de lucro (vender uma parte). É calculado perto da máxima recente da moeda (a resistência dos últimos dias).",
          comoLer:
            "Aparece em verde no cartão. Se o preço se aproximar dessa zona, é hora de PENSAR em realizar parte — não de vender tudo no automático.",
          sinalVenda:
            "Preço chegando na zona de venda + estado sobrecomprado = confluência (dois sinais apontando junto) pra estudar realização parcial.",
          cuidado:
            "É um ponto de estudo gerado por matemática simples (máxima recente), não uma previsão. O preço pode romper a zona e continuar subindo.",
        },
        {
          nome: "Zona de recompra",
          oQueE:
            "Um preço sugerido pra estudar uma nova compra. É calculado perto da mínima recente da moeda (o suporte dos últimos dias).",
          comoLer:
            "Aparece em azul-ciano no cartão. Se o preço cair até lá e segurar, é uma região que muita gente estuda pra recomprar.",
          sinalCompra:
            "Preço na zona de recompra + estado sobrevendido = confluência pra estudar compra escalonada (aos poucos).",
          cuidado:
            "Suporte pode ser perdido. Se o preço romper a zona pra baixo com força, o estudo se invalida — não insista 'porque estava barato'.",
        },
        {
          nome: "Análise por IA",
          oQueE:
            "Botão que envia os dados reais da sua carteira (preço, RSI, tendência, quantidade e resultado %) pra uma IA treinada com um catálogo de estratégias reais (confluência de RSI, Setup Compra, divergências, médias, funding, on-chain). A chave da IA fica no servidor — nada sensível passa pelo seu navegador.",
          comoLer:
            "Pra cada moeda, a IA responde: ESTADO atual em 1 linha, ZONA DE VENDA (realização parcial), ZONA DE RECOMPRA, 2 CENÁRIOS com probabilidade (ex.: 'alta X% se romper $Y / baixa Z% se perder $W') e onde o estudo se invalida (o stop lógico). Termina sempre com o aviso de que não é recomendação.",
          cuidado:
            "A IA usa SOMENTE os dados enviados — ela não sabe de notícias de última hora nem do seu perfil de risco. Probabilidade é estimativa de estudo, não garantia. A decisão final e o risco são sempre seus.",
        },
      ],
      dicas: [
        "Informe o preço médio de compra: sem ele, a página não mostra seu lucro/prejuízo.",
        "Se aparecer 'Moeda não encontrada no top 250', confira o símbolo — a busca cobre as 250 maiores moedas.",
        "Rode a IA de novo depois de movimentos fortes do mercado: a leitura muda junto com os dados.",
      ],
    },
    {
      id: "bot-swing",
      titulo: "Bot Swing Trade",
      rota: "/dashboard/bot",
      plano: "Pro",
      resumo:
        "Um robô que varre até 450 pares da Binance (moedas negociadas contra USDT) no tempo gráfico de 4 horas, procurando o 'Setup Compra' — a mesma matemática do indicador usado no TradingView. Quando as 4 condições batem, ele entrega o plano pronto: região de compra, 2 alvos parciais, saída total e stop. Roda no seu navegador, só lê dados públicos — não toca em saldo nenhum.",
      comoUsar: [
        "Clique em 'Rodar Análise' e acompanhe a barra de progresso (mostra quantos pares já foram varridos).",
        "Veja o resumo: quantos sinais cheios, quantos em formação, quantos pares varridos e o horário.",
        "Nos cartões verdes ('Setup Cheio'), leia o plano: região de compra, parciais, saída total e stop.",
        "Na lista amarela ('Em Formação'), veja o que falta pra cada moeda virar sinal cheio.",
        "Clique em qualquer sinal pra abrir a análise completa da moeda.",
        "A execução é sua: o bot NÃO compra nem vende sozinho. Você leva o plano pra sua corretora se decidir operar.",
        "O sinal vale pra barra FECHADA de 4h — rode de novo após cada fechamento (0h, 4h, 8h... no horário UTC).",
      ],
      indicadores: [
        {
          nome: "Condição 1 — RSI(14) entre 40 e 57",
          oQueE:
            "RSI é o termômetro de força do preço, de 0 a 100. O bot exige que esteja entre 40 e 57: a moeda saiu do fundo, mas ainda não subiu demais.",
          comoLer:
            "Abaixo de 40 = ainda fraca demais. Acima de 57 = já esticada, entrada tardia. A faixa 40–57 é o 'meio do caminho saudável' pra pegar o início do movimento.",
          cuidado:
            "RSI na faixa certa sozinho não é sinal — só vale junto com as outras 3 condições.",
        },
        {
          nome: "Condição 2 — Preço a ±2% da EMA(80)",
          oQueE:
            "EMA(80) é a média móvel exponencial de 80 barras — uma linha que acompanha a tendência e costuma funcionar como suporte dinâmico (chão que sobe junto com o preço). O bot exige o preço colado nela, no máximo 2% de distância.",
          comoLer:
            "Preço encostado na EMA80 = você compra perto do suporte, com stop curto. Longe da média = risco maior, o bot descarta.",
          sinalCompra:
            "Preço tocando a EMA80 por cima, em tendência de alta, é o ponto clássico de recompra do swing trade (operação de dias).",
          cuidado:
            "Se o preço FECHAR bem abaixo da EMA80, o suporte falhou — é exatamente por isso que o stop do plano fica logo abaixo dela.",
        },
        {
          nome: "Condição 3 — Volume vs SMA(20): de 0% a +500%",
          oQueE:
            "Compara o volume (quantidade negociada) da barra atual com a média das últimas 20 barras. O bot quer volume igual ou acima da média, mas sem exagero absurdo.",
          comoLer:
            "Volume acima da média = tem gente comprando de verdade, o movimento tem 'combustível'. O teto de +500% evita picos de manipulação ou clímax de exaustão.",
          cuidado:
            "Alta de preço SEM volume é desconfiável — por isso essa condição existe. Ela filtra rompimentos 'vazios'.",
        },
        {
          nome: "Condição 4 — Gatilho de rompimento",
          oQueE:
            "A máxima da barra atual precisa superar a máxima da barra anterior. É a confirmação final de que a força apareceu.",
          comoLer:
            "Sem o gatilho, o setup fica 'armado mas não disparado' — a moeda cai na lista 'Em Formação' esperando essa confirmação.",
          cuidado:
            "O bot avalia a última barra de 4h JÁ FECHADA, pra evitar sinal falso de barra ainda em andamento.",
        },
        {
          nome: "Cartão de sinal: Região de compra / Parcial 1 / Parcial 2 / Saída total / Stop / Risco %",
          oQueE:
            "O plano pronto de cada sinal cheio. Região de compra = a faixa entre a EMA80 e o preço atual. Stop = logo abaixo do suporte (EMA80/mínima recente). Os alvos usam múltiplos de R (R = distância da entrada até o stop): Parcial 1 = 1R, Parcial 2 = 2R, Saída total = 3,5R.",
          comoLer:
            "Exemplo: se o risco (R) é 3%, a Parcial 1 fica 3% acima da entrada, a Parcial 2 fica 6% e a saída total 10,5%. A ideia é realizar uma parte do lucro em cada alvo e proteger o resto. 'Risco %' mostra quanto você perde da entrada até o stop se der errado.",
          sinalVenda:
            "Cada parcial é um ponto de estudo pra REALIZAR uma parte — não espere a saída total com a posição inteira.",
          cuidado:
            "O stop não é enfeite: se o preço cair até lá, o estudo se invalidou. Sem stop, uma operação errada come o lucro de várias certas.",
        },
        {
          nome: "Em Formação (3 de 4 condições)",
          oQueE:
            "Lista de moedas em que só falta 1 condição pra fechar o setup. Ao lado de cada uma aparece exatamente o que falta: RSI, preço/EMA80, volume ou gatilho.",
          comoLer:
            "Também mostra o RSI atual e a distância % até a EMA80. Funciona como watchlist (lista de observação): se a condição que falta bater na próxima barra, vira sinal cheio.",
          cuidado:
            "'Em formação' NÃO é sinal de compra. É pra acompanhar, não pra antecipar a entrada.",
        },
        {
          nome: "Resumo da varredura (sinais / formação / pares / erros / horário)",
          oQueE:
            "Linha que aparece após a análise: quantos sinais cheios (verde), quantos em formação (amarelo), quantos pares foram varridos, quantos deram erro e a hora da varredura.",
          comoLer:
            "Zero sinal é resposta normal e honesta: significa que nenhuma moeda passou nos 4 filtros agora. Muitos erros = a Binance pode estar bloqueada na sua rede/região.",
          cuidado:
            "A varredura é uma foto do momento. Ela envelhece: rode de novo após o próximo fechamento de 4h.",
        },
      ],
      dicas: [
        "Sinais são ordenados pela distância até a EMA80 — os primeiros da lista estão mais 'colados' no suporte.",
        "Stablecoins (moedas atreladas ao dólar) são excluídas automaticamente da varredura.",
        "Conexão com corretora pra execução automática é plano FUTURO (exige backend seguro). Hoje o bot entrega sinal + plano; quem executa é você.",
        "Se todas as requisições falharem, sua rede pode bloquear a Binance — tente outra rede ou horário.",
      ],
    },
    {
      id: "bot-scalp",
      titulo: "Bot Scalping",
      rota: "/dashboard/scalp",
      plano: "Pro",
      resumo:
        "Radar de operações rápidas (scalp = entra e sai em minutos/horas). Ele varre até 300 pares da Binance atrás de moedas entrando em sobrevenda extrema no gráfico de 5 minutos, e mostra a confluência com os tempos maiores (1h, 4h e Diário). Antes dos sinais, exibe o contexto do mercado: o RSI do Bitcoin e das grandes altcoins. Só lê dados públicos — não opera sozinho.",
      comoUsar: [
        "Clique em 'Rodar Radar' e aguarde a varredura.",
        "Primeiro olhe o 'Contexto do Mercado': o RSI do Bitcoin e das Altcoins nos 4 tempos gráficos.",
        "Se aparecer o selo 'Mercado sobrevendido — favorável a scalp', o cenário geral ajuda.",
        "Nos cartões, priorize: mais timeframes sobrevendidos (ex.: 3/4 ou 4/4) e o selo rosa 'Extrema'.",
        "Cada cartão traz Entrada, Alvo rápido e Stop — operação de curtíssimo prazo, respeite o stop.",
        "Clique num cartão pra abrir a análise completa da moeda antes de decidir qualquer coisa.",
      ],
      indicadores: [
        {
          nome: "RSI por timeframe (Diário / 4h / 1h / 5m)",
          oQueE:
            "O termômetro de força (RSI de 14 períodos) calculado em 4 tempos gráficos ao mesmo tempo, com cores pra bater o olho.",
          comoLer:
            "Rosa = 15 ou menos (sobrevenda EXTREMA). Azul-ciano = 30 ou menos (sobrevendido). Vermelho = 70 ou mais (sobrecomprado). Cinza = neutro. O 5m é o gatilho; os tempos maiores dão o contexto.",
          sinalCompra:
            "RSI baixo em vários tempos ao mesmo tempo = a queda está esticada em todas as 'lentes' — repique (recuperação rápida) fica mais provável.",
          cuidado:
            "Sobrevenda extrema costuma acontecer em queda forte. O repique é uma aposta CONTRA o movimento — por isso o alvo é curto e o stop é obrigatório.",
        },
        {
          nome: "Selo 'Extrema' (rosa, com chama)",
          oQueE:
            "Destaque dado quando o RSI de 5 minutos está em 15 ou menos — pânico de curtíssimo prazo.",
          comoLer:
            "O cartão inteiro ganha borda rosa e brilho. São os candidatos mais esticados do radar.",
          sinalCompra:
            "Historicamente, RSI 5m nesse nível costuma preceder repiques rápidos — mas é o tipo de estudo mais arriscado da plataforma.",
          cuidado:
            "'Extrema' não significa 'fundo garantido'. Em notícia ruim ou capitulação, o preço pode continuar despencando com o RSI colado no chão.",
        },
        {
          nome: "Contagem de TFs sobrevendidos (X/4)",
          oQueE:
            "Quantos dos 4 tempos gráficos (Diário, 4h, 1h, 5m) estão com RSI em 30 ou menos ao mesmo tempo.",
          comoLer:
            "1/4 = só o curtíssimo prazo esticou (sinal fraco). 3/4 ou 4/4 = a sobrevenda aparece em todas as lentes (confluência forte). O radar já ordena os cartões assim: mais confluência primeiro.",
          cuidado:
            "4/4 sobrevendido também pode significar tendência de baixa forte no Diário. Confluência aumenta a probabilidade do estudo, não elimina o risco.",
        },
        {
          nome: "Contexto do Mercado — BTC + Altcoins (TOTAL2)",
          oQueE:
            "Duas linhas com o RSI do Bitcoin e das altcoins nos 4 tempos gráficos. 'TOTAL2' aqui é uma aproximação: a média do RSI de 8 grandes alts (ETH, SOL, BNB, XRP, ADA, AVAX, DOGE e LINK), porque o índice TOTAL2 oficial não tem dados públicos por API.",
          comoLer:
            "Se Bitcoin E altcoins estão sobrevendidos nos tempos curtos (5m ou 1h com RSI 40 ou menos), aparece o selo 'Mercado sobrevendido — favorável a scalp': o repique tende a puxar o mercado todo junto.",
          cuidado:
            "Scalp long (aposta na subida) contra um Bitcoin despencando é remar contra a maré. Sem o contexto favorável, os sinais individuais perdem força.",
        },
        {
          nome: "Entrada / Alvo rápido / Stop",
          oQueE:
            "O plano de cada cartão: Entrada = preço atual da moeda; Alvo rápido = +2% acima da entrada; Stop = 1,2% abaixo.",
          comoLer:
            "É matemática de scalp: ganhar pouco, rápido, e perder menos ainda quando erra. Alvo verde, stop vermelho.",
          sinalVenda:
            "Bateu o alvo de +2%? Realize. Segurar posição de scalp 'pra ver até onde vai' é o erro clássico que transforma trade rápido em prejuízo longo.",
          cuidado:
            "O stop de 1,2% estoura MUITO rápido em moeda volátil. Scalp exige tela ligada e disciplina — não é modalidade pra deixar de lado e olhar depois.",
        },
        {
          nome: "Resumo da varredura (extremas / sobrevendidas / pares / erros / horário)",
          oQueE:
            "Contadores após a varredura: quantas moedas em sobrevenda extrema (rosa), quantas sobrevendidas (ciano), pares varridos, erros e o horário.",
          comoLer:
            "Lista vazia significa que nenhuma moeda está com RSI 5m em 30 ou menos agora — mercado calmo ou subindo. Rode de novo em alguns minutos.",
          cuidado:
            "O RSI de 5 minutos muda MUITO rápido. A varredura vale pro instante em que rodou.",
        },
      ],
      dicas: [
        "Melhor combinação: selo de mercado sobrevendido + cartão 'Extrema' + 3 ou 4 TFs sobrevendidos.",
        "Scalp é a modalidade mais arriscada e mais rápida da plataforma. Se está começando, apenas OBSERVE o radar por um tempo antes de pensar em operar.",
        "O bot não executa nada sozinho — ele é radar + plano de estudo. A operação (e o risco) é sua.",
      ],
    },
    {
      id: "alerts",
      titulo: "Alertas",
      rota: "/dashboard/alerts",
      plano: "Grátis",
      resumo:
        "Página onde você monta suas regras personalizadas de vigilância: escolhe um indicador (Score, RSI, Variação 24h ou Volume/MCap), uma condição (acima ou abaixo de um valor) e etiqueta como sinal de Compra ou Venda. As regras ficam salvas na sua conta e você liga, desliga e apaga quando quiser. O sininho no topo do painel leva direto pra cá.",
      comoUsar: [
        "Clique em 'Novo Alerta'.",
        "Digite a moeda (ex.: BTC) ou deixe 'any' pra valer pra qualquer moeda.",
        "Escolha o indicador: Score, RSI, Variação 24h (%) ou Volume/MCap (%).",
        "Escolha a direção: acima ou igual (≥) ou abaixo ou igual (≤), e o valor.",
        "Marque o tipo: Compra (regra de entrada) ou Venda (regra de proteção/realização).",
        "Na lista, use o botão de energia pra ligar/desligar e a lixeira pra apagar.",
      ],
      indicadores: [
        {
          nome: "Regra por Score",
          oQueE:
            "Cria um alerta em cima do Score — a nota que o motor de sinais da plataforma dá pra cada moeda, somando RSI, médias, volume e sentimento.",
          comoLer:
            "Score alto (5 ou mais) puxa pra compra; score baixo (0 ou menos) puxa pra venda. Ex.: 'Score ≥ 8' marca só os sinais mais fortes do motor.",
          sinalCompra: "Regra clássica de compra: Score ≥ 5 (ou ≥ 8 pra ser bem seletivo).",
          sinalVenda: "Regra clássica de venda/cautela: Score ≤ 0.",
          cuidado:
            "O Score resume vários indicadores num número só — bom pra filtrar, mas sempre abra a análise completa da moeda antes de decidir.",
        },
        {
          nome: "Regra por RSI",
          oQueE:
            "Cria um alerta em cima do RSI (termômetro de força de 0 a 100) de uma moeda ou de qualquer moeda.",
          comoLer:
            "RSI ≤ 30 = sobrevendido (caiu rápido demais). RSI ≥ 70 = sobrecomprado (subiu rápido demais).",
          sinalCompra: "Regra comum: 'RSI ≤ 30' pra marcar zonas de possível fundo.",
          sinalVenda: "Regra comum: 'RSI ≥ 70' pra marcar zonas de possível exaustão da alta.",
          cuidado:
            "Em tendência forte, o RSI fica extremo por muito tempo. A regra marca a condição; a leitura do contexto é sua.",
        },
        {
          nome: "Regra por Variação 24h (%)",
          oQueE:
            "Cria um alerta em cima de quanto a moeda subiu ou caiu nas últimas 24 horas.",
          comoLer:
            "Ex.: '≤ -10' marca quedas fortes no dia (possível pânico exagerado); '≥ 15' marca disparadas (possível euforia).",
          cuidado:
            "Variação grande sem volume pode ser manipulação em moeda pequena. Cruze com o resto antes de qualquer decisão.",
        },
        {
          nome: "Regra por Volume/MCap (%)",
          oQueE:
            "Cria um alerta em cima da relação entre o volume negociado e o valor de mercado da moeda — mede se ela está 'quente' (girando muito dinheiro pro tamanho dela).",
          comoLer:
            "Percentual alto = interesse anormal na moeda (movimento com combustível). Baixo = moeda parada, pouco interesse.",
          cuidado:
            "Volume alto acompanha tanto altas quanto quedas fortes — ele diz que TEM movimento, não pra qual lado.",
        },
        {
          nome: "Tipo de Sinal (COMPRA / VENDA) e status (ligado/desligado)",
          oQueE:
            "Cada alerta ganha uma etiqueta: COMPRA (verde) ou VENDA (vermelha), pra você organizar suas regras de entrada e de proteção. A bolinha pulsando mostra que a regra está ativa; o botão de energia pausa sem apagar.",
          comoLer:
            "Na lista, cada linha mostra a moeda, a regra resumida (ex.: 'RSI ≤ 30') e a etiqueta. Use como o seu checklist pessoal de condições pra vigiar no dia a dia.",
          cuidado:
            "Hoje os alertas funcionam como sua lista de regras salvas na conta — a notificação automática (aviso por push/e-mail quando a condição bater) é uma evolução futura da plataforma. Confira suas regras junto com o painel de sinais.",
        },
      ],
      dicas: [
        "Comece com 2 ou 3 regras simples (ex.: 'BTC com RSI ≤ 30' e 'any com Score ≥ 8') em vez de dezenas.",
        "Use 'any' pra regras de mercado (qualquer moeda) e o símbolo exato pra vigiar as moedas da sua carteira.",
        "Alerta é convite pra ANALISAR, não pra operar no reflexo: quando uma condição bater, abra a análise completa da moeda.",
      ],
    },
  ],
};
