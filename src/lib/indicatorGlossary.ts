/**
 * Glossário central de indicadores — fonte única das explicações "fáceis"
 * usadas pelos ícones de ajuda (InfoHint) em todos os painéis.
 * Linguagem para iniciante: o que é + como usar pra comprar/vender.
 */
export interface GlossaryEntry {
  term: string;
  what: string;
  how?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // ── Sentimento / mercado ──
  fearGreed: {
    term: "Medo & Ganância",
    what: "Mede a emoção do mercado de 0 a 100, do pânico à euforia.",
    how: "Abaixo de 30 = medo (costuma ser bom comprar). Acima de 70 = ganância (risco de topo, hora de realizar).",
  },
  altseason: {
    term: "Altcoin Season",
    what: "Mostra quantas altcoins do top 50 estão superando o Bitcoin nos últimos 30 dias.",
    how: "Acima de 75 = temporada de altcoins (alts performam melhor). Abaixo de 25 = dinheiro foca no BTC.",
  },
  btcDominance: {
    term: "Dominância do BTC",
    what: "Quanto do valor total do mercado cripto é só Bitcoin.",
    how: "Subindo = capital buscando segurança no BTC. Caindo = capital migrando pra altcoins (mais risco/retorno).",
  },
  breadth: {
    term: "Amplitude de Mercado",
    what: "Percentual das 100 maiores moedas que estão em alta nas últimas 24h.",
    how: "Acima de 60% = mercado forte e generalizado. Abaixo de 35% = fraqueza, poucos puxando o índice.",
  },
  stables: {
    term: "Dominância de Stablecoins",
    what: "Quanto do mercado está parado em stablecoins (USDT, USDC...). É a 'caixa lateral'.",
    how: "Alto = muita gente em dinheiro esperando (medo/pólvora seca). Caindo = capital entrando em risco (confiança).",
  },
  marketCap: {
    term: "Capitalização Total",
    what: "Soma do valor de todas as criptomoedas juntas.",
    how: "Crescendo com volume = mercado aquecido. Encolhendo = ciclo de baixa / saída de capital.",
  },
  volume24h: {
    term: "Volume 24h",
    what: "Quanto foi negociado no mercado nas últimas 24 horas.",
    how: "Movimento de preço COM volume alto = confiável. Sem volume = pode ser manipulação ou ruído.",
  },
  // ── Momentum / preço ──
  rsi: {
    term: "RSI (Força Relativa)",
    what: "Termômetro de momentum de 0 a 100 que mede se o ativo subiu/caiu rápido demais.",
    how: "Abaixo de 30 = sobrevendido (possível fundo/compra). Acima de 70 = sobrecomprado (possível topo/venda).",
  },
  rsiBtc: {
    term: "RSI do Bitcoin",
    what: "O RSI aplicado ao BTC — referência de momentum do líder do mercado.",
    how: "BTC sobrevendido (<30) costuma arrastar o mercado pra cima; sobrecomprado (>70) liga o alerta de topo.",
  },
  movingAverages: {
    term: "Médias Móveis (MAs)",
    what: "Preço médio suavizado em X períodos (ex.: MA20, MA50, MA200).",
    how: "Preço acima das médias = tendência de alta. Abaixo = tendência de baixa. Cruzamentos marcam viradas.",
  },
  macd: {
    term: "MACD",
    what: "Compara duas médias móveis pra medir força e direção da tendência.",
    how: "Cruzamento da linha pra cima = sinal de compra; pra baixo = sinal de venda.",
  },
  bollinger: {
    term: "Bandas de Bollinger",
    what: "Uma faixa em volta da média que mede volatilidade.",
    how: "Preço colando na banda de cima = esticado (caro). Na de baixo = esticado (barato). Extremos antecipam reversão.",
  },
  fibonacci: {
    term: "Fibonacci / Golden Pocket",
    what: "Níveis onde o preço costuma reagir após um movimento. O 0.618 é o 'golden pocket'.",
    how: "Preço recuando até o 0.618 numa tendência de alta = zona clássica de compra institucional.",
  },
  // ── Tendência ──
  trend: {
    term: "Tendência",
    what: "Direção predominante do preço, lida pela posição do preço frente às médias móveis.",
    how: "ALTA = preço acima das médias (favorece compra). BAIXA = abaixo (favorece venda/cautela). LATERAL = sem direção, evite forçar.",
  },
  // ── Derivativos ──
  fundingRate: {
    term: "Funding Rate",
    what: "Taxa que traders alavancados pagam entre si nos futuros perpétuos.",
    how: "Negativo = shorts pagando (excesso de pessimismo → possível squeeze de alta). Muito positivo = euforia alavancada (risco).",
  },
  openInterest: {
    term: "Open Interest",
    what: "Total de contratos de futuros em aberto no mercado.",
    how: "Subindo com o preço = dinheiro novo confirmando o movimento. Caindo = posições fechando (movimento perde força).",
  },
  liquidations: {
    term: "Liquidações",
    what: "Posições alavancadas fechadas à força quando o preço vai contra elas.",
    how: "Muitos LONGS liquidados = queda exagerada (possível fundo). Muitos SHORTS liquidados = alta exagerada (possível topo).",
  },
  // ── Motor de sinais MTF ──
  mtfConfluence: {
    term: "Confluência Multi-Timeframe",
    what: "Sinal fica forte quando o RSI se alinha em vários tempos gráficos ao mesmo tempo.",
    how: "Se Diário + 4h + 1h estão sobrevendidos juntos, a chance de repique pra cima é muito maior. O 5m é só o gatilho de entrada.",
  },
  mtfScore: {
    term: "Score de Confluência",
    what: "Soma de pesos por timeframe alinhado: Diário=3, 4h=2, 1h=1 (máximo 6).",
    how: "Score 3+ = confluência forte (alta confiança). 1-2 = fraco, trate como observação, não entrada.",
  },
  mtfGatilho: {
    term: "Gatilho (5m)",
    what: "Confirmação no 5 minutos de que o setup de timeframes maiores está pronto AGORA.",
    how: "Com gatilho aceso = entrada no momento. Sem gatilho = setup em formação, aguarde disparar.",
  },
  confluencia: {
    term: "Confluência",
    what: "Vários indicadores independentes apontando para a mesma direção ao mesmo tempo.",
    how: "Quanto mais sinais concordam (RSI + tendência + on-chain + funding), maior a confiança no trade.",
  },
  goldenZone: {
    term: "Golden Zone",
    what: "Faixa de preço historicamente de fundo, onde o risco/retorno de compra é melhor.",
    how: "Ativo entrando na Golden Zone = candidato a compra com stop curto abaixo da zona.",
  },
  // ── On-chain ──
  mvrv: {
    term: "MVRV",
    what: "Compara o preço de mercado com o custo médio que a rede pagou pelas moedas.",
    how: "Abaixo de 1 = mercado todo no prejuízo (fundo histórico). Acima de ~3,2 = topo histórico típico.",
  },
  sopr: {
    term: "SOPR",
    what: "Indica se as moedas movimentadas hoje estão sendo vendidas com lucro (>1) ou prejuízo (<1).",
    how: "Quedas abaixo de 1 que repicam confirmam fundo/capitulação. Acima de 1 = realização de lucro.",
  },
  // ── Macro / TradFi ──
  tradfi: {
    term: "Mercados TradFi",
    what: "Ativos tradicionais que influenciam a cripto: S&P 500, NASDAQ, VIX, Ouro, Dólar (DXY).",
    how: "Dólar (DXY) forte costuma pressionar a cripto pra baixo. VIX alto (>20) = medo nas bolsas = risco-off.",
  },
  sessions: {
    term: "Sessões Globais",
    what: "Horários em que as principais praças (Sydney, Tóquio, Londres, Nova York) estão operando.",
    how: "Sobreposição de sessões (ex.: Londres + NY) = mais liquidez e volatilidade — janelas mais fortes pra operar.",
  },
  zonaOportunidade: {
    term: "Zona de Oportunidade Institucional",
    what: "Alerta de COMPRA do Oráculo: dispara quando o mercado está em Medo Extremo (Fear & Greed ≤ 30) E há um setup de compra com alta confluência (score ≥ 5).",
    how: "É quando o 'dinheiro inteligente' costuma acumular — pânico do varejo + ativo sobrevendido. Historicamente, boas zonas de fundo. Entre com stop curto.",
  },
  alertaDistribuicao: {
    term: "Alerta de Distribuição",
    what: "Alerta de VENDA do Oráculo: dispara em Ganância Extrema (Fear & Greed ≥ 75) somada a um setup de venda forte (score ≤ -5).",
    how: "Euforia + sobrecompra = zona onde grandes players costumam realizar lucro. Hora de proteger ganhos / reduzir posição.",
  },
  scannerInstitucional: {
    term: "Scanner Institucional",
    what: "Estado neutro do Oráculo: o motor está varrendo o mercado, mas ainda não há um setup de compra ou venda forte o suficiente.",
    how: "Sem trade claro agora — espere o alinhamento (Medo/Ganância + sinal) ou opere com cautela dentro do range.",
  },
  whale: {
    term: "Baleias (Whales)",
    what: "Grandes players com ordens acima de US$ 1 milhão que movem o mercado.",
    how: "Acompanhar o fluxo das baleias ajuda a operar a favor do dinheiro grande, não contra ele.",
  },
};
