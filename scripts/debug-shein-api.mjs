const url = process.argv[2] ?? "https://us.shein.com/Women-Clothing-c-2030.html";

const response = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

const html = await response.text();
const catId = url.match(/-c-(\d+)/)?.[1];

const patterns = [
  /"cat_id"\s*:\s*"?(\d+)"?/g,
  /"catId"\s*:\s*"?(\d+)"?/g,
  /"categoryId"\s*:\s*"?(\d+)"?/g,
  /productList\/[a-zA-Z0-9/_-]+/g,
  /"goods_name"\s*:\s*"[^"]+"/g,
  /"goods_id"\s*:\s*"?(\d{6,12})"?/g,
];

for (const pattern of patterns) {
  const matches = [...html.matchAll(pattern)];
  console.log(pattern.source, matches.length, matches.slice(0, 3));
}

// try common API endpoints
const origin = new URL(url).origin;
const apiCandidates = [
  `${origin}/api/productList/get?cate_id=${catId}&page=1&limit=20`,
  `${origin}/api/productList/info/get?cat_id=${catId}&page=1&limit=20`,
  `${origin}/bff-api/product/list?cat_id=${catId}&page=1&limit=20`,
  `${origin}/bff-api/product-list/category?cat_id=${catId}&page=1&limit=20`,
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: url,
};

for (const apiUrl of apiCandidates) {
  try {
    const res = await fetch(apiUrl, { headers });
    const text = await res.text();
    console.log("\nAPI", apiUrl, res.status, text.slice(0, 300));
  } catch (error) {
    console.log("\nAPI failed", apiUrl, error.message);
  }
}
