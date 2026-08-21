"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownWideNarrow,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Wifi,
  Sun,
  Snowflake,
} from "lucide-react";
import type { CafeWithRating } from "@/lib/types";
import {
  filterAndSort,
  hasAnyReviews,
  SORT_LABELS,
  type FilterKey,
  type SortKey,
} from "@/lib/browse";
import { CafeCard } from "@/components/CafeCard";

const PAGE_SIZE = 12;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "open", label: "Open now" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "outdoor", label: "Outdoor seating" },
  { key: "aircon", label: "Air-conditioned" },
];

const SORTS = Object.entries(SORT_LABELS).map(([key, label]) => ({
  key: key as SortKey,
  label,
}));

export function HomeClient({ cafes }: { cafes: CafeWithRating[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<FilterKey>>(new Set());
  const [sort, setSort] = useState<SortKey>("name");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const toggle = (f: FilterKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
    setPage(1);
  };

  const sorted = useMemo(
    () => filterAndSort(cafes, query, active, sort),
    [cafes, query, active, sort]
  );

  const anyReviews = useMemo(() => hasAnyReviews(sorted), [sorted]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goToPage = (p: number) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pages = useMemo(() => {
    const list: number[] = [];
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    for (let i = start; i <= Math.min(totalPages, start + 4); i++) list.push(i);
    return list;
  }, [currentPage, totalPages]);

  return (
    <div ref={topRef} className="scroll-mt-20">
      <div className="sticky top-0 z-10 border-b border-latte bg-cream/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto max-w-6xl">
          <label className="relative block max-w-2xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-bark/50"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search cafes by name or area..."
              className="w-full rounded-full border border-sand bg-paper py-3 pl-12 pr-4 text-sm text-espresso shadow-sm transition placeholder:text-bark/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                aria-pressed={active.has(key)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-px ${
                  active.has(key)
                    ? "border-brand bg-brand text-white shadow-sm shadow-brand/30"
                    : "border-sand bg-paper text-bark hover:border-brand"
                }`}
              >
                {key === "wifi" && <Wifi className="size-3.5" strokeWidth={2} />}
                {key === "outdoor" && <Sun className="size-3.5" strokeWidth={2} />}
                {key === "aircon" && <Snowflake className="size-3.5" strokeWidth={2} />}
                {label}
              </button>
            ))}
            <SortDropdown
              value={sort}
              onChange={(next) => {
                setSort(next);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-bark/60">
            Showing{" "}
            <span className="font-semibold text-bark">
              {pageItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
              {(currentPage - 1) * PAGE_SIZE + pageItems.length}
            </span>{" "}
            of <span className="font-semibold text-bark">{sorted.length}</span> cafes
          </p>
          <p className="flex items-center gap-1.5 text-xs font-medium text-bark/50">
            <ArrowDownWideNarrow className="size-3.5" strokeWidth={2} />
            Sorted by{" "}
            <span className="font-semibold text-bark">{SORT_LABELS[sort]}</span>
          </p>
        </div>

        {!anyReviews && sort !== "name" && sorted.length > 0 && (
          <p className="-mt-3 mb-5 rounded-xl bg-latte/50 px-4 py-2.5 text-xs text-bark/70">
            No reviews have been posted yet, so every cafe is currently tied — ratings and
            review counts will reorder this list as soon as reviews come in.
          </p>
        )}

        {pageItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand bg-paper p-12 text-center animate-fade-in">
            <Search className="mx-auto size-8 text-sand" strokeWidth={1.5} />
            <p className="mt-4 font-display text-lg font-semibold text-espresso">
              No cafes found
            </p>
            <p className="mt-1 text-sm text-bark/60">
              Try a different search term or remove some filters.
            </p>
          </div>
        ) : (
          <div
            key={`${currentPage}-${query}-${sort}-${[...active].join(",")}`}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {pageItems.map((cafe, i) => (
              <div
                key={cafe.id}
                className="h-full animate-rise"
                style={{ animationDelay: `${Math.min(i * 55, 500)}ms` }}
              >
                <CafeCard cafe={cafe} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-center gap-1.5"
          >
            <PageButton
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              label="Previous page"
            >
              <ChevronLeft className="size-4" strokeWidth={2} />
            </PageButton>
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`size-9 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-px ${
                  p === currentPage
                    ? "bg-espresso text-cream shadow-md"
                    : "border border-sand bg-paper text-bark hover:border-brand"
                }`}
              >
                {p}
              </button>
            ))}
            <PageButton
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              label="Next page"
            >
              <ChevronRight className="size-4" strokeWidth={2} />
            </PageButton>
          </nav>
        )}
      </div>
    </div>
  );
}

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-sand bg-paper text-bark transition-all duration-200 hover:-translate-y-px hover:border-brand disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (next: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = SORTS.find((s) => s.key === value)!;

  return (
    <div ref={rootRef} className="relative ml-auto flex w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort cafes"
        className={`inline-flex h-8 w-full items-center justify-between gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-px sm:w-auto ${
          open
            ? "border-brand bg-brand/10 text-brand-dark"
            : "border-sand bg-paper text-bark hover:border-brand"
        }`}
      >
        <ArrowDownWideNarrow className="size-3.5 text-brand-dark" strokeWidth={2} />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">Sort</span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 top-full z-20 mt-2 w-full min-w-44 animate-rise overflow-hidden rounded-[1.4rem] border border-latte bg-paper p-1 shadow-lg shadow-espresso/10 sm:w-auto"
        >
          {SORTS.map((s) => {
            const selected = s.key === value;
            return (
              <li key={s.key} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(s.key);
                    setOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors ${
                    selected
                      ? "bg-brand/10 text-brand-dark"
                      : "text-bark hover:bg-latte hover:text-espresso"
                  }`}
                >
                  <span className={selected ? "" : "pl-5"}>{s.label}</span>
                  {selected && <Check className="size-3.5 shrink-0" strokeWidth={2.5} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
