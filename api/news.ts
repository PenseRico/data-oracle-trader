// Notícias de cripto — RSS real do CryptoPanic, buscado no servidor (resolve CORS).
const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&#8217;": "’", "&#8216;": "‘", "&#8220;": "“", "&#8221;": "”", "&hellip;": "…" };
function decode(s: string): string {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? m);
}
function strip(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim();
}

export default async function handler(_req: any, res: any) {
  try {
    const r = await fetch("https://cryptopanic.com/news/rss/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MatrixBot/1.0)", Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!r.ok) { res.status(502).json({ items: [], error: "RSS indisponível" }); return; }
    const xml = await r.text();
    const items: { title: string; url: string; source: string; published_at: string }[] = [];
    const blocks = xml.split(/<item>/i).slice(1);
    for (const raw of blocks.slice(0, 30)) {
      const seg = raw.split(/<\/item>/i)[0];
      const pick = (tag: string) => {
        const m = seg.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
        return m ? decode(strip(m[1])) : "";
      };
      const title = pick("title");
      const link = pick("link");
      const pub = pick("pubDate");
      const sm = seg.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
      let source = sm ? strip(sm[1]) : "";
      if (!source && link) { try { source = new URL(link).hostname.replace(/^www\./, ""); } catch { /* ignore */ } }
      const published_at = pub ? new Date(pub).toISOString() : new Date().toISOString();
      if (title && link) items.push({ title, url: link, source: source || "cryptopanic", published_at });
    }
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ items: [], error: String(e) });
  }
}
