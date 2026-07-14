// Notícias de cripto — agrega RSS de portais grandes (feeds abertos, pensados p/ sindicância,
// não bloqueiam datacenter como CryptoPanic nem exigem chave como o CryptoCompare).
const FEEDS = [
  { name: "CoinTelegraph", url: "https://cointelegraph.com/rss" },
  { name: "Decrypt", url: "https://decrypt.co/feed" },
  { name: "CryptoSlate", url: "https://cryptoslate.com/feed/" },
];

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'" };
const decode = (s: string) => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? m);
const strip = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim();

async function fetchFeed(f: { name: string; url: string }) {
  try {
    const r = await fetch(f.url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; MatrixBot/1.0)", Accept: "application/rss+xml, application/xml, text/xml" } });
    if (!r.ok) return [];
    const xml = await r.text();
    const out: { title: string; url: string; source: string; published_at: string; ts: number }[] = [];
    for (const raw of xml.split(/<item[ >]/i).slice(1, 21)) {
      const seg = raw.split(/<\/item>/i)[0];
      const pick = (tag: string) => {
        const m = seg.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
        return m ? decode(strip(m[1])) : "";
      };
      const title = pick("title");
      const link = pick("link") || (seg.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ?? "");
      const pub = pick("pubDate");
      const ts = pub ? new Date(pub).getTime() : 0;
      if (title && link) out.push({ title, url: link, source: f.name, published_at: ts ? new Date(ts).toISOString() : new Date().toISOString(), ts });
    }
    return out;
  } catch {
    return [];
  }
}

export default async function handler(_req: any, res: any) {
  try {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed));
    const merged = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    const seen = new Set<string>();
    const items = merged
      .sort((a, b) => b.ts - a.ts)
      .filter((it) => { const k = it.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 30)
      .map(({ ts, ...rest }) => rest);
    if (!items.length) { res.status(502).json({ items: [], error: "sem feeds disponíveis" }); return; }
    res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=900");
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ items: [], error: String(e) });
  }
}
