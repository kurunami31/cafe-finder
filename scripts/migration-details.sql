alter table public.cafes
  add column if not exists email text,
  add column if not exists facebook text,
  add column if not exists instagram text,
  add column if not exists takeaway boolean not null default false;
