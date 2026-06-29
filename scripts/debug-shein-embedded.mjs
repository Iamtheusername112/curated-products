const url = process.argv[2] ?? "https://us.shein.com/Women-Clothing-c-2030.html";

const response = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

const html = await response.text();
console.log("blocked", /risk\/challenge|captcha_type/.test(html));

for (const key of ["goodsIds", "goodsId", "productName", "salePrice", "retailPrice", "goods_img"]) {
  console.log(key, (html.match(new RegExp(key, "g")) || []).length);
}

const goodsIdsMatch = html.match(/"goodsIds"\s*:\s*"([^"]+)"/);
console.log("goodsIds sample", goodsIdsMatch?.[1]?.slice(0, 200));

const allGoodsIds = [...html.matchAll(/"goodsIds"\s*:\s*"([0-9,]+)"/g)].map((m) => m[1]);
console.log("goodsIds fields", allGoodsIds.length, allGoodsIds.slice(0, 5));

const productBlocks = [...html.matchAll(/"goods_id"\s*:\s*"?(\d{6,12})"?[\s\S]{0,400}?"goods_name"\s*:\s*"([^"]+)"[\s\S]{0,400}?"goods_img"\s*:\s*"([^"]+)"[\s\S]{0,400}?"salePrice"\s*:\s*\{[\s\S]{0,80}?"amount"\s*:\s*"([^"]+)"/g)];
console.log("structured blocks", productBlocks.length);
