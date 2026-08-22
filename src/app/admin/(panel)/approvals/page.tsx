import Image from "next/image";
import Link from "next/link";
import { Check, ImageIcon, Trash2 } from "lucide-react";
import { getPhotosByStatus } from "@/lib/admin-data";
import {
  deletePhotoAction,
  setPhotoApprovalAction,
} from "@/app/admin/actions";

export const metadata = { title: "Photo Approvals" };

function publicUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cafe-photos/${path}`;
}

export default async function ApprovalsPage() {
  const pending = await getPhotosByStatus(false);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">
        Photo approvals
      </h1>
      <p className="mt-1 text-sm text-bark/70">
        {pending.length} visitor-submitted photo{pending.length !== 1 ? "s" : ""} awaiting review.
        Approved photos appear publicly on the cafe page.
      </p>

      {pending.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-sand bg-paper p-10 text-center animate-fade-in">
          <ImageIcon className="mx-auto size-8 text-sand" strokeWidth={1.5} />
          <p className="mt-3 text-sm italic text-bark/60">Queue is empty.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {pending.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-latte bg-paper p-4"
            >
              <Image
                src={publicUrl(p.storage_path)}
                alt={`Submission for ${p.cafe_name ?? "cafe"}`}
                width={128}
                height={96}
                className="h-24 w-32 rounded-xl object-cover ring-2 ring-amber-400"
                unoptimized
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/cafe/${p.cafe_id}`}
                  target="_blank"
                  className="block truncate font-display font-semibold text-espresso hover:text-brand-dark"
                >
                  {p.cafe_name ?? "Unknown cafe"}
                </Link>
                <p className="text-xs text-bark/60">
                  Submitted by {p.uploaded_by} ·{" "}
                  {new Date(p.created_at + "Z").toLocaleString("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Manila",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={setPhotoApprovalAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="approved" value="true" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full bg-leaf px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                  >
                    <Check className="size-3.5" strokeWidth={2.5} />
                    Approve
                  </button>
                </form>
                <form action={deletePhotoAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    title="Reject and delete"
                    aria-label="Reject and delete"
                    className="inline-flex size-9 items-center justify-center rounded-full border border-sand text-bark transition hover:border-red-500 hover:text-red-600"
                  >
                    <Trash2 className="size-4" strokeWidth={1.75} />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

