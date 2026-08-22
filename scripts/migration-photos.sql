insert into storage.buckets (id, name, public, file_size_limit)
values ('cafe-photos', 'cafe-photos', true, 5242880)
on conflict (id) do update set public = true, file_size_limit = 5242880;

drop policy if exists "public read cafe photos" on storage.objects;
create policy "public read cafe photos" on storage.objects
  for select using (bucket_id = 'cafe-photos');

drop policy if exists "anyone can upload cafe photos" on storage.objects;
create policy "anyone can upload cafe photos" on storage.objects
  for insert with check (
    bucket_id = 'cafe-photos'
    and (storage.foldername(name))[1] in ('approved', 'pending')
  );

drop policy if exists "admins can manage cafe photo files" on storage.objects;
create policy "admins can manage cafe photo files" on storage.objects
  for update using (auth.uid() is not null);

drop policy if exists "admins can delete cafe photo files" on storage.objects;
create policy "admins can delete cafe photo files" on storage.objects
  for delete using (auth.uid() is not null);

create table if not exists public.cafe_photos (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  storage_path text unique not null,
  approved boolean not null default false,
  uploaded_by text not null default 'visitor',
  created_at timestamptz not null default now()
);

create index if not exists idx_cafe_photos_cafe on public.cafe_photos (cafe_id, approved);

alter table public.cafe_photos enable row level security;

drop policy if exists "public read approved cafe photos" on public.cafe_photos;
create policy "public read approved cafe photos" on public.cafe_photos
  for select using (approved or auth.uid() is not null);

drop policy if exists "anyone can submit cafe photos" on public.cafe_photos;
create policy "anyone can submit cafe photos" on public.cafe_photos
  for insert with check (approved = false or auth.uid() is not null);

drop policy if exists "admins manage cafe photos" on public.cafe_photos;
create policy "admins manage cafe photos" on public.cafe_photos
  for update using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "admins delete cafe photos" on public.cafe_photos;
create policy "admins delete cafe photos" on public.cafe_photos
  for delete using (auth.uid() is not null);
