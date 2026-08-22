import { supabase } from "@/lib/supabase";

export function publicPhotoUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cafe-photos/${storagePath}`;
}

export async function getApprovedPhotosByCafe(): Promise<Map<string, string[]>> {
  const { data, error } = await supabase
    .from("cafe_photos")
    .select("cafe_id, storage_path, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const list = map.get(row.cafe_id) ?? [];
    list.push(publicPhotoUrl(row.storage_path));
    map.set(row.cafe_id, list);
  }
  return map;
}

export async function getApprovedCovers(
  cafeIds: string[]
): Promise<Map<string, string>> {
  const all = await getApprovedPhotosByCafe();
  const covers = new Map<string, string>();
  for (const id of cafeIds) {
    const photos = all.get(id);
    if (photos && photos.length > 0) covers.set(id, photos[0]);
  }
  return covers;
}

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function extensionFor(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}
