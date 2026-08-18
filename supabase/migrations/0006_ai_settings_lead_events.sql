-- EstateAI: 0006_ai_settings_lead_events

create table ai_settings (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null unique references agencies (id) on delete cascade,
  enabled boolean not null default true,
  assistant_name text not null default 'Alex',
  personality text not null default 'professional',
  greeting text not null default 'Hi! Thanks for your enquiry — how can I help you today?',
  qualification_enabled boolean not null default true,
  lead_scoring_enabled boolean not null default true,
  follow_up_enabled boolean not null default true,
  booking_enabled boolean not null default true,
  custom_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ai_settings_set_updated_at
  before update on ai_settings
  for each row execute function set_updated_at();

comment on table ai_settings is 'One row per agency. Created automatically when an agency is created — see handle_new_agency().';

create type lead_event_type as enum (
  'lead_created',
  'message_received',
  'ai_response',
  'lead_scored',
  'lead_qualified',
  'inspection_requested',
  'inspection_booked',
  'agent_assigned',
  'follow_up_scheduled',
  'follow_up_sent',
  'lead_converted',
  'status_changed',
  'note_added'
);

create table lead_events (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  event_type lead_event_type not null,
  actor_type sender_type not null default 'system',
  actor_id uuid,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index lead_events_agency_id_idx on lead_events (agency_id, created_at desc);
create index lead_events_lead_id_idx on lead_events (lead_id, created_at);
create index lead_events_type_idx on lead_events (agency_id, event_type);

comment on table lead_events is 'Append-only activity feed powering the lead timeline UI and analytics dashboard.';

-- Auto-create an agencies row's ai_settings + a lead_events row whenever a lead is created.
create or replace function handle_new_agency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into ai_settings (agency_id) values (new.id);
  return new;
end;
$$;

create trigger on_agency_created
  after insert on agencies
  for each row execute function handle_new_agency();

create or replace function handle_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into lead_events (agency_id, lead_id, event_type, actor_type, data)
  values (new.agency_id, new.id, 'lead_created', 'system', jsonb_build_object('source', new.source));
  return new;
end;
$$;

create trigger on_lead_created
  after insert on leads
  for each row execute function handle_new_lead();
