-- EstateAI: 0009_invite_agent_rpc

create or replace function attach_invited_agent(
  invited_profile_id uuid,
  agent_title text default null
)
returns agents
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_agency_id uuid;
  caller_role user_role;
  new_agent agents;
begin
  select agency_id, role into caller_agency_id, caller_role from profiles where id = auth.uid();

  if caller_role is distinct from 'owner' or caller_agency_id is null then
    raise exception 'only an agency owner may invite teammates';
  end if;

  perform set_config('estateai.bypass_profile_guard', 'true', true);

  update profiles
  set agency_id = caller_agency_id,
      role = 'agent'
  where id = invited_profile_id
    and agency_id is null; -- never steal an existing agency's teammate

  if not found then
    raise exception 'that invited account could not be attached (already belongs to an agency)';
  end if;

  insert into agents (agency_id, profile_id, title)
  values (caller_agency_id, invited_profile_id, agent_title)
  returning * into new_agent;

  return new_agent;
end;
$$;

comment on function attach_invited_agent is 'Called after supabase.auth.admin.inviteUserByEmail() creates the auth user. Only the inviting agency''s owner can call this, and only against an account with no existing agency.';
