const url = process.argv[2] ?? "https://us.shein.com/Women-Clothing-c-2030.html";
const html = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } }).then((r) =>
  r.text()
);
const links = [...html.matchAll(/-p-(\d{6,12})/g)].map((m) => m[1]);
console.log("product links", links.length, [...new Set(links)].slice(0, 10));
const ogTitle = html.match(/property="og:title" content="([^"]+)"/);
const ogImage = html.match(/property="og:image" content="([^"]+)"/);
console.log("og:title", ogTitle?.[1]);
console.log("og:image", ogImage?.[1]);
