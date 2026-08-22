const code = process.argv[2] ?? "cmiw";
const candidates = [
  `https://images.deliveryhero.io/image/fd-ph/LH/${code}-hero.jpg`,
  `https://images.deliveryhero.io/image/fd-ph/LH/${code}.jpg`,
  `https://images.deliveryhero.io/image/fd-ph/VL/${code}.jpg`,
  `https://images.deliveryhero.io/image/fd-ph/LH/${code}-grid.jpg`,
];

async function main() {
  for (const u of candidates) {
    try {
      const res = await fetch(u, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.foodpanda.ph/" },
        signal: AbortSignal.timeout(20_000),
      });
      console.log(res.status, `${((Number(res.headers.get("content-length")) || 0) / 1024).toFixed(0)}KB`, u);
    } catch (e) {
      console.log("ERR", u, (e as Error).message);
    }
  }
}

main();
