create extension if not exists "pgcrypto";

create table if not exists public.cafes (
  id uuid primary key default gen_random_uuid(),
  osm_id text unique not null,
  name text not null,
  street text,
  barangay text,
  district text,
  postcode text,
  lat double precision not null,
  lng double precision not null,
  opening_hours text,
  website text,
  phone text,
  cuisine text,
  wifi boolean not null default false,
  outdoor_seating boolean not null default false,
  aircon boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  display_name text not null default 'Anonymous' check (char_length(display_name) <= 40),
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 3 and 1000),
  author_token text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_cafe on public.reviews (cafe_id, created_at desc);
create index if not exists idx_reviews_author_time on public.reviews (author_token, created_at desc);
create index if not exists idx_cafes_lower_name on public.cafes (lower(name));

alter table public.cafes enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "public can read cafes" on public.cafes;
create policy "public can read cafes" on public.cafes for select using (true);

drop policy if exists "public can read reviews" on public.reviews;
create policy "public can read reviews" on public.reviews for select using (true);

drop policy if exists "anyone can insert reviews" on public.reviews;
create policy "anyone can insert reviews" on public.reviews for insert with check (
  char_length(comment) between 3 and 1000
  and rating between 1 and 5
  and char_length(coalesce(display_name, '')) <= 40
  and author_token is not null
  and char_length(author_token) = 64
);
