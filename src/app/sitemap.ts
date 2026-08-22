import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://findcafe.vercel.app";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/cafes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/welcome`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const { data } = await supabase
      .from("cafes")
      .select("id, created_at")
      .eq("hidden", false)
      .order("created_at");
    const cafePages: MetadataRoute.Sitemap = (data ?? []).map((c) => ({
      url: `${base}/cafe/${c.id}`,
      lastModified: c.created_at ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    return [...staticPages, ...cafePages];
  } catch {
    return staticPages;
  }
}
