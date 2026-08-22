insert into storage.buckets (id, name, public, file_size_limit)
values ('profile-pictures', 'profile-pictures', true, 2097152)
on conflict (id) do update set public = true, file_size_limit = 2097152;

drop policy if exists "public read profile pictures" on storage.objects;
create policy "public read profile pictures" on storage.objects
  for select using (bucket_id = 'profile-pictures');

drop policy if exists "users upload own avatar" on storage.objects;
create policy "users upload own avatar" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-pictures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update own avatar" on storage.objects;
create policy "users update own avatar" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-pictures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own avatar" on storage.objects;
create policy "users delete own avatar" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-pictures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
