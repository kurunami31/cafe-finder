alter table public.cafes add column if not exists hidden boolean not null default false;
create index if not exists idx_cafes_hidden on public.cafes (hidden);

drop policy if exists "admins can update reviews" on public.reviews;
create policy "admins can update reviews" on public.reviews
  for update using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "admins can delete reviews" on public.reviews;
create policy "admins can delete reviews" on public.reviews
  for delete using (auth.uid() is not null);

drop policy if exists "admins can update cafes" on public.cafes;
create policy "admins can update cafes" on public.cafes
  for update using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "admins can insert cafes" on public.cafes;
create policy "admins can insert cafes" on public.cafes
  for insert with check (auth.uid() is not null);

drop policy if exists "admins can delete cafes" on public.cafes;
create policy "admins can delete cafes" on public.cafes
  for delete using (auth.uid() is not null);
