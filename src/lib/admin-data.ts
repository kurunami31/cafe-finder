import { redirect } from "next/navigation";
import type { Cafe, Review } from "@/lib/types";
import { createSupabaseServerClient, getAdminUser } from "@/lib/supabase-server";

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function getAdminReviews(): Promise<
  (Review & { cafe_name: string | null })[]
> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, cafe_id, display_name, rating, comment, created_at, cafes(name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    cafe_id: r.cafe_id,
    display_name: r.display_name,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    cafe_name: (r.cafes as unknown as { name: string } | null)?.name ?? null,
  }));
}

export async function getAdminCafes(): Promise<Cafe[]> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("cafes").select("*").order("name");
  if (error) throw error;
  return (data as Cafe[]) ?? [];
}
