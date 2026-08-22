"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { createSupabaseServerClient, getAdminUser } from "@/lib/supabase-server";

async function assertAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized: admin session required.");
  return user;
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/cafes");
  revalidatePath("/", "layout");
}

export async function signInAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) redirect("/admin");

  switch (error.code ?? error.status) {
    case "email_not_confirmed":
    case 401:
      return {
        error:
          "This email hasn't been confirmed. In Supabase: Authentication → Users → find this user → confirm email, or re-create the user with 'Auto Confirm User' checked.",
      };
    case "over_request_rate_limit":
    case 429:
      return { error: "Too many attempts. Please wait a minute and try again." };
    default:
      return { error: `Sign-in failed: ${error.message}` };
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateReviewAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Session expired. Please log in again." };
  }
  const id = String(formData.get("id") ?? "");
  const display_name = String(formData.get("display_name") ?? "").trim() || "Anonymous";
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid review id." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }
  if (comment.length < 3 || comment.length > 1000) {
    return { error: "Comment must be between 3 and 1000 characters." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("reviews")
    .update({ display_name, rating, comment })
    .eq("id", id);
  if (error) return { error: "Update failed." };
  revalidateAll();
  return {};
}

export async function deleteReviewAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Session expired. Please log in again." };
  }
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid review id." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: "Delete failed." };
  revalidateAll();
  return {};
}

export async function updateCafeAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Session expired. Please log in again." };
  }
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid cafe id." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const text = (key: string) => String(formData.get(key) ?? "").trim() || null;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("cafes")
    .update({
      name,
      street: text("street"),
      barangay: text("barangay"),
      district: text("district"),
      postcode: text("postcode"),
      opening_hours: text("opening_hours"),
      website: text("website"),
      phone: text("phone"),
      cuisine: text("cuisine"),
      wifi: formData.get("wifi") === "on",
      outdoor_seating: formData.get("outdoor_seating") === "on",
      aircon: formData.get("aircon") === "on",
    })
    .eq("id", id);
  if (error) return { error: "Update failed." };
  revalidateAll();
  return {};
}

export async function setHiddenAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const hidden = String(formData.get("hidden")) === "true";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("cafes").update({ hidden }).eq("id", id);
  revalidateAll();
}

export async function listCafePhotos(
  cafeId: string
): Promise<{ id: string; url: string; approved: boolean }[]> {
  try {
    await assertAdmin();
  } catch {
    return [];
  }
  if (!/^[0-9a-f-]{36}$/i.test(cafeId)) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cafe_photos")
    .select("id, storage_path, approved")
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((p) => ({
    id: p.id,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cafe-photos/${p.storage_path}`,
    approved: p.approved,
  }));
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function extensionFor(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export async function uploadCafePhotoAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Session expired. Please log in again." };
  }
  const cafeId = String(formData.get("cafe_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(cafeId)) return { error: "Invalid cafe id." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { error: "Only JPG, PNG, or WebP images are allowed." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: "Photo must be smaller than 5 MB." };
  }

  const ext = extensionFor(file.type);
  const path = `approved/${cafeId}/${randomBytes(12).toString("hex")}.${ext}`;
  const supabase = await createSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from("cafe-photos")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const user = await getAdminUser();
  const { error: insertError } = await supabase.from("cafe_photos").insert({
    cafe_id: cafeId,
    storage_path: path,
    approved: true,
    uploaded_by: user?.email ?? "admin",
  });
  if (insertError) {
    await supabase.storage.from("cafe-photos").remove([path]);
    return { error: "Could not save the photo record." };
  }

  revalidateAll();
  revalidatePath(`/cafe/${cafeId}`);
  return {};
}

export async function deletePhotoAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cafe_photos")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  await supabase.storage.from("cafe-photos").remove([data.storage_path]);
  await supabase.from("cafe_photos").delete().eq("id", id);
  revalidateAll();
}

export async function setPhotoApprovalAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const approved = String(formData.get("approved")) === "true";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = await createSupabaseServerClient();
  if (approved) {
    const { data } = await supabase
      .from("cafe_photos")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
    if (data && data.storage_path.startsWith("pending/")) {
      const newPath = data.storage_path.replace(/^pending\//, "approved/");
      const { error: moveError } = await supabase.storage
        .from("cafe-photos")
        .move(data.storage_path, newPath);
      if (!moveError) {
        await supabase
          .from("cafe_photos")
          .update({ storage_path: newPath })
          .eq("id", id);
      }
    }
  }
  await supabase.from("cafe_photos").update({ approved }).eq("id", id);
  revalidateAll();
}