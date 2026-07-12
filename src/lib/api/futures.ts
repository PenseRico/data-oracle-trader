import { useQuery } from "@tanstack/react-query";

const FAPI = "https://fapi.binance.com";

export interface FuturesSnapshot {
  markPrice: number | null;
  funding: number | null;        // fração
  openInterest: number | null;   // em contratos/moeda
  longShortRatio: number | null; // >1 = mais contas compradas
  longAccountPct: number | null;
  shortAccountPct: number | null;
}

/**
 * Snapshot de futuros da Binance para um símbolo (mark price, funding, OI, razão long/short de contas).
 * Cada parte degrada para null se a Binance estiver bloqueada — a página usa preço da CoinGecko como fallback.
 */
export function useFuturesSnapshot(symbol: string) {
  const s = symbol.toUpperCase().endsWith("USDT") ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
  return useQuery<FuturesSnapshot>({
    queryKey: ["futures-snapshot", s],
    queryFn: async () => {
      const [pi, oi, ls] = await Promise.allSettled([
        fetch(`${FAPI}/fapi/v1/premiumIndex?symbol=${s}`).then((r) => r.json()),
        fetch(`${FAPI}/fapi/v1/openInterest?symbol=${s}`).then((r) => r.json()),
        fetch(`${FAPI}/futures/data/globalLongShortAccountRatio?symbol=${s}&period=5m&limit=1`).then((r) => r.json()),
      ]);
      const piv = pi.status === "fulfilled" ? pi.value : null;
      const oiv = oi.status === "fulfilled" ? oi.value : null;
      const lsv = ls.status === "fulfilled" && Array.isArray(ls.value) ? ls.value[0] : null;
      return {
        markPrice: piv?.markPrice ? parseFloat(piv.markPrice) : null,
        funding: piv?.lastFundingRate != null ? parseFloat(piv.lastFundingRate) : null,
        openInterest: oiv?.openInterest ? parseFloat(oiv.openInterest) : null,
        longShortRatio: lsv?.longShortRatio ? parseFloat(lsv.longShortRatio) : null,
        longAccountPct: lsv?.longAccount ? parseFloat(lsv.longAccount) * 100 : null,
        shortAccountPct: lsv?.shortAccount ? parseFloat(lsv.shortAccount) * 100 : null,
      };
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 1,
  });
}
