-- EstateAI: 0002_properties

create type property_status as enum (
  'draft', 'active', 'under_offer', 'sold', 'leased', 'withdrawn'
);

create type listing_type as enum ('sale', 'rent');

create type property_type as enum (
  'house', 'apartment', 'townhouse', 'villa', 'land', 'commercial', 'other'
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  agent_id uuid references agents (id) on delete set null,
  title text not null,
  description text,
  property_type property_type not null default 'house',
  listing_type listing_type not null default 'sale',
  status property_status not null default 'draft',
  price numeric(14, 2),
  price_display text,
  bedrooms int,
  bathrooms int,
  parking_spaces int,
  address text not null,
  suburb text not null,
  state text,
  postcode text,
  latitude double precision,
  longitude double precision,
  features jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  inspection_information text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_agency_id_idx on properties (agency_id);
create index properties_status_idx on properties (agency_id, status);
create index properties_suburb_idx on properties (agency_id, suburb);
create index properties_price_idx on properties (agency_id, price);

create trigger properties_set_updated_at
  before update on properties
  for each row execute function set_updated_at();

comment on column properties.features is 'Array of short feature strings, e.g. ["Pool", "Air conditioning"]. The AI layer must only ever surface features present here — never invent them.';
comment on column properties.images is 'Array of {url, alt, is_hero} objects. Storage handled via a Supabase Storage bucket, not inline here.';
