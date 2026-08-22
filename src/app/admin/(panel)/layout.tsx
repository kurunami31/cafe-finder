import Link from "next/link";
import { Coffee, ClipboardList, ImagePlus, MessageSquareText, Store, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin-data";
import { signOutAction } from "@/app/admin/actions";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="border-b border-latte bg-paper">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-display font-semibold text-espresso">
            <span className="flex size-7 items-center justify-center rounded-full bg-espresso text-cream">
              <Coffee className="size-4" strokeWidth={1.75} />
            </span>
            Admin
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-bark">
            <AdminTab href="/admin" icon={<MessageSquareText className="size-4" strokeWidth={1.75} />}>
              Reviews
            </AdminTab>
            <AdminTab href="/admin/cafes" icon={<Store className="size-4" strokeWidth={1.75} />}>
              Cafes
            </AdminTab>
            <AdminTab href="/admin/approvals" icon={<ImagePlus className="size-4" strokeWidth={1.75} />}>
              Approvals
            </AdminTab>
            <AdminTab href="/admin/suggestions" icon={<ClipboardList className="size-4" strokeWidth={1.75} />}>
              Suggestions
            </AdminTab>
            <form action={signOutAction}>
              <button
                type="submit"
                title={`Signed in as ${user.email}`}
                className="ml-2 flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 transition hover:border-brand hover:text-brand-dark"
              >
                <LogOut className="size-4" strokeWidth={1.75} />
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

function AdminTab({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-latte hover:text-espresso"
    >
      {icon}
      {children}
    </Link>
  );
}
