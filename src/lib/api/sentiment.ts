import { useQuery } from "@tanstack/react-query";

export interface TradFiFng {
  value: number | null; // 0..100
  rating: string | null; // "fear", "greed", etc.
}

/**
 * Fear & Greed do mercado TRADICIONAL (CNN), via nossa função serverless.
 * Em produção (Vercel) responde com dado real; em dev local (/api ausente) degrada para null.
 */
export function useTradFiFearGreed() {
  return useQuery<TradFiFng>({
    queryKey: ["tradfi-fng"],
    queryFn: async () => {
      try {
        const r = await fetch("/api/fng-tradfi");
        if (!r.ok) return { value: null, rating: null };
        const d = await r.json();
        return { value: d?.value ?? null, rating: d?.rating ?? null };
      } catch {
        return { value: null, rating: null };
      }
    },
    staleTime: 30 * 60_000,
    refetchInterval: 30 * 60_000,
    retry: 1,
  });
}

const RATING_PT: Record<string, string> = {
  "extreme fear": "Medo Extremo",
  fear: "Medo",
  neutral: "Neutro",
  greed: "Ganância",
  "extreme greed": "Ganância Extrema",
};

export function tradFiRatingPt(rating: string | null, value: number | null): string {
  if (rating && RATING_PT[rating.toLowerCase()]) return RATING_PT[rating.toLowerCase()];
  if (value === null) return "carregando";
  if (value <= 25) return "Medo Extremo";
  if (value <= 45) return "Medo";
  if (value <= 54) return "Neutro";
  if (value <= 74) return "Ganância";
  return "Ganância Extrema";
}
