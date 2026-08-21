"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createHash, randomBytes } from "node:crypto";
import { supabase } from "@/lib/supabase";

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

  const { error } = await supabase.from("reviews").insert({
    cafe_id: cafeId,
    display_name: displayName || "Anonymous",
    rating,
    comment,
    author_token: token,
  });

  if (error) {
    return { error: "Could not post your review. Please try again." };
  }

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/");
  return {};
}
