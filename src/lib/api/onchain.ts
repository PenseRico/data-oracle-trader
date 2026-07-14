import { useQuery } from "@tanstack/react-query";

/**
 * On-chain metrics (MVRV, SOPR, NUPL, ...) servidos pela API pública gratuita
 * da BGeometrics (bitcoin-data.com). CORS liberado → o front consome direto.
 *
 * ⚠️ Limite gratuito: 10 requisições/hora. Como estas métricas são DIÁRIAS,
 * cacheamos cada série por 12h em localStorage. Um usuário recorrente faz 0
 * requisições. Em produção com muitos assinantes, troque `fetchSeries` por um
 * endpoint do seu backend (Supabase Edge Function com cron diário) que busca 1x
 * e serve todos — o resto da página continua igual.
 */

const BASE = "https://bitcoin-data.com/v1";
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12h

export interface OnChainPoint {
  time: number; // unix seconds
  value: number;
}

export type ZoneTone = "buy" | "accumulate" | "neutral" | "caution" | "sell";

export interface OnChainZone {
  /** Limite superior (inclusivo) desta zona. A última zona usa Infinity. */
  max: number;
  label: string;
  tone: ZoneTone;
  note: string;
}

export interface OnChainMetricDef {
  id: string;
  /** Segmento do path em bitcoin-data.com/v1/<endpoint> */
  endpoint: string;
  /** Chave do valor no JSON de resposta (ex.: "mvrv", "lthMvrv"). */
  valueKey: string;
  label: string;
  tag: string;
  /** Linha de corte do gráfico (lucro acima / prejuízo abaixo). */
  baseline: number;
  precision: number;
  /** Explicação pedagógica curta — "aprenda enquanto opera". */
  about: string;
  /** Zonas em ordem crescente de `max`. */
  zones: OnChainZone[];
  category: "btc" | "custom";
}

/**
 * Registro central. Adicionar uma métrica nova (inclusive o seu indicador custom)
 * = adicionar um objeto aqui. Nenhum componente precisa mudar.
 */
export const ONCHAIN_METRICS: OnChainMetricDef[] = [
  {
    id: "lth-mvrv",
    endpoint: "lth-mvrv",
    valueKey: "lthMvrv",
    label: "MVRV — Long-Term Holders",
    tag: "Smart Money",
    baseline: 1,
    precision: 2,
    about:
      "Mede o lucro/prejuízo dos holders de longo prazo (moedas paradas há +155 dias). LTHs são o 'smart money': quando vendem em massa, marcam topos; quando acumulam no prejuízo, marcam fundos.",
    zones: [
      { max: 1, label: "Prejuízo", tone: "buy", note: "Mãos fortes no prejuízo — capitulação histórica, fundo macro." },
      { max: 1.5, label: "Lucro Moderado", tone: "accumulate", note: "Zona de acumulação saudável — bom momento histórico." },
      { max: 3, label: "Lucro Elevado", tone: "caution", note: "LTHs em lucro alto — atenção ao início de distribuição." },
      { max: Infinity, label: "Lucro Extremo", tone: "sell", note: "Distribuição de mãos fortes — zona de topo de ciclo." },
    ],
    category: "btc",
  },
  {
    id: "mvrv",
    endpoint: "mvrv",
    valueKey: "mvrv",
    label: "MVRV Ratio",
    tag: "Mercado Total",
    baseline: 1,
    precision: 2,
    about:
      "Razão entre o valor de mercado e o valor realizado (custo médio agregado da rede). Abaixo de 1, o mercado inteiro está no prejuízo — zona historicamente de fundo.",
    zones: [
      { max: 1, label: "Subvalorizado", tone: "buy", note: "Preço abaixo do custo médio da rede — capitulação/fundo." },
      { max: 2.4, label: "Neutro", tone: "neutral", note: "Mercado equilibrado." },
      { max: 3.2, label: "Aquecido", tone: "caution", note: "Lucro não realizado elevado." },
      { max: Infinity, label: "Euforia / Topo", tone: "sell", note: "Zona histórica de topo e distribuição." },
    ],
    category: "btc",
  },
  {
    id: "sopr",
    endpoint: "sopr",
    valueKey: "sopr",
    label: "SOPR",
    tag: "Realização de Lucro",
    baseline: 1,
    precision: 3,
    about:
      "Spent Output Profit Ratio: o mercado está realizando lucro (>1) ou prejuízo (<1) nas moedas movimentadas hoje. Quedas abaixo de 1 que repicam confirmam suporte; a linha de 1 funciona como pivô.",
    zones: [
      { max: 0.98, label: "Capitulação", tone: "buy", note: "Vendendo no prejuízo — reset; repique acima de 1 confirma fundo." },
      { max: 1.0, label: "Pivô (break-even)", tone: "accumulate", note: "Linha de equilíbrio — suporte/resistência psicológico." },
      { max: 1.04, label: "Realização de Lucro", tone: "neutral", note: "Lucro realizado — saudável dentro de tendência." },
      { max: Infinity, label: "Ganância", tone: "caution", note: "Realização agressiva — possível exaustão de curto prazo." },
    ],
    category: "btc",
  },
  {
    id: "nupl",
    endpoint: "nupl",
    valueKey: "nupl",
    label: "NUPL",
    tag: "Sentimento de Rede",
    baseline: 0,
    precision: 2,
    about:
      "Net Unrealized Profit/Loss: o lucro/prejuízo não realizado de toda a rede, do medo (negativo) à euforia (>0,75). Mapeia o ciclo psicológico do mercado.",
    zones: [
      { max: 0, label: "Capitulação", tone: "buy", note: "Lucro líquido negativo — fundo de mercado." },
      { max: 0.25, label: "Esperança / Medo", tone: "accumulate", note: "Início de recuperação." },
      { max: 0.5, label: "Otimismo / Ansiedade", tone: "neutral", note: "Lucro moderado na rede." },
      { max: 0.75, label: "Crença / Negação", tone: "caution", note: "Lucro elevado — risco crescente." },
      { max: Infinity, label: "Euforia / Ganância", tone: "sell", note: "Zona histórica de topo." },
    ],
    category: "btc",
  },
  {
    id: "mvrv-zscore",
    endpoint: "mvrv-zscore",
    valueKey: "mvrvZscore",
    label: "MVRV Z-Score",
    tag: "Ciclo Macro",
    baseline: 0,
    precision: 2,
    about:
      "Versão normalizada do MVRV por desvio-padrão. Valores negativos marcaram todos os fundos históricos; acima de 7, todos os topos. Excelente bússola de ciclo de longo prazo.",
    zones: [
      { max: 0, label: "Valor Profundo", tone: "buy", note: "Z-Score negativo — fundo histórico raro." },
      { max: 2, label: "Acumulação", tone: "accumulate", note: "Abaixo da média — risco/retorno favorável." },
      { max: 5, label: "Neutro / Alta", tone: "neutral", note: "Tendência saudável." },
      { max: 7, label: "Aquecido", tone: "caution", note: "Aproximando da zona de topo." },
      { max: Infinity, label: "Topo de Ciclo", tone: "sell", note: "Z-Score > 7 marcou todos os topos históricos." },
    ],
    category: "btc",
  },
  {
    id: "puell-multiple",
    endpoint: "puell-multiple",
    valueKey: "puellMultiple",
    label: "Puell Multiple",
    tag: "Ciclo · Mineração",
    baseline: 1,
    precision: 2,
    about:
      "Receita diária dos mineradores dividida pela média de 1 ano. Abaixo de 0,5 marcou fundos históricos (mineradores capitulando); acima de 4, topos de ciclo (receita eufórica).",
    zones: [
      { max: 0.5, label: "Capitulação Mineradora", tone: "buy", note: "Receita minerada muito abaixo da média — fundo histórico." },
      { max: 1, label: "Acumulação", tone: "accumulate", note: "Abaixo da média anual — zona saudável de compra." },
      { max: 2.5, label: "Neutro", tone: "neutral", note: "Receita equilibrada." },
      { max: 4, label: "Aquecido", tone: "caution", note: "Receita elevada — atenção ao ciclo." },
      { max: Infinity, label: "Topo de Ciclo", tone: "sell", note: "Puell > 4 marcou topos históricos." },
    ],
    category: "btc",
  },
  {
    id: "reserve-risk",
    endpoint: "reserve-risk",
    valueKey: "reserveRisk",
    label: "Reserve Risk",
    tag: "Ciclo · Convicção",
    baseline: 0.006,
    precision: 4,
    about:
      "Mede a convicção dos holders de longo prazo em relação ao preço. Muito baixo = alta convicção com preço barato (ótimo risco/retorno); alto = preço caro vs convicção (zona de topo).",
    zones: [
      { max: 0.002, label: "Oportunidade Rara", tone: "buy", note: "Convicção alta + preço baixo — risco/retorno excelente." },
      { max: 0.006, label: "Acumulação", tone: "accumulate", note: "Zona historicamente atrativa." },
      { max: 0.012, label: "Neutro", tone: "neutral", note: "Equilíbrio entre preço e convicção." },
      { max: 0.025, label: "Aquecido", tone: "caution", note: "Preço subindo mais rápido que a convicção." },
      { max: Infinity, label: "Topo de Ciclo", tone: "sell", note: "Preço caro demais vs convicção — zona de topo." },
    ],
    category: "btc",
  },
  {
    id: "sth-mvrv",
    endpoint: "sth-mvrv",
    valueKey: "sthMvrv",
    label: "MVRV — Short-Term Holders",
    tag: "Topo/Fundo Local",
    baseline: 1,
    precision: 2,
    about:
      "MVRV dos holders de curto prazo (moedas com menos de 155 dias). Abaixo de 1, os novatos estão no prejuízo — costuma marcar fundos locais; acima de 1,4, topos locais.",
    zones: [
      { max: 0.9, label: "Prejuízo (STH)", tone: "buy", note: "Novatos no prejuízo — fundo local provável." },
      { max: 1, label: "Break-even", tone: "accumulate", note: "STHs no zero a zero — pivô importante." },
      { max: 1.2, label: "Lucro Moderado", tone: "neutral", note: "Novatos em lucro saudável." },
      { max: 1.4, label: "Aquecido", tone: "caution", note: "Lucro alto de curto prazo — risco de realização." },
      { max: Infinity, label: "Topo Local", tone: "sell", note: "STH-MVRV > 1,4 costuma marcar topos locais." },
    ],
    category: "btc",
  },
  {
    id: "rhodl-ratio",
    endpoint: "rhodl-ratio",
    valueKey: "rhodlRatio",
    label: "RHODL Ratio",
    tag: "Ciclo Macro",
    baseline: 10000,
    precision: 0,
    about:
      "Compara moedas movimentadas recentemente (1 semana) com as de 1-2 anos. Valores baixos indicam acúmulo (fundo); picos históricos acima de 50 mil marcaram topos de ciclo.",
    zones: [
      { max: 1000, label: "Acúmulo Profundo", tone: "buy", note: "Domínio de moedas antigas — fundo macro." },
      { max: 10000, label: "Acumulação", tone: "accumulate", note: "Zona saudável de ciclo." },
      { max: 30000, label: "Neutro / Alta", tone: "neutral", note: "Ciclo em desenvolvimento." },
      { max: 50000, label: "Aquecido", tone: "caution", note: "Aproximando da zona de topo." },
      { max: Infinity, label: "Topo de Ciclo", tone: "sell", note: "Picos acima de 50k marcaram topos históricos." },
    ],
    category: "btc",
  },
];

export function classifyZone(metric: OnChainMetricDef, value: number): OnChainZone {
  return metric.zones.find((z) => value <= z.max) ?? metric.zones[metric.zones.length - 1];
}

// ── Cache em localStorage (sobrevive a reload, poupa o limite de 10 req/h) ──
interface CacheEntry {
  ts: number;
  points: OnChainPoint[];
}

function cacheKey(endpoint: string) {
  return `onchain:${endpoint}`;
}

function readCache(endpoint: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(endpoint));
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function writeCache(endpoint: string, points: OnChainPoint[]) {
  try {
    localStorage.setItem(cacheKey(endpoint), JSON.stringify({ ts: Date.now(), points }));
  } catch {
    /* quota cheia — ignora */
  }
}

async function fetchSeries(endpoint: string, valueKey: string): Promise<OnChainPoint[]> {
  const cached = readCache(endpoint);
  if (cached && Date.now() - cached.ts < CACHE_TTL && cached.points.length) {
    return cached.points; // fresco → zero rede
  }

  try {
    const res = await fetch(`${BASE}/${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    const arr: any[] = Array.isArray(raw) ? raw : raw?.data ?? [];
    const points: OnChainPoint[] = arr
      .map((d) => ({
        time: typeof d.unixTs === "number" ? d.unixTs : Math.floor(new Date(d.d).getTime() / 1000),
        value: Number(d[valueKey]),
      }))
      .filter((p) => Number.isFinite(p.value) && Number.isFinite(p.time))
      .sort((a, b) => a.time - b.time);

    if (points.length) {
      writeCache(endpoint, points);
      return points;
    }
    throw new Error("empty series");
  } catch (err) {
    // Falha de rede ou rate-limit (429) → usa cache antigo se existir.
    if (cached?.points.length) return cached.points;
    throw err;
  }
}

export function useOnChainSeries(metric: OnChainMetricDef) {
  return useQuery({
    queryKey: ["onchain", metric.endpoint],
    queryFn: () => fetchSeries(metric.endpoint, metric.valueKey),
    staleTime: CACHE_TTL,
    refetchInterval: CACHE_TTL,
    retry: 1,
  });
}

export interface OnChainSnapshotItem {
  metric: OnChainMetricDef;
  value: number | null;
  zone: OnChainZone | null;
}

/** Pontuação de cada zona: negativo = barato/fundo, positivo = caro/topo. */
export const TONE_SCORE: Record<ZoneTone, number> = { buy: -2, accumulate: -1, neutral: 0, caution: 1, sell: 2 };

/**
 * Busca o valor atual de todas as métricas BTC de uma vez (usa o mesmo cache de 12h)
 * para montar o consenso de "posição no ciclo".
 */
export function useOnChainSnapshot() {
  const metrics = ONCHAIN_METRICS.filter((m) => m.category === "btc");
  return useQuery({
    queryKey: ["onchain-snapshot", metrics.map((m) => m.endpoint).join(",")],
    queryFn: async (): Promise<OnChainSnapshotItem[]> => {
      return Promise.all(
        metrics.map(async (metric) => {
          try {
            const pts = await fetchSeries(metric.endpoint, metric.valueKey);
            const value = pts.length ? pts[pts.length - 1].value : null;
            return { metric, value, zone: value != null ? classifyZone(metric, value) : null };
          } catch {
            return { metric, value: null, zone: null };
          }
        }),
      );
    },
    staleTime: CACHE_TTL,
    refetchInterval: CACHE_TTL,
    retry: 1,
  });
}
