/**
 * Bot "Setup Compra" — porte fiel do bot.py (Python/ccxt) para rodar NO NAVEGADOR.
 *
 * NÃO conecta no TradingView (que não tem API pública). Pega as MESMAS velas (OHLCV)
 * da Binance que o TradingView exibe e roda a MESMA matemática do indicador Pine
 * "Setup Compra" — resultado idêntico, fonte automatizável.
 *
 *   - RSI(14) Wilder entre 40 e 57
 *   - close dentro de ±2% da EMA(80)
 *   - volume vs SMA(20) entre 0% e 500%
 *   - gatilho: high atual > high anterior
 * Avalia na última barra FECHADA de 4h. Só dados públicos — não toca saldo.
 * Cada sinal já vem com plano pronto: entrada, alvo 1/2 e stop.
 */

const BINANCE = "https://api.binance.com/api/v3";

export interface ScanConfig {
  rsiLength: number;
  rsiMin: number;
  rsiMax: number;
  maLength: number;
  distancePct: number;
  volLength: number;
  volMin: number;
  volMax: number;
  timeframe: string;
  fetchLimit: number;
}

export const SETUP_COMPRA_CONFIG: ScanConfig = {
  rsiLength: 14,
  rsiMin: 40,
  rsiMax: 57,
  maLength: 80,
  distancePct: 2,
  volLength: 20,
  volMin: 0,
  volMax: 500,
  timeframe: "4h",
  fetchLimit: 200,
};

export interface SetupSignal {
  symbol: string; // BTCUSDT
  base: string; // BTC
  close: number;
  rsi: number;
  ema: number;
  distancePct: number;
  volChangePct: number;
  // plano pronto (setup de COMPRA)
  entryLow: number; // região de compra (suporte)
  entryHigh: number; // região de compra (topo)
  stop: number;
  partial1: number; // saída parcial 1 (1R)
  partial2: number; // saída parcial 2 (2R)
  total: number; // saída total / alvo final (3.5R)
  riskPct: number;
  // quantas das 4 condições bateram (4 = sinal cheio, 3 = em formação)
  met: number;
  conds: { rsi: boolean; price: boolean; vol: boolean; trigger: boolean };
}

interface Kline {
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

// ── indicadores (iguais ao Pine) ──
function ema(values: number[], length: number): number[] {
  const alpha = 2 / (length + 1);
  const out: number[] = [];
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    prev = i === 0 ? values[0] : alpha * values[i] + (1 - alpha) * prev;
    out.push(prev);
  }
  return out;
}
function rma(values: number[], length: number): number[] {
  const out: number[] = [];
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    prev = i === 0 ? values[0] : (values[i] + (length - 1) * prev) / length;
    out.push(prev);
  }
  return out;
}
function rsiSeries(closes: number[], length: number): number[] {
  const gains: number[] = [0];
  const losses: number[] = [0];
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gains.push(d > 0 ? d : 0);
    losses.push(d < 0 ? -d : 0);
  }
  const ag = rma(gains, length);
  const al = rma(losses, length);
  return closes.map((_, i) => (al[i] === 0 ? 100 : 100 - 100 / (1 + ag[i] / al[i])));
}
function smaSeries(values: number[], length: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < length - 1) { out.push(NaN); continue; }
    let sum = 0;
    for (let j = i - length + 1; j <= i; j++) sum += values[j];
    out.push(sum / length);
  }
  return out;
}

function analyze(symbol: string, klines: Kline[], cfg: ScanConfig): SetupSignal | null {
  if (klines.length < cfg.maLength + 5) return null;
  const closes = klines.map((k) => k.close);
  const highs = klines.map((k) => k.high);
  const lows = klines.map((k) => k.low);
  const vols = klines.map((k) => k.volume);

  const emaS = ema(closes, cfg.maLength);
  const rsiS = rsiSeries(closes, cfg.rsiLength);
  const volMa = smaSeries(vols, cfg.volLength);

  let idx = klines.length - 1;
  if (klines[idx].closeTime > Date.now()) idx -= 1;
  if (idx < 1) return null;

  const close_v = closes[idx];
  const ma_v = emaS[idx];
  const rsi_v = rsiS[idx];
  const volMa_v = volMa[idx];
  if (!isFinite(rsi_v) || !isFinite(ma_v) || !isFinite(volMa_v) || volMa_v === 0) return null;

  const volChange = ((vols[idx] - volMa_v) / volMa_v) * 100;
  const distance = ((close_v - ma_v) / ma_v) * 100;

  const conds = {
    rsi: rsi_v >= cfg.rsiMin && rsi_v <= cfg.rsiMax,
    price: Math.abs(distance) <= cfg.distancePct,
    vol: volChange >= cfg.volMin && volChange <= cfg.volMax,
    trigger: highs[idx] > highs[idx - 1],
  };
  const met = Number(conds.rsi) + Number(conds.price) + Number(conds.vol) + Number(conds.trigger);
  if (met < 3) return null; // só sinais cheios (4) ou em formação (3)

  // plano de COMPRA: stop abaixo do suporte (EMA80 / mínima recente), saídas em R
  const recentLow = Math.min(...lows.slice(Math.max(0, idx - 20), idx + 1));
  let stop = Math.min(ma_v * 0.99, recentLow * 0.998);
  if (stop >= close_v) stop = close_v * 0.97;
  const risk = close_v - stop;

  return {
    symbol,
    base: symbol.replace("USDT", ""),
    close: close_v,
    rsi: rsi_v,
    ema: ma_v,
    distancePct: distance,
    volChangePct: volChange,
    entryLow: Math.min(close_v, ma_v), // compre entre a EMA80 e o preço atual
    entryHigh: Math.max(close_v, ma_v),
    stop,
    partial1: close_v + risk * 1, // realiza 1R
    partial2: close_v + risk * 2, // realiza 2R
    total: close_v + risk * 3.5, // saída final
    riskPct: (risk / close_v) * 100,
    met,
    conds,
  };
}

async function fetchKlines(symbol: string, tf: string, limit: number): Promise<Kline[]> {
  const res = await fetch(`${BINANCE}/klines?symbol=${symbol}&interval=${tf}&limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  return (raw as any[]).map((d) => ({
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4]),
    volume: parseFloat(d[5]),
    closeTime: d[6],
  }));
}

export async function fetchUsdtSpotSymbols(): Promise<string[]> {
  const res = await fetch(`${BINANCE}/exchangeInfo`);
  if (!res.ok) throw new Error(`exchangeInfo HTTP ${res.status}`);
  const data = await res.json();
  return (data.symbols as any[])
    .filter((s) => s.quoteAsset === "USDT" && s.status === "TRADING" && s.isSpotTradingAllowed)
    .map((s) => s.symbol as string)
    .filter((s) => !s.includes("UPUSDT") && !s.includes("DOWNUSDT"));
}

export interface ScanResult {
  signals: SetupSignal[]; // 4/4 condições — sinal cheio
  forming: SetupSignal[]; // 3/4 condições — em formação
  scanned: number;
  errors: number;
}

function sortByEdge(a: SetupSignal, b: SetupSignal) {
  return Math.abs(a.distancePct) - Math.abs(b.distancePct);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scanSetupCompra(
  symbols: string[],
  cfg: ScanConfig,
  onProgress?: (done: number, total: number) => void,
  concurrency = 6,
): Promise<ScanResult> {
  const hits: SetupSignal[] = [];
  let done = 0;
  let errors = 0;
  const total = symbols.length;

  for (let i = 0; i < symbols.length; i += concurrency) {
    const batch = symbols.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (sym) => {
        try {
          const klines = await fetchKlines(sym, cfg.timeframe, cfg.fetchLimit);
          const sig = analyze(sym, klines, cfg);
          if (sig) hits.push(sig);
        } catch {
          errors++;
        } finally {
          done++;
          onProgress?.(done, total);
        }
      }),
    );
    if (i + concurrency < symbols.length) await sleep(120); // evita rate-limit/ban da Binance
  }

  return {
    signals: hits.filter((s) => s.met === 4).sort(sortByEdge),
    forming: hits.filter((s) => s.met === 3).sort(sortByEdge),
    scanned: total,
    errors,
  };
}
