import { getAdminReviews } from "@/lib/admin-data";
import { ReviewsModeration } from "@/components/admin/ReviewsModeration";

export default async function AdminPage() {
  const reviews = await getAdminReviews();
  return <ReviewsModeration initialReviews={reviews} />;
}
