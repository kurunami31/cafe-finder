import { getCafesWithRatings } from "@/lib/queries";
import { getAdminUser } from "@/lib/supabase-server";
import { getUserFavoriteIds } from "@/app/login/actions";
import { FavoritesClient } from "@/components/FavoritesClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const user = await getAdminUser();
  let cafes: Awaited<ReturnType<typeof getCafesWithRatings>> = [];
  try {
    cafes = await getCafesWithRatings();
  } catch {}

  const serverIds = user ? await getUserFavoriteIds() : null;

  return <FavoritesClient allCafes={cafes} serverIds={serverIds} />;
}
