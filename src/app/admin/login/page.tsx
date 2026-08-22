import type { Metadata } from "next";
import Image from "next/image";
import { ShieldAlert } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm animate-rise rounded-3xl border border-latte bg-paper p-8 shadow-md">
        <Image
          src="/icon-emblem.png"
          alt="Cafe Finder"
          width={96}
          height={96}
          priority
          className="mx-auto size-14 rounded-full object-cover"
        />
        <h1 className="mt-4 text-center font-display text-2xl font-semibold text-espresso">
          Admin
        </h1>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-bark/60">
          <ShieldAlert className="size-3.5" strokeWidth={2} />
          Authorized access only
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
