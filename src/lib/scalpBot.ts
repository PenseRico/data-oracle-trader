/**
 * Bot Scalping — radar de SOBREVENDA EXTREMA multi-timeframe, rodando no navegador.
 *
 * Foco: achar moedas entrando em sobrevenda extrema (RSI 5m muito baixo) com confluência
 * de timeframes (Diário/4h/1h/5m), no contexto do BTC e do "TOTAL2" (proxy = cesta de alts).
 * Usa klines públicas da Binance (mesma fonte do TradingView). Não toca em saldo.
 */

const BINANCE = "https://api.binance.com/api/v3";

export const SCALP_CONFIG = {
  rsiLength: 14,
  oversold: 30, // entra no radar
  extreme: 15, // sobrevenda EXTREMA (destaque)
  targetPct: 2.0, // alvo rápido de scalp
  stopPct: 1.2,
  tfs: ["5m", "1h", "4h", "1d"] as const,
};

export type ScalpTf = (typeof SCALP_CONFIG.tfs)[number];

export interface ScalpSignal {
  symbol: string;
  base: string;
  price: number;
  rsi: Record<ScalpTf, number>;
  oversoldCount: number; // quantos TFs <= oversold
  extreme: boolean; // 5m <= extreme
  entry: number;
  target: number;
  stop: number;
}

export interface MacroRsi {
  rsi: Record<ScalpTf, number>;
}

export interface ScalpResult {
  signals: ScalpSignal[];
  scanned: number;
  errors: number;
  btc: MacroRsi;
  alt: MacroRsi; // proxy TOTAL2 (média de altcoins grandes)
}

const ALT_BASKET = ["ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "AVAXUSDT", "DOGEUSDT", "LINKUSDT"];

// ── RSI Wilder ──
function rma(values: number[], length: number): number[] {
  const out: number[] = [];
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    prev = i === 0 ? values[0] : (values[i] + (length - 1) * prev) / length;
    out.push(prev);
  }
  return out;
}
function lastRsi(closes: number[], length: number): number {
  if (closes.length < length + 2) return NaN;
  const gains: number[] = [0];
  const losses: number[] = [0];
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gains.push(d > 0 ? d : 0);
    losses.push(d < 0 ? -d : 0);
  }
  const ag = rma(gains, length);
  const al = rma(losses, length);
  const i = closes.length - 1;
  if (al[i] === 0) return 100;
  return 100 - 100 / (1 + ag[i] / al[i]);
}

async function fetchCloses(symbol: string, tf: string, limit = 120): Promise<{ closes: number[]; price: number }> {
  const res = await fetch(`${BINANCE}/klines?symbol=${symbol}&interval=${tf}&limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = (await res.json()) as any[];
  const closes = raw.map((d) => parseFloat(d[4]));
  return { closes, price: closes[closes.length - 1] };
}

async function macroRsi(symbol: string): Promise<MacroRsi> {
  const rsi = {} as Record<ScalpTf, number>;
  await Promise.all(
    SCALP_CONFIG.tfs.map(async (tf) => {
      try {
        const { closes } = await fetchCloses(symbol, tf, 120);
        rsi[tf] = lastRsi(closes, SCALP_CONFIG.rsiLength);
      } catch {
        rsi[tf] = NaN;
      }
    }),
  );
  return { rsi };
}

async function altBasketRsi(): Promise<MacroRsi> {
  const perTf = {} as Record<ScalpTf, number[]>;
  SCALP_CONFIG.tfs.forEach((tf) => (perTf[tf] = []));
  await Promise.all(
    ALT_BASKET.map(async (sym) => {
      const m = await macroRsi(sym);
      SCALP_CONFIG.tfs.forEach((tf) => {
        if (isFinite(m.rsi[tf])) perTf[tf].push(m.rsi[tf]);
      });
    }),
  );
  const rsi = {} as Record<ScalpTf, number>;
  SCALP_CONFIG.tfs.forEach((tf) => {
    const arr = perTf[tf];
    rsi[tf] = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN;
  });
  return { rsi };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scanScalp(
  symbols: string[],
  onProgress?: (done: number, total: number) => void,
  concurrency = 6,
): Promise<ScalpResult> {
  // contexto macro (BTC + cesta de alts) em paralelo
  const [btc, alt] = await Promise.all([macroRsi("BTCUSDT"), altBasketRsi()]);

  // Etapa 1: 5m RSI de todos → candidatos sobrevendidos
  const cand: { symbol: string; rsi5m: number; price: number }[] = [];
  let done = 0;
  let errors = 0;
  const total = symbols.length;
  for (let i = 0; i < symbols.length; i += concurrency) {
    const batch = symbols.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (sym) => {
        try {
          const { closes, price } = await fetchCloses(sym, "5m", 120);
          const r = lastRsi(closes, SCALP_CONFIG.rsiLength);
          if (isFinite(r) && r <= SCALP_CONFIG.oversold) cand.push({ symbol: sym, rsi5m: r, price });
        } catch {
          errors++;
        } finally {
          done++;
          onProgress?.(done, total);
        }
      }),
    );
    if (i + concurrency < symbols.length) await sleep(100);
  }

  // Etapa 2: para os candidatos, confluência nos TFs maiores
  const signals: ScalpSignal[] = [];
  for (let i = 0; i < cand.length; i += concurrency) {
    const batch = cand.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (c) => {
        const rsi = { "5m": c.rsi5m } as Record<ScalpTf, number>;
        await Promise.all(
          (["1h", "4h", "1d"] as ScalpTf[]).map(async (tf) => {
            try {
              const { closes } = await fetchCloses(c.symbol, tf, 120);
              rsi[tf] = lastRsi(closes, SCALP_CONFIG.rsiLength);
            } catch {
              rsi[tf] = NaN;
            }
          }),
        );
        const oversoldCount = SCALP_CONFIG.tfs.filter((tf) => isFinite(rsi[tf]) && rsi[tf] <= SCALP_CONFIG.oversold).length;
        signals.push({
          symbol: c.symbol,
          base: c.symbol.replace("USDT", ""),
          price: c.price,
          rsi,
          oversoldCount,
          extreme: c.rsi5m <= SCALP_CONFIG.extreme,
          entry: c.price,
          target: c.price * (1 + SCALP_CONFIG.targetPct / 100),
          stop: c.price * (1 - SCALP_CONFIG.stopPct / 100),
        });
      }),
    );
  }

  // ordena: mais sobrevendido no 5m primeiro, e mais confluência
  signals.sort((a, b) => b.oversoldCount - a.oversoldCount || a.rsi["5m"] - b.rsi["5m"]);

  return { signals, scanned: total, errors, btc, alt };
}
