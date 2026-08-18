-- EstateAI: 0004_conversations_messages

create type conversation_channel as enum (
  'website', 'sms', 'whatsapp', 'email', 'phone', 'manual'
);

create type conversation_status as enum ('active', 'paused', 'closed');

create type sender_type as enum ('lead', 'ai', 'agent', 'system');

create table conversations (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  property_id uuid references properties (id) on delete set null,
  channel conversation_channel not null default 'website',
  status conversation_status not null default 'active',
  ai_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_agency_id_idx on conversations (agency_id);
create index conversations_lead_id_idx on conversations (lead_id);

create trigger conversations_set_updated_at
  before update on conversations
  for each row execute function set_updated_at();

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  -- Denormalized for RLS performance so we don't have to join through conversations.
  agency_id uuid not null references agencies (id) on delete cascade,
  sender_type sender_type not null,
  sender_id uuid,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on messages (conversation_id, created_at);
create index messages_agency_id_idx on messages (agency_id);

comment on column messages.metadata is 'Free-form: AI model used, matched property ids, token usage, delivery status for SMS/WhatsApp, etc.';
