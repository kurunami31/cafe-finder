import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase-server";
import { AccountProfile } from "@/components/account/AccountProfile";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const supabaseUser = await getAdminUser();
  if (!supabaseUser) redirect("/login");

  const metadata = (supabaseUser.user_metadata ?? {}) as {
    display_name?: string;
    avatar_url?: string;
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-espresso sm:text-4xl">
        My account
      </h1>
      <p className="mt-2 text-sm text-bark/70">
        Manage how you appear on reviews and how you sign in.
      </p>
      <div className="mt-8">
        <AccountProfile
          email={supabaseUser.email ?? ""}
          initialName={metadata.display_name ?? ""}
          avatarUrl={metadata.avatar_url ?? null}
        />
      </div>
    </div>
  );
}
