import { getCafesWithRatings } from "@/lib/queries";
import { NearbyClient } from "@/components/NearbyClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Nearby" };

export default async function NearbyPage() {
  let cafes: Awaited<ReturnType<typeof getCafesWithRatings>> = [];
  try {
    cafes = await getCafesWithRatings();
  } catch {}

  return <NearbyClient allCafes={cafes} />;
}
