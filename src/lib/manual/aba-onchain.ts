import type { AbaManual } from "./types";

export const ABA_ONCHAIN: AbaManual = {
  id: "onchain",
  titulo: "On-Chain",
  descricao:
    "Os indicadores de dentro da rede do Bitcoin que mostram em que fase do ciclo o mercado está: fundo, meio ou topo.",
  paginas: [
    {
      id: "on-chain",
      titulo: "Dados On-Chain",
      rota: "/dashboard/on-chain",
      plano: "Grátis",
      resumo:
        "Painel com 9 indicadores on-chain (dados registrados dentro da própria blockchain do Bitcoin) que ajudam a estimar a fase do ciclo: fundo, acumulação, neutro, cautela ou topo. Cada card mostra o valor atual, um gráfico histórico e um veredito mastigado — você não precisa saber interpretar o gráfico sozinho. No topo, o banner 'Posição no Ciclo' junta todos os indicadores num consenso único.",
      comoUsar: [
        "Abra a página e comece pelo banner 'Posição no Ciclo', no topo. Ele resume tudo em um selo: FUNDO / COMPRA, ACUMULAÇÃO, NEUTRO, CAUTELA ou TOPO / DISTRIBUIÇÃO.",
        "Veja quantos indicadores estão em zona de compra/acúmulo (ex.: '6 de 9'). Quanto maior o número, mais barato o mercado está pelo histórico.",
        "Desça e leia cada card. O número grande é o valor atual. O badge colorido ao lado traduz: verde = COMPRA / FUNDO, ciano = ACUMULAR, cinza = NEUTRO, âmbar = CAUTELA, rosa = VENDA / TOPO.",
        "No gráfico de cada card, a área verde é a zona de lucro (acima da linha de equilíbrio, marcada como 'base') e a área vermelha é a zona de prejuízo.",
        "Logo abaixo do título de cada card há uma frase-veredito que explica o que o valor atual significa naquele momento.",
        "As sub-abas DeFi & Stablecoins, Whale Tracker, Network Health e ETFs Crypto aparecem como 'em breve' — hoje funciona a aba Bitcoin On-Chain.",
        "Os dados são reais, da fonte BGeometrics (bitcoin-data.com), e são diários. Se aparecer 'Dado on-chain indisponível no momento', é o limite da API gratuita — a página se atualiza sozinha em até 1 hora.",
      ],
      indicadores: [
        {
          nome: "Posição no Ciclo (banner de consenso)",
          oQueE:
            "Um resumo automático dos 9 indicadores da página. Cada indicador dá uma 'nota' (de compra forte a venda forte) e o banner tira a média, mostrando um único veredito de ciclo.",
          comoLer:
            "Cada indicador vale de -2 (compra/fundo) a +2 (venda/topo). A média define o selo: até -1,2 = FUNDO / COMPRA (verde); de -1,2 a -0,4 = ACUMULAÇÃO (verde-água); de -0,4 a 0,4 = NEUTRO (cinza); de 0,4 a 1,2 = CAUTELA (âmbar); acima de 1,2 = TOPO / DISTRIBUIÇÃO (rosa). O texto abaixo mostra a contagem, ex.: '6 de 9 indicadores em zona de compra/acúmulo'. A grade de mini-cards traz o valor e a zona de cada indicador com a bolinha colorida.",
          sinalCompra:
            "Selo FUNDO / COMPRA ou ACUMULAÇÃO, com a maioria dos indicadores em verde/ciano. Historicamente, essas fases foram as melhores regiões de preço para estudo de acumulação de longo prazo.",
          sinalVenda:
            "Selo CAUTELA ou TOPO / DISTRIBUIÇÃO, com vários indicadores em âmbar/rosa. Historicamente, fases de risco crescente — momento de estudar redução de exposição, não de aumentar.",
          cuidado:
            "É uma leitura MACRO, de meses. Não é gatilho de compra ou venda de curto prazo — o próprio banner avisa isso. O mercado pode passar meses em 'CAUTELA' subindo, ou meses em 'COMPRA' caindo mais um pouco antes de virar.",
        },
        {
          nome: "MVRV — Long-Term Holders (LTH-MVRV)",
          oQueE:
            "Mede o lucro ou prejuízo das 'mãos fortes': quem segura moedas paradas há mais de 155 dias. Esse grupo é o 'smart money' (dinheiro inteligente) — costuma comprar no pânico e vender na euforia.",
          comoLer:
            "É uma razão entre o preço atual e o preço médio que os holders de longo prazo pagaram. Até 1 = Prejuízo (verde, compra): as mãos fortes estão no vermelho, capitulação histórica. De 1 a 1,5 = Lucro Moderado (acumular). De 1,5 a 3 = Lucro Elevado (cautela). Acima de 3 = Lucro Extremo (rosa, venda/topo).",
          sinalCompra:
            "Valor abaixo de 1. Se até quem aguenta anos segurando está no prejuízo, historicamente o mercado está perto de um fundo macro.",
          sinalVenda:
            "Valor acima de 3. As mãos fortes estão com lucro extremo e tendem a distribuir (vender aos poucos para os novatos) — zona típica de topo de ciclo.",
          cuidado:
            "Fundos podem demorar: o indicador pode ficar meses abaixo de 1 antes do mercado virar. Use como mapa de fase, não como cronômetro.",
        },
        {
          nome: "MVRV Ratio",
          oQueE:
            "Compara o preço de mercado do Bitcoin com o preço médio que TODA a rede pagou pelas moedas (valor realizado). É tipo perguntar: 'o mercado inteiro está no lucro ou no prejuízo?'.",
          comoLer:
            "Até 1 = Subvalorizado (verde, compra): o preço está abaixo do custo médio da rede — todo mundo, na média, está no prejuízo. De 1 a 2,4 = Neutro (mercado equilibrado). De 2,4 a 3,2 = Aquecido (âmbar, cautela): muito lucro não realizado. Acima de 3,2 = Euforia / Topo (rosa, venda).",
          sinalCompra:
            "MVRV abaixo de 1. Historicamente, quando a rede inteira ficou no prejuízo, foram regiões de fundo de ciclo.",
          sinalVenda:
            "MVRV acima de 3,2. Lucro generalizado e euforia — regiões onde os topos históricos aconteceram e as vendas em massa começaram.",
          cuidado:
            "Em ciclos mais recentes os topos vieram com MVRV cada vez menor (o indicador 'encolhe' com o tempo). Não espere o número exato do ciclo passado se repetir.",
        },
        {
          nome: "SOPR",
          oQueE:
            "Spent Output Profit Ratio: mostra se as moedas movimentadas HOJE estão sendo vendidas com lucro ou com prejuízo. É o termômetro diário de realização de lucro do mercado.",
          comoLer:
            "A linha de 1 é o empate (break-even): acima de 1, quem vendeu hoje vendeu no lucro; abaixo de 1, vendeu no prejuízo. Até 0,98 = Capitulação (verde, compra): venda no desespero. De 0,98 a 1,00 = Pivô (acumular): linha de equilíbrio, funciona como suporte/resistência psicológica. De 1,00 a 1,04 = Realização de Lucro (neutro, saudável em tendência de alta). Acima de 1,04 = Ganância (âmbar, cautela).",
          sinalCompra:
            "SOPR mergulha abaixo de 1 (gente vendendo no prejuízo) e depois repica acima de 1. Esse movimento de 'afundou e voltou' historicamente confirma fundo e reset do mercado.",
          sinalVenda:
            "SOPR acima de 1,04 por vários dias: realização de lucro agressiva, possível exaustão do movimento de curto prazo.",
          cuidado:
            "É o indicador mais 'nervoso' da página — mexe todo dia. Um dia isolado abaixo de 1 não é fundo, nem um dia acima de 1,04 é topo. Olhe o comportamento de vários dias.",
        },
        {
          nome: "NUPL",
          oQueE:
            "Net Unrealized Profit/Loss: o lucro (ou prejuízo) que a rede inteira TERIA se todo mundo vendesse agora. Mapeia a psicologia do mercado, do medo à euforia.",
          comoLer:
            "Abaixo de 0 = Capitulação (verde, compra): a rede está no prejuízo líquido — fundo de mercado. De 0 a 0,25 = Esperança / Medo (acumular): início de recuperação. De 0,25 a 0,50 = Otimismo / Ansiedade (neutro): lucro moderado. De 0,50 a 0,75 = Crença / Negação (âmbar, cautela): lucro elevado, risco crescente. Acima de 0,75 = Euforia / Ganância (rosa, venda): zona histórica de topo.",
          sinalCompra:
            "NUPL negativo. Todos os grandes fundos do Bitcoin aconteceram com a rede em prejuízo líquido — a fase de capitulação.",
          sinalVenda:
            "NUPL acima de 0,75. Euforia generalizada: quase todo mundo no lucro e ninguém acredita em queda — exatamente onde os topos históricos se formaram.",
          cuidado:
            "As faixas são fases psicológicas, não datas. O mercado pode ficar meses em 'Crença / Negação' antes de chegar (ou não) à euforia. Não pule etapas na cabeça.",
        },
        {
          nome: "MVRV Z-Score",
          oQueE:
            "Versão estatística do MVRV: mede o quanto o preço está esticado (para cima ou para baixo) em relação ao normal histórico, usando desvio-padrão (uma régua de 'quão fora do comum está').",
          comoLer:
            "Abaixo de 0 = Valor Profundo (verde, compra): fundo histórico raro. De 0 a 2 = Acumulação (abaixo da média, risco/retorno favorável). De 2 a 5 = Neutro / Alta (tendência saudável). De 5 a 7 = Aquecido (âmbar, cautela): aproximando da zona de topo. Acima de 7 = Topo de Ciclo (rosa, venda).",
          sinalCompra:
            "Z-Score negativo. Todos os fundos históricos do Bitcoin aconteceram com o Z-Score abaixo de zero — são janelas raras e curtas.",
          sinalVenda:
            "Z-Score acima de 7. Todos os topos históricos foram marcados nessa região.",
          cuidado:
            "As janelas extremas (abaixo de 0 e acima de 7) duram pouco tempo — semanas, não anos. No resto do tempo o indicador fica no meio, onde ele diz pouco. É bússola de ciclo, não sinal de trade.",
        },
        {
          nome: "Puell Multiple",
          oQueE:
            "Compara a receita diária dos mineradores (quem valida a rede e recebe bitcoins novos) com a média da receita do último ano. Mineradores desesperados marcam fundo; mineradores nadando em dinheiro marcam topo.",
          comoLer:
            "Até 0,5 = Capitulação Mineradora (verde, compra): receita muito abaixo da média — mineradores desligando máquinas, fundo histórico. De 0,5 a 1 = Acumulação (abaixo da média anual, zona saudável). De 1 a 2,5 = Neutro (receita equilibrada). De 2,5 a 4 = Aquecido (âmbar, cautela). Acima de 4 = Topo de Ciclo (rosa, venda).",
          sinalCompra:
            "Puell abaixo de 0,5. Quando minerar quase não paga a conta de luz, os mais fracos desistem — historicamente, isso coincidiu com fundos de ciclo.",
          sinalVenda:
            "Puell acima de 4. Receita eufórica dos mineradores — eles tendem a vender pesado nessa fase, e os topos históricos vieram junto.",
          cuidado:
            "O halving (corte pela metade da recompensa dos mineradores, a cada 4 anos) muda a receita de forma brusca e pode distorcer a leitura logo depois do evento.",
        },
        {
          nome: "Reserve Risk",
          oQueE:
            "Mede a relação entre o preço e a convicção de quem segura moedas há muito tempo. Responde: 'estou pagando caro ou barato pela confiança dos holders?'.",
          comoLer:
            "Valores minúsculos, por isso 4 casas decimais. Até 0,002 = Oportunidade Rara (verde, compra): convicção alta com preço baixo — o melhor risco/retorno do histórico. De 0,002 a 0,006 = Acumulação (zona historicamente atrativa). De 0,006 a 0,012 = Neutro (equilíbrio). De 0,012 a 0,025 = Aquecido (âmbar, cautela): preço subindo mais rápido que a convicção. Acima de 0,025 = Topo de Ciclo (rosa, venda).",
          sinalCompra:
            "Abaixo de 0,002: os holders seguram firme mesmo com preço baixo. Historicamente, a combinação mais favorável para estudo de compra de longo prazo.",
          sinalVenda:
            "Acima de 0,025: o preço ficou caro demais em relação à convicção — os holders antigos começam a ceder e vender. Zona de topo.",
          cuidado:
            "Os números são pequenos e fáceis de confundir (0,002 vs 0,02 é uma diferença de 10x!). Confie no badge colorido do card em vez de decorar casas decimais.",
        },
        {
          nome: "MVRV — Short-Term Holders (STH-MVRV)",
          oQueE:
            "MVRV só de quem comprou há MENOS de 155 dias — os novatos da rede. Como eles entram e saem rápido, esse indicador marca fundos e topos LOCAIS (de semanas), não o ciclo inteiro.",
          comoLer:
            "Até 0,9 = Prejuízo STH (verde, compra): os novatos estão no vermelho — fundo local provável. De 0,9 a 1,0 = Break-even (acumular): novatos no zero a zero, pivô importante. De 1,0 a 1,2 = Lucro Moderado (neutro). De 1,2 a 1,4 = Aquecido (âmbar, cautela): lucro alto de curto prazo. Acima de 1,4 = Topo Local (rosa, venda).",
          sinalCompra:
            "Valor abaixo de 0,9. Quando os compradores recentes estão no prejuízo, muitos capitulam — e historicamente isso limpa o mercado e forma fundos locais.",
          sinalVenda:
            "Valor acima de 1,4. Novatos com lucro rápido tendem a realizar em massa — costuma marcar topos locais.",
          cuidado:
            "É o irmão de CURTO prazo do LTH-MVRV: um fundo local aqui não significa fundo de ciclo. Num bear market (mercado de baixa longo), pode dar 'compra' várias vezes enquanto o preço segue caindo.",
        },
        {
          nome: "RHODL Ratio",
          oQueE:
            "Compara o dinheiro em moedas movimentadas na última semana com o dinheiro em moedas paradas há 1-2 anos. Mede se o mercado está dominado por especulação recente (topo) ou por acumulação paciente (fundo).",
          comoLer:
            "Números grandes, sem casas decimais. Até 1.000 = Acúmulo Profundo (verde, compra): moedas antigas dominam — fundo macro. De 1.000 a 10.000 = Acumulação (zona saudável de ciclo). De 10.000 a 30.000 = Neutro / Alta (ciclo em desenvolvimento). De 30.000 a 50.000 = Aquecido (âmbar, cautela). Acima de 50.000 = Topo de Ciclo (rosa, venda).",
          sinalCompra:
            "Abaixo de 1.000: quase ninguém especulando, só mãos pacientes segurando — padrão histórico de fundo macro.",
          sinalVenda:
            "Picos acima de 50.000: dinheiro novo girando freneticamente em relação ao dinheiro antigo — todos os topos de ciclo históricos tiveram picos nessa região.",
          cuidado:
            "A escala é gigante (de centenas a dezenas de milhares), então o gráfico parece 'achatado' na maior parte do tempo. O que importa são os extremos — o meio da escala diz pouco.",
        },
      ],
      dicas: [
        "Comece sempre pelo banner 'Posição no Ciclo' e só depois desça aos cards — o consenso evita que você se apegue a um único indicador.",
        "Dê mais peso quando VÁRIOS indicadores concordam. Um verde sozinho no meio de sete cinzas não é fundo.",
        "On-chain é leitura de meses, não de dias. Para timing de entrada, combine com as páginas de sinais e setups da plataforma.",
        "Os vereditos são baseados em faixas HISTÓRICAS. Cada ciclo do Bitcoin é um pouco diferente — trate como estudo de probabilidade, nunca como garantia.",
        "Os dados são diários e ficam guardados no seu navegador por 12 horas — não adianta ficar recarregando a página esperando número novo.",
      ],
    },
  ],
};
