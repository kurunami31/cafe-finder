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
