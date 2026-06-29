const productUrl =
  "https://us.shein.com/ROMWE-Grunge-Punk-Y2K-Subculture-Leopard-Print-Hem-Slit-Design-Women-Tube-Top-p-47977641.html";

const response = await fetch(productUrl, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

const html = await response.text();
console.log("len", html.length);
console.log("goods_name count", (html.match(/goods_name/g) || []).length);
console.log("goods_id count", (html.match(/goods_id/g) || []).length);

const patterns = [
  /"goods_id"\s*:\s*"?(\d+)"?/,
  /"goods_name"\s*:\s*"([^"]+)"/,
  /"goods_img"\s*:\s*"([^"]+)"/,
  /"salePrice"\s*:\s*\{[^}]*"amount"\s*:\s*"([^"]+)"/,
  /"productIntroData"\s*:/,
  /gbProductDetailSsrData/,
  /__INITIAL_STATE__/,
];

for (const p of patterns) {
  const m = html.match(p);
  console.log(p.source, m?.[0]?.slice(0, 120) ?? "no");
}

const idx = html.indexOf("47977641");
console.log("\ncontext", html.slice(Math.max(0, idx - 200), idx + 600));
