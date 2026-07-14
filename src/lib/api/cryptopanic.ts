import { useQuery } from "@tanstack/react-query";

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
  currencies: string[];
}

const TICKERS = ["BTC", "ETH", "SOL", "XRP", "BNB", "DOGE", "ADA", "AVAX", "LINK", "TON", "SUI", "SHIB", "DOT", "TRX", "MATIC", "LTC"];
const NAME_TO_TICKER: Record<string, string> = { bitcoin: "BTC", ethereum: "ETH", solana: "SOL", ripple: "XRP", binance: "BNB", dogecoin: "DOGE", cardano: "ADA", avalanche: "AVAX", chainlink: "LINK", polkadot: "DOT", litecoin: "LTC" };

function detectTickers(title: string): string[] {
  const found = new Set<string>();
  const upper = ` ${title.toUpperCase()} `;
  for (const t of TICKERS) if (upper.includes(` ${t} `) || upper.includes(`$${t}`)) found.add(t);
  const lower = title.toLowerCase();
  for (const [name, t] of Object.entries(NAME_TO_TICKER)) if (lower.includes(name)) found.add(t);
  return Array.from(found).slice(0, 3);
}

async function fetchNews(): Promise<NewsItem[]> {
  try {
    const r = await fetch("/api/news");
    if (!r.ok) return [];
    const d = await r.json();
    const items = Array.isArray(d.items) ? d.items : [];
    return items.map((it: any, i: number) => ({
      id: it.url || String(i),
      title: it.title,
      url: it.url,
      source: it.source || "cryptopanic",
      published_at: it.published_at,
      currencies: detectTickers(it.title || ""),
    }));
  } catch {
    return [];
  }
}

export function useNews() {
  return useQuery({
    queryKey: ["cryptopanic-news"],
    queryFn: fetchNews,
    staleTime: 120_000,
    refetchInterval: 180_000,
  });
}
