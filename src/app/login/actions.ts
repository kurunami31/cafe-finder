"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient, getAdminUser } from "@/lib/supabase-server";

export async function signInWithPasswordAction(
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
  if (error) {
    switch (error.code ?? error.status) {
      case "email_not_confirmed":
      case 401:
        return { error: "This email hasn't been confirmed yet. Use the magic-link option once to confirm it." };
      case "invalid_credentials":
        return { error: "Invalid email or password." };
      case "over_request_rate_limit":
      case 429:
        return { error: "Too many attempts. Please wait a minute and try again." };
      default:
        return { error: `Sign-in failed: ${error.message}` };
    }
  }
  redirect("/favorites");
}

export async function sendMagicLinkAction(  _prev: { error?: string; sent?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; sent?: boolean }> {  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  const supabase = await createSupabaseServerClient();
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${proto}://${host}/auth/callback`,
    },
  });
  if (error) {
    if (error.code === "over_email_send_rate_limit") {
      return { error: "Too many emails sent. Please wait a minute and try again." };
    }
    return { error: `Could not send the link: ${error.message}` };
  }
  return { sent: true };
}

export async function publicSignOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function mergeFavoritesAction(localIds: string[]): Promise<void> {
  const user = await getAdminUser();
  if (!user || localIds.length === 0) return;
  const supabase = await createSupabaseServerClient();
  const rows = localIds
    .filter((id) => /^[0-9a-f-]{36}$/i.test(id))
    .map((cafe_id) => ({ user_id: user.id, cafe_id }));
  if (rows.length > 0) {
    await supabase.from("user_favorites").upsert(rows, { onConflict: "user_id,cafe_id" });
  }
}

export async function getUserFavoriteIds(): Promise<string[]> {
  const user = await getAdminUser();
  if (!user) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_favorites")
    .select("cafe_id")
    .eq("user_id", user.id);
  return (data ?? []).map((r) => r.cafe_id);
}

export async function toggleServerFavoriteAction(cafeId: string): Promise<boolean> {
  const user = await getAdminUser();
  if (!user) throw new Error("Not signed in");
  if (!/^[0-9a-f-]{36}$/i.test(cafeId)) throw new Error("Invalid cafe");
  const supabase = await createSupabaseServerClient();
  const existing = await supabase
    .from("user_favorites")
    .select("cafe_id")
    .eq("user_id", user.id)
    .eq("cafe_id", cafeId)
    .maybeSingle();
  if (existing.data) {
    await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("cafe_id", cafeId);
    revalidatePath("/favorites");
    return false;
  }
  await supabase.from("user_favorites").insert({ user_id: user.id, cafe_id: cafeId });
  revalidatePath("/favorites");
  return true;
}

export async function toggleServerFavoriteIfSignedIn(
  cafeId: string
): Promise<boolean | null> {
  const user = await getAdminUser();
  if (!user) return null;
  if (!/^[0-9a-f-]{36}$/i.test(cafeId)) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_favorites")
    .select("cafe_id")
    .eq("user_id", user.id)
    .eq("cafe_id", cafeId)
    .maybeSingle();
  if (data) {
    await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("cafe_id", cafeId);
    revalidatePath("/favorites");
    return false;
  }
  await supabase.from("user_favorites").insert({ user_id: user.id, cafe_id: cafeId });
  revalidatePath("/favorites");
  return true;
}

export async function deleteMyReviewAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "Please sign in first." };
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid review." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: "You can only delete reviews you posted while signed in." };
  revalidatePath("/", "layout");
  return {};
}
