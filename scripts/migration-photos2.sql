alter table public.cafe_photos add column if not exists author_token text;
create index if not exists idx_cafe_photos_author on public.cafe_photos (author_token, created_at desc);
