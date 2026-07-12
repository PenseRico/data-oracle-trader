// Fear & Greed do MERCADO TRADICIONAL (CNN) — proxy server-side.
// O endpoint da CNN bloqueia CORS e exige User-Agent; por isso roda aqui, não no navegador.
export default async function handler(_req: any, res: any) {
  try {
    const r = await fetch("https://production.dataviz.cnn.com/index/fearandgreed/graphdata", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "application/json",
      },
    });
    if (!r.ok) {
      res.status(502).json({ error: "CNN indisponível", value: null, rating: null });
      return;
    }
    const d = await r.json();
    const score = d?.fear_and_greed?.score;
    const rating = d?.fear_and_greed?.rating;
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    res.status(200).json({
      value: score != null ? Math.round(Number(score)) : null,
      rating: rating ?? null,
    });
  } catch (e) {
    res.status(500).json({ error: String(e), value: null, rating: null });
  }
}
