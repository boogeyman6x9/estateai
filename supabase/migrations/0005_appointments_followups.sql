-- EstateAI: 0005_appointments_followups

create type appointment_type as enum ('inspection', 'call', 'meeting', 'other');

create type appointment_status as enum (
  'requested', 'confirmed', 'completed', 'cancelled', 'no_show'
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  property_id uuid references properties (id) on delete set null,
  agent_id uuid references agents (id) on delete set null,
  appointment_type appointment_type not null default 'inspection',
  scheduled_at timestamptz not null,
  status appointment_status not null default 'requested',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_agency_id_idx on appointments (agency_id);
create index appointments_scheduled_at_idx on appointments (agency_id, scheduled_at);
create index appointments_lead_id_idx on appointments (lead_id);

create trigger appointments_set_updated_at
  before update on appointments
  for each row execute function set_updated_at();

create type follow_up_status as enum ('scheduled', 'sent', 'cancelled', 'failed');

create table follow_ups (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  conversation_id uuid references conversations (id) on delete set null,
  scheduled_for timestamptz not null,
  channel conversation_channel not null default 'website',
  message text not null,
  status follow_up_status not null default 'scheduled',
  attempts int not null default 0,
  executed_at timestamptz,
  created_at timestamptz not null default now()
);

create index follow_ups_agency_id_idx on follow_ups (agency_id);
create index follow_ups_scheduled_for_idx on follow_ups (status, scheduled_for);
create index follow_ups_lead_id_idx on follow_ups (lead_id);

comment on table follow_ups is 'Queue consumed by a scheduled job (Vercel Cron / Supabase Edge Function) — see lib/ai/ follow-up service, built in Phase 7.';
