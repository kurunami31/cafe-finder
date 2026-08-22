create table if not exists public.edit_suggestions (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  field text not null check (field in ('opening_hours', 'website', 'phone', 'closed', 'address', 'other')),
  suggested_value text,
  note text not null check (char_length(note) between 5 and 500),
  author_token text not null,
  status text not null default 'pending' check (status in ('pending', 'applied', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_edit_suggestions_status on public.edit_suggestions (status, created_at desc);

alter table public.edit_suggestions enable row level security;

drop policy if exists "anyone can submit edit suggestions" on public.edit_suggestions;
create policy "anyone can submit edit suggestions" on public.edit_suggestions
  for insert with check (status = 'pending');

drop policy if exists "admins manage edit suggestions" on public.edit_suggestions;
create policy "admins manage edit suggestions" on public.edit_suggestions
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);
