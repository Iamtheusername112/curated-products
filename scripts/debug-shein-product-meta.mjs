const url =
  process.argv[2] ??
  "https://us.shein.com/ROMWE-Grunge-Punk-Y2K-Subculture-Leopard-Print-Hem-Slit-Design-Women-Tube-Top-p-47977641.html";

const html = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    Accept: "text/html",
  },
}).then((r) => r.text());

console.log("blocked", /risk\/challenge|captcha_type/i.test(html));
console.log("len", html.length);

const meta = {
  ogTitle: html.match(/property="og:title" content="([^"]+)"/)?.[1],
  ogImage: html.match(/property="og:image" content="([^"]+)"/)?.[1],
  title: html.match(/<title>([^<]+)<\/title>/i)?.[1],
  ldJson: html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1],
};

console.log(meta);

if (meta.ldJson) {
  try {
    const json = JSON.parse(meta.ldJson);
    console.log("ld+json name", json.name, "image", json.image, "offers", json.offers);
  } catch {}
}

const priceMatch = html.match(/"amount"\s*:\s*"([0-9.]+)"/);
console.log("first amount", priceMatch?.[1]);
