-- EstateAI: 0003_leads

create type lead_type as enum (
  'buyer', 'renter', 'investor', 'seller', 'landlord', 'general'
);

create type lead_temperature as enum ('hot', 'warm', 'cold');

create type lead_status as enum (
  'new', 'contacted', 'qualified', 'inspection_booked',
  'negotiating', 'converted', 'lost', 'archived'
);

create type finance_status as enum (
  'unknown', 'not_started', 'in_progress', 'pre_approved', 'cash_buyer'
);

create type lead_purpose as enum ('owner_occupier', 'investment', 'unknown');

create table leads (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  assigned_agent_id uuid references agents (id) on delete set null,
  property_id uuid references properties (id) on delete set null,
  first_name text,
  last_name text,
  email text,
  phone text,
  lead_type lead_type not null default 'general',
  budget_min numeric(14, 2),
  budget_max numeric(14, 2),
  preferred_suburbs jsonb not null default '[]'::jsonb,
  preferred_property_types jsonb not null default '[]'::jsonb,
  bedrooms_required int,
  bathrooms_required int,
  parking_required int,
  finance_status finance_status not null default 'unknown',
  purchase_timeline text,
  purpose lead_purpose not null default 'unknown',
  lead_score int not null default 0 check (lead_score between 0 and 100),
  lead_temperature lead_temperature not null default 'cold',
  status lead_status not null default 'new',
  source text not null default 'website',
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_agency_id_idx on leads (agency_id);
create index leads_status_idx on leads (agency_id, status);
create index leads_temperature_idx on leads (agency_id, lead_temperature);
create index leads_assigned_agent_idx on leads (agency_id, assigned_agent_id);
create index leads_property_idx on leads (agency_id, property_id);
create index leads_next_follow_up_idx on leads (agency_id, next_follow_up_at);

create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- Score history so agencies can see how a lead's score evolved over the conversation.
create table lead_score_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  agency_id uuid not null references agencies (id) on delete cascade,
  score int not null check (score between 0 and 100),
  temperature lead_temperature not null,
  reason text,
  factors jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index lead_score_history_lead_id_idx on lead_score_history (lead_id, created_at desc);

comment on table lead_score_history is 'Append-only audit trail written every time lib/ai/scoring recomputes a lead score.';
