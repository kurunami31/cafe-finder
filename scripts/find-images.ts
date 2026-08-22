const url = process.argv[2];

async function main() {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    signal: AbortSignal.timeout(30_000),
  });
  const html = await res.text();
  const urls = [
    ...new Set(
      (html.match(/https:\/\/images\.deliveryhero\.io\/[^"'\s\\]+\.(?:jpe?g|png|webp)/g) ?? [])
    ),
  ];
  console.log(`unique deliveryhero images: ${urls.length}`);
  for (const u of urls.slice(0, 10)) {
    try {
      const head = await fetch(u, {
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0", Referer: url },
        signal: AbortSignal.timeout(15_000),
      });
      console.log(head.status, `${((Number(head.headers.get("content-length")) || 0) / 1024).toFixed(0)}KB`, u.slice(0, 110));
    } catch (e) {
      console.log("ERR", u.slice(0, 90), (e as Error).message);
    }
  }
}

main();
