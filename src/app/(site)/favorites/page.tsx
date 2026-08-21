import { getCafesWithRatings } from "@/lib/queries";
import { FavoritesClient } from "@/components/FavoritesClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  let cafes: Awaited<ReturnType<typeof getCafesWithRatings>> = [];
  try {
    cafes = await getCafesWithRatings();
  } catch {}

  return <FavoritesClient allCafes={cafes} />;
}
