import { getAdminCafes } from "@/lib/admin-data";
import { CafesModeration } from "@/components/admin/CafesModeration";

export default async function AdminCafesPage() {
  const cafes = await getAdminCafes();
  return <CafesModeration initialCafes={cafes} />;
}
