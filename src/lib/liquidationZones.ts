/**
 * Zonas de liquidação por alavancagem — cálculo transparente sobre o PREÇO REAL.
 * Não é dado do Coinglass; é a matemática de "até onde o preço anda pra estourar cada alavancagem".
 * Aproximação de 1ª ordem: liq ≈ preço × (1 ∓ 1/alavancagem) (ignora taxa de manutenção/fees).
 */

export const LEVERAGE_TIERS = [100, 50, 25, 10, 5] as const;

export interface LiqZone {
  leverage: number;
  side: "long" | "short";
  price: number;
  distancePct: number; // % de distância do preço atual (positivo)
}

export function computeLiquidationZones(price: number): { longs: LiqZone[]; shorts: LiqZone[] } {
  if (!price || price <= 0) return { longs: [], shorts: [] };
  const longs: LiqZone[] = [];
  const shorts: LiqZone[] = [];
  for (const L of LEVERAGE_TIERS) {
    const frac = 1 / L;
    // longs quebram quando o preço CAI (parede de baixo = suporte/ímã)
    longs.push({ leverage: L, side: "long", price: price * (1 - frac), distancePct: frac * 100 });
    // shorts quebram quando o preço SOBE (parede de cima = resistência/squeeze)
    shorts.push({ leverage: L, side: "short", price: price * (1 + frac), distancePct: frac * 100 });
  }
  return { longs, shorts }; // já ordenados do mais próximo (100x) ao mais distante (5x)
}

// ─────────── mini relatório "mastigado" ───────────
export type ReportTone = "up" | "down" | "neutral" | "warn";
export interface ReportLine { tone: ReportTone; text: string; }

export interface LiqReportInput {
  symbol: string;
  price: number;
  funding: number | null;        // fração (ex: 0.0001 = 0,01%)
  longShortRatio: number | null; // >1 = mais contas compradas
  longUsd: number;               // liquidações realizadas (long) na sessão
  shortUsd: number;
}

function fmtPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(4)}`;
}

export function buildLiquidityReport(i: LiqReportInput): ReportLine[] {
  const lines: ReportLine[] = [];
  const z = computeLiquidationZones(i.price);
  if (!z.longs.length) return [{ tone: "neutral", text: "Sem preço disponível para calcular as zonas." }];

  const long100 = z.longs.find((l) => l.leverage === 100)!;
  const long50 = z.longs.find((l) => l.leverage === 50)!;
  const short100 = z.shorts.find((s) => s.leverage === 100)!;
  const short50 = z.shorts.find((s) => s.leverage === 50)!;

  lines.push({ tone: "neutral", text: `Preço de referência do ${i.symbol}: ${fmtPrice(i.price)}.` });

  lines.push({
    tone: "down",
    text: `Parede de baixo (longs): se cair ~1% até ${fmtPrice(long100.price)}, as posições 100x quebram; ~2% (${fmtPrice(long50.price)}) tira as 50x. Cascata de longs costuma ACELERAR a queda — o preço age como ímã pra esses níveis.`,
  });

  lines.push({
    tone: "up",
    text: `Parede de cima (shorts): se subir ~1% até ${fmtPrice(short100.price)}, os shorts 100x quebram; ~2% (${fmtPrice(short50.price)}) tira as 50x. Estouro de shorts pode virar squeeze de alta.`,
  });

  if (i.funding !== null) {
    const fpct = i.funding * 100;
    if (i.funding > 0.0005)
      lines.push({ tone: "warn", text: `Funding alto e positivo (${fpct.toFixed(3)}%): maioria comprada e pagando pra manter — euforia, risco de correção/long squeeze.` });
    else if (i.funding > 0)
      lines.push({ tone: "neutral", text: `Funding levemente positivo (${fpct.toFixed(3)}%): leve predominância de compradores.` });
    else if (i.funding < -0.0005)
      lines.push({ tone: "up", text: `Funding negativo forte (${fpct.toFixed(3)}%): excesso de shorts pagando — combustível pra squeeze de alta.` });
    else
      lines.push({ tone: "neutral", text: `Funding levemente negativo (${fpct.toFixed(3)}%): leve predominância de vendedores.` });
  }

  if (i.longShortRatio !== null) {
    if (i.longShortRatio > 1.5)
      lines.push({ tone: "warn", text: `Contas ${i.longShortRatio.toFixed(2)}x mais compradas que vendidas — mercado lotado de long (parede de baixo mais perigosa).` });
    else if (i.longShortRatio < 0.7)
      lines.push({ tone: "up", text: `Contas mais vendidas (razão ${i.longShortRatio.toFixed(2)}) — mercado lotado de short (combustível pra squeeze).` });
    else
      lines.push({ tone: "neutral", text: `Razão long/short equilibrada (${i.longShortRatio.toFixed(2)}).` });
  }

  const totalReal = i.longUsd + i.shortUsd;
  if (totalReal > 0) {
    const dom = i.longUsd >= i.shortUsd ? "longs" : "shorts";
    lines.push({ tone: dom === "longs" ? "down" : "up", text: `Nesta sessão já foram liquidados mais ${dom} ao vivo — pressão recente pro ${dom === "longs" ? "lado vendedor" : "lado comprador"}.` });
  }

  lines.push({ tone: "neutral", text: `⚠️ Zonas são estimativa por alavancagem (cálculo), não ordens reais. Não é recomendação — o risco é seu.` });
  return lines;
}
