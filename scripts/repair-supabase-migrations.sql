create schema if not exists supabase_migrations;

create table if not exists supabase_migrations.schema_migrations (
  version text not null primary key,
  statements jsonb,
  name text,
  inserted_at timestamptz default now()
);

grant usage on schema supabase_migrations to postgres, anon, authenticated, service_role, supabase_auth_admin;
grant all on all tables in schema supabase_migrations to postgres, supabase_auth_admin, service_role;
grant all on all sequences in schema supabase_migrations to postgres, supabase_auth_admin, service_role;
alter default privileges in schema supabase_migrations grant all on tables to postgres, supabase_auth_admin, service_role;
alter default privileges in schema supabase_migrations grant all on sequences to postgres, supabase_auth_admin, service_role;
