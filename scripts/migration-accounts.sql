create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, cafe_id)
);

alter table public.user_favorites enable row level security;

drop policy if exists "own favorites select" on public.user_favorites;
create policy "own favorites select" on public.user_favorites
  for select using (auth.uid() = user_id);

drop policy if exists "own favorites insert" on public.user_favorites;
create policy "own favorites insert" on public.user_favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "own favorites delete" on public.user_favorites;
create policy "own favorites delete" on public.user_favorites
  for delete using (auth.uid() = user_id);

alter table public.reviews add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists idx_reviews_user on public.reviews (user_id, created_at desc);

drop policy if exists "own reviews update" on public.reviews;
create policy "own reviews update" on public.reviews
  for update using (auth.uid() is not null and user_id = auth.uid())
  with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "own reviews delete" on public.reviews;
create policy "own reviews delete" on public.reviews
  for delete using (auth.uid() is not null and user_id = auth.uid());
