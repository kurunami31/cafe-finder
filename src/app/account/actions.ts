"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function requireSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}

export async function updateDisplayNameAction(
  _prev: { error?: string; saved?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; saved?: boolean }> {
  const session = await requireSession();
  if (!session) {
    return { error: "Please sign in first." };
  }
  const name = String(formData.get("display_name") ?? "").trim();
  if (name.length < 2 || name.length > 40) {
    return { error: "Display name must be between 2 and 40 characters." };
  }
  const { error } = await session.supabase.auth.updateUser({
    data: { display_name: name },
  });
  if (error) return { error: "Could not save your name." };
  revalidatePath("/account");
  revalidatePath("/", "layout");
  return { saved: true };
}

export async function updatePasswordAction(
  _prev: { error?: string; saved?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; saved?: boolean }> {
  const session = await requireSession();
  if (!session) {
    return { error: "Please sign in first." };
  }
  const { supabase } = session;
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.message.includes("at least")) {
      return { error: error.message };
    }
    return { error: "Could not update your password. Try signing out and in again." };
  }
  return { saved: true };
}

export type AvatarResult = { error?: string; url?: string };

export async function uploadAvatarAction(
  _prev: AvatarResult | null,
  formData: FormData
): Promise<AvatarResult> {
  const session = await requireSession();
  if (!session) {
    return { error: "Please sign in first." };
  }
  const { supabase, user } = session;

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "Only JPG, PNG, or WebP images are allowed." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Image must be smaller than 2 MB." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/avatar.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("profile-pictures")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const publicUrl = `${
    process.env.NEXT_PUBLIC_SUPABASE_URL
  }/storage/v1/object/public/profile-pictures/${path}?v=${Date.now()}`;
  const { error: metaError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  });
  if (metaError) {
    return { error: "Uploaded but could not save to your profile." };
  }

  revalidatePath("/account");
  revalidatePath("/", "layout");
  return { url: publicUrl };
}
