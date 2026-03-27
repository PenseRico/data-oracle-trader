import { useQuery } from "@tanstack/react-query";

const PANIC_BASE = "https://cryptopanic.com/api/v1/posts/";

export interface CryptoPanicNews {
  id: number;
  kind: "news" | "media";
  domain: string;
  source: { title: string; region: string; domain: string };
  title: string;
  published_at: string;
  slug: string;
  currencies: { code: string; title: string; slug: string; url: string }[];
  votes: { negative: number; positive: number; important: number; liked: number; disliked: number; lol: number; saved: number; comments: number };
}

export interface CryptoPanicResponse {
  count: number;
  next: string;
  previous: string;
  results: CryptoPanicNews[];
}

// Fetch news with optional API key
async function fetchNews(apiKey?: string, filter = "hot"): Promise<CryptoPanicNews[]> {
  // Using a proxy or direct if CORS allowed, but for now we'll simulate if key is missing
  // CryptoPanic often requires a key for server-side or specific filtering.
  // We'll use a fallback structure if no key is provided to ensure UI doesn't break.
  try {
    if (!apiKey) {
      // Return a set of high-quality sample institutional news for the Demo
      return [
        {
          id: 1,
          kind: "news",
          domain: "bloomberg.com",
          source: { title: "Bloomberg", region: "en", domain: "bloomberg.com" },
          title: "SEC approves first options for Bitcoin ETFs, signaling deep liquidity influx.",
          published_at: new Date().toISOString(),
          slug: "sec-approves-options",
          currencies: [{ code: "BTC", title: "Bitcoin", slug: "bitcoin", url: "" }],
          votes: { positive: 45, negative: 2, important: 88, liked: 10, disliked: 0, lol: 0, saved: 5, comments: 22 }
        },
        {
          id: 2,
          kind: "news",
          domain: "reuters.com",
          source: { title: "Reuters", region: "en", domain: "reuters.com" },
          title: "Global banks increase crypto custody offerings as institutional demand surges.",
          published_at: new Date(Date.now() - 3600000).toISOString(),
          slug: "banks-crypto-custody",
          currencies: [{ code: "BTC", title: "Bitcoin", slug: "bitcoin", url: "" }],
          votes: { positive: 31, negative: 1, important: 54, liked: 5, disliked: 0, lol: 0, saved: 2, comments: 12 }
        }
      ];
    }

    const res = await fetch(`${PANIC_BASE}?auth_token=${apiKey}&filter=${filter}&public=true`);
    if (!res.ok) throw new Error("CryptoPanic API error");
    const data: CryptoPanicResponse = await res.json();
    return data.results;
  } catch (e) {
    return [];
  }
}

export function useNews(apiKey?: string, filter = "hot") {
  return useQuery({
    queryKey: ["cryptopanic-news", filter],
    queryFn: () => fetchNews(apiKey, filter),
    staleTime: 300_000,
  });
}
