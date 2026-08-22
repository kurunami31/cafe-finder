-- Hidden cafes must be unreadable at the database level, not just filtered in app code.
drop policy if exists "public can read cafes" on public.cafes;
create policy "public read visible cafes" on public.cafes
  for select using (hidden = false or auth.uid() is not null);

-- Anonymous visitors may only upload into the pending/ folder; admins keep full access.
drop policy if exists "anyone can upload cafe photos" on storage.objects;
create policy "anon upload cafe photos pending only" on storage.objects
  for insert to anon
  with check (
    bucket_id = 'cafe-photos'
    and (storage.foldername(name))[1] = 'pending'
  );

create policy "admins can upload cafe photos anywhere" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cafe-photos');
