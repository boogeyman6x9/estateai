-- EstateAI: 0008_onboarding_rpc
--
-- profiles.agency_id and profiles.role are privileged: if a regular UPDATE could
-- change them, a user could self-assign into another agency or promote themselves
-- to owner/admin. This guard trigger blocks direct changes to those two columns;
-- the only sanctioned path is the create_agency_for_current_user() RPC below,
-- which flips a transaction-local flag to bypass the guard.

create or replace function guard_profile_privileged_fields()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role or new.agency_id is distinct from old.agency_id)
     and coalesce(current_setting('estateai.bypass_profile_guard', true), 'false') <> 'true'
  then
    raise exception 'profiles.role and profiles.agency_id cannot be changed directly';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_privileged_fields
  before update on profiles
  for each row execute function guard_profile_privileged_fields();

-- Restrict the general self-update policy from 0007 so it can never touch
-- the guarded columns even before the trigger runs, defense in depth.
drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self" on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

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

  insert into agencies (name, slug)
  values (agency_name, agency_slug)
  returning * into new_agency;

  perform set_config('estateai.bypass_profile_guard', 'true', true);

  update profiles
  set agency_id = new_agency.id,
      role = 'owner'
  where id = auth.uid();

  -- Also create the corresponding agents row so the owner can be assigned leads/properties.
  insert into agents (agency_id, profile_id, title)
  values (new_agency.id, auth.uid(), 'Principal');

  return new_agency;
end;
$$;

comment on function create_agency_for_current_user is 'Called once from the onboarding flow. Atomically creates the agency and attaches the calling user as its owner.';
