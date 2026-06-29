const url = process.argv[2] ?? "https://us.shein.com/Women-Clothing-c-2030.html";

const response = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

const html = await response.text();
console.log("status", response.status, "length", html.length);

const idx = html.indexOf("goods_id");
console.log("\n--- goods_id context ---\n");
console.log(html.slice(Math.max(0, idx - 80), idx + 1200));

const catMatch = url.match(/-c-(\d+)/);
console.log("\ncategory id from url:", catMatch?.[1]);

const apiMatches = [...html.matchAll(/\/bff-api\/[a-zA-Z0-9/_-]+/g)];
console.log("\nbff-api paths:", [...new Set(apiMatches.map((m) => m[0]))].slice(0, 15));

const gbMatch = html.match(/window\.gbRawData\s*=\s*(\{[\s\S]*?\});/);
console.log("\ngbRawData found:", Boolean(gbMatch));

const productListMatch = html.match(/productList[\s\S]{0,500}/);
console.log("\nproductList snippet:", productListMatch?.[0]?.slice(0, 500));
