-- EstateAI: 0012_trial_period
--
-- Tracks when a trialing agency's free trial ends. Enforcement lives in
-- lib/dashboard-context.ts (requireAgencyContext) and app/api/chat — this
-- migration only adds the data the app needs to make that call.

alter table agencies add column trial_ends_at timestamptz;

-- Backfill: existing agencies get a trial window from when they were created,
-- so nobody's trial silently becomes "already expired" the moment this ships.
update agencies set trial_ends_at = created_at + interval '2 days' where trial_ends_at is null;

comment on column agencies.trial_ends_at is 'When the free trial ends. Only meaningful while subscription_status = trialing.';

-- New agencies get a 2-day trial from creation.
create or replace function create_agency_for_current_user(
  agency_name text,
  agency_slug text
)
returns agencies
language plpgsql
security definer
set search_path = public
as $$
declare
  new_agency agencies;
  caller_agency_id uuid;
begin
  if auth.uid() is null then
    raise exception 'must be authenticated';
  end if;

  select agency_id into caller_agency_id from profiles where id = auth.uid();
  if caller_agency_id is not null then
    raise exception 'this account already belongs to an agency';
  end if;

  insert into agencies (name, slug, trial_ends_at)
  values (agency_name, agency_slug, now() + interval '2 days')
  returning * into new_agency;

  perform set_config('estateai.bypass_profile_guard', 'true', true);

  update profiles
  set agency_id = new_agency.id,
      role = 'owner'
  where id = auth.uid();

  insert into agents (agency_id, profile_id, title)
  values (new_agency.id, auth.uid(), 'Principal');

  return new_agency;
end;
$$;
