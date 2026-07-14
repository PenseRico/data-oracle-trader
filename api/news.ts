// Notícias de cripto — API pública do CryptoCompare (JSON, agrega vários portais,
// funciona a partir do servidor; CryptoPanic bloqueia IP de datacenter).
export default async function handler(_req: any, res: any) {
  try {
    const r = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MatrixBot/1.0)", Accept: "application/json" },
    });
    if (!r.ok) { res.status(502).json({ items: [], error: "fonte indisponível" }); return; }
    const d = await r.json();
    const raw = Array.isArray(d?.Data) ? d.Data : [];
    const items = raw.slice(0, 30).map((it: any) => ({
      title: String(it.title || "").trim(),
      url: String(it.url || it.guid || ""),
      source: String(it.source_info?.name || it.source || "cryptocompare"),
      published_at: new Date((Number(it.published_on) || 0) * 1000).toISOString(),
      categories: String(it.categories || ""),
    })).filter((it: any) => it.title && it.url);
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ items: [], error: String(e) });
  }
}
