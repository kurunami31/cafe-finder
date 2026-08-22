import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase-server";
import { MagicLinkForm } from "@/components/login/MagicLinkForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getAdminUser();
  if (user) redirect("/favorites");
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="rounded-3xl border border-latte bg-paper p-8 shadow-sm animate-rise">
        <Image
          src="/icon-emblem.png"
          alt="Cafe Finder"
          width={96}
          height={96}
          priority
          className="mx-auto size-12 rounded-full object-cover"
        />
        <h1 className="mt-4 text-center font-display text-2xl font-semibold text-espresso">
          Sign in
        </h1>
        <p className="mt-1 text-center text-xs leading-relaxed text-bark/60">
          Sync your favorites across devices and manage your reviews.
        </p>
        {error === "link" && (
          <p className="mt-4 rounded-xl bg-red-900/5 px-4 py-3 text-center text-xs font-medium text-red-900 dark:bg-red-400/10 dark:text-red-300">
            That sign-in link is invalid or expired. Request a new one below.
          </p>
        )}
        <div className="mt-6">
          <MagicLinkForm />
        </div>
      </div>
    </div>
  );
}
