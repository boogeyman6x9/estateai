-- EstateAI: 0001_init_schema
-- Extensions, enums, and the core identity tables: agencies, profiles, agents.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('owner', 'agent', 'admin');

create type subscription_plan as enum ('starter', 'professional', 'enterprise');

create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');

-- ---------------------------------------------------------------------------
-- agencies
-- ---------------------------------------------------------------------------

create table agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  phone text,
  email text,
  website text,
  address text,
  timezone text not null default 'Australia/Sydney',
  subscription_plan subscription_plan not null default 'starter',
  subscription_status subscription_status not null default 'trialing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table agencies is 'A real-estate agency tenant. Every other business table hangs off agency_id for row-level isolation.';

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  agency_id uuid references agencies (id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  avatar_url text,
  role user_role not null default 'agent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table profiles is 'App-level user profile, one row per auth.users row. role drives RBAC and is only ever set server-side.';

-- Admin (platform staff) profiles may have a null agency_id.
create index profiles_agency_id_idx on profiles (agency_id);

-- ---------------------------------------------------------------------------
-- agents (an agency's staff who can be assigned leads/properties)
-- ---------------------------------------------------------------------------

create table agents (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  title text,
  bio text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, profile_id)
);

create index agents_agency_id_idx on agents (agency_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper, reused by every table below
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger agencies_set_updated_at
  before update on agencies
  for each row execute function set_updated_at();

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger agents_set_updated_at
  before update on agents
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper functions used throughout RLS policies (0007) and application code.
-- SECURITY DEFINER + a fixed search_path so they can safely read profiles
-- from inside a policy without recursive RLS evaluation.
-- ---------------------------------------------------------------------------

create or replace function current_agency_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select agency_id from profiles where id = auth.uid();
$$;

create or replace function current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'admin', false);
$$;

-- ---------------------------------------------------------------------------
-- New-user bootstrap: create a profile row automatically when someone signs
-- up via Supabase Auth. Agency assignment happens afterwards in onboarding.
-- ---------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'owner'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
