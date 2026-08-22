"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Search,
  X,
} from "lucide-react";
import type { Cafe } from "@/lib/types";
import { setHiddenAction, updateCafeAction } from "@/app/admin/actions";

type AdminCafe = Cafe;

export function CafesModeration({ initialCafes }: { initialCafes: AdminCafe[] }) {
  const [cafes, setCafes] = useState(initialCafes);
  const [query, setQuery] = useState("");
  const [showHidden, setShowHidden] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cafes.filter(
      (c) =>
        (showHidden ? true : !c.hidden) &&
        (!q ||
          `${c.name} ${c.street ?? ""} ${c.barangay ?? ""} ${c.district ?? ""}`
            .toLowerCase()
            .includes(q))
    );
  }, [cafes, query, showHidden]);

  const patchLocal = (id: string, patch: Partial<AdminCafe>) =>
    setCafes((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">Cafes</h1>
      <p className="mt-1 text-sm text-bark/70">
        {cafes.length} listings · edit details or hide cafes from the public site.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <label className="relative block min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-bark/50"
            strokeWidth={2}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cafes..."
            className="h-9 w-full rounded-full border border-sand bg-paper pl-10 pr-4 text-sm text-espresso placeholder:text-bark/40 focus:border-brand focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => setShowHidden((s) => !s)}
          aria-pressed={showHidden}
          className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition ${
            showHidden
              ? "border-brand bg-brand/10 text-brand-dark"
              : "border-sand bg-paper text-bark hover:border-brand"
          }`}
        >
          {showHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {showHidden ? "Showing hidden too" : "Show hidden"}
        </button>
      </div>

      <ul className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-sand bg-paper p-10 text-center text-sm text-bark/60">
            No cafes match.
          </li>
        )}
        {filtered.map((cafe) => (
          <CafeRow key={cafe.id} cafe={cafe} onUpdated={(patch) => patchLocal(cafe.id, patch)} />
        ))}
      </ul>
    </div>
  );
}

function CafeRow({
  cafe,
  onUpdated,
}: {
  cafe: AdminCafe;
  onUpdated: (patch: Partial<AdminCafe>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hiddenBusy, setHiddenBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleHidden() {
    setHiddenBusy(true);
    try {
      const fd = new FormData();
      fd.set("id", cafe.id);
      fd.set("hidden", String(!cafe.hidden));
      await setHiddenAction(fd);
      onUpdated({ hidden: !cafe.hidden });
    } finally {
      setHiddenBusy(false);
    }
  }

  async function save(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await updateCafeAction(null, formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const text = (key: string) => String(formData.get(key) ?? "").trim();
    onUpdated({
      name: text("name"),
      street: text("street") || null,
      barangay: text("barangay") || null,
      district: text("district") || null,
      postcode: text("postcode") || null,
      opening_hours: text("opening_hours") || null,
      website: text("website") || null,
      phone: text("phone") || null,
      cuisine: text("cuisine") || null,
      wifi: formData.get("wifi") === "on",
      outdoor_seating: formData.get("outdoor_seating") === "on",
      aircon: formData.get("aircon") === "on",
    });
    setOpen(false);
  }

  return (
    <li
      className={`rounded-2xl border bg-paper transition-colors ${
        cafe.hidden ? "border-dashed border-sand/70 opacity-70" : "border-latte"
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            className={`size-4 shrink-0 text-bark/50 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
          <span className="min-w-0">
            <span className="block truncate font-display font-semibold text-espresso">
              {cafe.name}
              {cafe.hidden && (
                <span className="ml-2 rounded-full bg-sand/40 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-bark">
                  Hidden
                </span>
              )}
            </span>
            <span className="block truncate text-xs text-bark/60">
              {[cafe.street, cafe.barangay].filter(Boolean).join(", ") || "Davao City"}
            </span>
          </span>
        </button>

        <Link
          href={`/cafe/${cafe.id}`}
          target="_blank"
          title="View public page"
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand/10"
        >
          View
        </Link>
        <button
          type="button"
          onClick={toggleHidden}
          disabled={hiddenBusy}
          title={cafe.hidden ? "Show on public site" : "Hide from public site"}
          aria-label={cafe.hidden ? "Show on public site" : "Hide from public site"}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-bark/60 transition hover:bg-latte hover:text-espresso disabled:opacity-50"
        >
          {hiddenBusy ? (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />
          ) : cafe.hidden ? (
            <Eye className="size-4" strokeWidth={1.75} />
          ) : (
            <EyeOff className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {open && (
        <form action={save} className="border-t border-latte p-5 pt-4">
          <input type="hidden" name="id" value={cafe.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name *" name="name" defaultValue={cafe.name} required />
            <Field label="Street" name="street" defaultValue={cafe.street} />
            <Field label="Barangay" name="barangay" defaultValue={cafe.barangay} />
            <Field label="District" name="district" defaultValue={cafe.district} />
            <Field label="Postcode" name="postcode" defaultValue={cafe.postcode} />
            <Field label="Opening hours (OSM format)" name="opening_hours" defaultValue={cafe.opening_hours} />
            <Field label="Website" name="website" defaultValue={cafe.website} />
            <Field label="Phone" name="phone" defaultValue={cafe.phone} />
            <Field label="Cuisine" name="cuisine" defaultValue={cafe.cuisine} />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-bark">
            <AmenityCheckBox label="Wi-Fi" name="wifi" checked={cafe.wifi} />
            <AmenityCheckBox label="Outdoor seating" name="outdoor_seating" checked={cafe.outdoor_seating} />
            <AmenityCheckBox label="Air-conditioned" name="aircon" checked={cafe.aircon} />
          </div>

          {error && (
            <p className="mt-3 text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-5 py-2 text-xs font-semibold text-cream transition hover:bg-bark disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <Pencil className="size-3.5" strokeWidth={2} />
              )}
              Save listing
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand px-5 py-2 text-xs font-semibold text-bark transition hover:border-brand"
            >
              <X className="size-3.5" strokeWidth={2} />
              Close
            </button>
          </div>
        </form>
      )}
    </li>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-bark">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="w-full rounded-lg border border-sand bg-paper px-3 py-2 text-sm text-espresso focus:border-brand focus:outline-none"
      />
    </div>
  );
}

function AmenityCheckBox({
  label,
  name,
  checked,
}: {
  label: string;
  name: string;
  checked: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="size-4 accent-[#1ba7ae]"
      />
      {label}
    </label>
  );
}
