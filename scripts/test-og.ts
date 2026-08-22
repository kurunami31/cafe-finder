const FB_PAGE = process.argv[2];

async function main() {
  const res = await fetch(FB_PAGE, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
    signal: AbortSignal.timeout(30_000),
  });
  const html = await res.text();
  const og = html.match(/<meta property="og:image" content="([^"]+)"/);
  console.log("og:image:", og ? og[1].slice(0, 140) : "NOT FOUND");
  const title = html.match(/<title>([^<]+)<\/title>/);
  console.log("title:", title ? title[1] : "?");
}

main();
