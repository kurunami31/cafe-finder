import { supabase } from "@/lib/supabase";
import type { Cafe, CafeWithRating, Review } from "@/lib/types";

export async function getCafesWithRatings(): Promise<CafeWithRating[]> {
  const [cafesRes, reviewsRes] = await Promise.all([
    supabase.from("cafes").select("*").eq("hidden", false).order("name"),
    supabase.from("reviews").select("cafe_id, rating"),
  ]);

  if (cafesRes.error) throw cafesRes.error;
  const cafes = cafesRes.data as Cafe[];

  const totals = new Map<string, { sum: number; count: number }>();
  for (const r of (reviewsRes.data ?? []) as { cafe_id: string; rating: number }[]) {
    const t = totals.get(r.cafe_id) ?? { sum: 0, count: 0 };
    t.sum += r.rating;
    t.count += 1;
    totals.set(r.cafe_id, t);
  }

  return cafes.map((c) => {
    const t = totals.get(c.id);
    return {
      ...c,
      review_count: t?.count ?? 0,
      rating_avg: t && t.count > 0 ? Math.round((t.sum / t.count) * 10) / 10 : null,
    };
  });
}

export async function getCafe(id: string): Promise<Cafe | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .eq("id", id)
    .eq("hidden", false)
    .maybeSingle();
  if (error) throw error;
  return (data as Cafe) ?? null;
}

export async function getReviews(cafeId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, cafe_id, display_name, rating, comment, created_at")
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as Review[]) ?? [];
}
