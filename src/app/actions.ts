"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createHash, randomBytes } from "node:crypto";
import { supabase } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rate-limit";

async function getAuthorToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get("cf_session")?.value;
  if (existing && /^[0-9a-f]{64}$/.test(existing)) return existing;
  const token = createHash("sha256").update(randomBytes(32)).digest("hex");
  store.set("cf_session", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return token;
}

export type ReviewResult = { error?: string };

export async function submitReview(
  cafeId: string,
  _prev: ReviewResult | null,
  formData: FormData
): Promise<ReviewResult> {
  if (!(await checkRateLimit("review", 5, 10 * 60 * 1000))) {
    return { error: "Too many reviews submitted from this network. Please try again later." };
  }
  const displayName = String(formData.get("display_name") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Please choose a star rating." };
  }
  if (comment.length < 3 || comment.length > 1000) {
    return { error: "Your review must be between 3 and 1000 characters." };
  }
  if (displayName.length > 40) {
    return { error: "Name must be 40 characters or fewer." };
  }

  const token = await getAuthorToken();
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("author_token", token)
    .gte("created_at", twoMinutesAgo);

  if ((count ?? 0) > 0) {
    return { error: "You just posted a review. Please wait a couple of minutes." };
  }

  const user = await getAdminUser();

  const { error } = await supabase.from("reviews").insert({
    cafe_id: cafeId,
    display_name: displayName || "Anonymous",
    rating,
    comment,
    author_token: token,
    user_id: user?.id ?? null,
  });

  if (error) {
    return { error: "Could not post your review. Please try again." };
  }

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/");
  return {};
}

export type PhotoResult = { error?: string };

export type EditSuggestionResult = { error?: string; sent?: boolean };

export async function submitEditSuggestion(
  cafeId: string,
  _prev: EditSuggestionResult | null,
  formData: FormData
): Promise<EditSuggestionResult> {
  if (!(await checkRateLimit("suggestion", 5, 60 * 60 * 1000))) {
    return { error: "Too many suggestions from this network. Please try again later." };
  }
  if (!/^[0-9a-f-]{36}$/i.test(cafeId)) {
    return { error: "Invalid cafe." };
  }

  const field = String(formData.get("field") ?? "");
  const allowedFields = ["opening_hours", "website", "phone", "closed", "address", "other"];
  if (!allowedFields.includes(field)) {
    return { error: "Choose what needs fixing." };
  }
  const suggestedValue =
    field === "closed" ? "" : String(formData.get("suggested_value") ?? "").trim();
  if (field !== "closed" && suggestedValue.length === 0) {
    return { error: "Please enter the correct information." };
  }
  const note = String(formData.get("note") ?? "").trim();
  if (note.length < 5 || note.length > 500) {
    return { error: "Tell us a bit more (5-500 characters)." };
  }

  const token = await getAuthorToken();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("edit_suggestions")
    .select("id", { count: "exact", head: true })
    .eq("author_token", token)
    .gte("created_at", dayAgo);
  if ((count ?? 0) >= 5) {
    return { error: "You have submitted several suggestions today. Please try again tomorrow." };
  }

  const { error } = await supabase.from("edit_suggestions").insert({
    cafe_id: cafeId,
    field,
    suggested_value: suggestedValue || null,
    note,
    author_token: token,
  });
  if (error) return { error: "Could not submit your suggestion. Please try again." };

  return { sent: true };
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

export async function submitPhoto(
  cafeId: string,
  _prev: PhotoResult | null,
  formData: FormData
): Promise<PhotoResult> {
  if (!(await checkRateLimit("photo", 10, 60 * 60 * 1000))) {
    return { error: "Too many uploads from this network. Please try again later." };
  }
  if (!/^[0-9a-f-]{36}$/i.test(cafeId)) {
    return { error: "Invalid cafe." };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a photo to upload." };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { error: "Only JPG, PNG, or WebP images are allowed." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: "Photo must be smaller than 5 MB." };
  }

  const token = await getAuthorToken();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("cafe_photos")
    .select("id", { count: "exact", head: true })
    .eq("author_token", token)
    .gte("created_at", dayAgo);
  if ((count ?? 0) >= 3) {
    return {
      error: "You have already suggested 3 photos today. Please try again tomorrow.",
    };
  }

  const ext = extensionFor(file.type);
  const path = `pending/${cafeId}/${randomBytes(12).toString("hex")}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("cafe-photos")
    .upload(path, file, { contentType: file.type });
  if (uploadError) {
    return { error: "Upload failed. Please try again." };
  }

  const { error: insertError } = await supabase.from("cafe_photos").insert({
    cafe_id: cafeId,
    storage_path: path,
    approved: false,
    uploaded_by: "visitor",
    author_token: token,
  });
  if (insertError) {
    await supabase.storage.from("cafe-photos").remove([path]);
    return { error: "Could not save your submission. Please try again." };
  }

  return {};
}
