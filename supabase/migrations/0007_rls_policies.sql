-- EstateAI: 0007_rls_policies
--
-- Tenant isolation model:
--   * Every business table carries agency_id.
--   * current_agency_id() (0001) reads the caller's own profile via SECURITY
--     DEFINER, so it does not re-trigger RLS and cannot be spoofed from the client.
--   * Baseline: a row is visible/writable only when row.agency_id = current_agency_id().
--   * Owners have full read/write within their agency. Agents can read agency-wide
--     (they collaborate on shared pipeline) but writes to leads/properties/appointments
--     are restricted to what the product spec grants them. Only owners manage agents,
--     agency settings, and AI configuration.
--   * Platform admins (profiles.role = 'admin', agency_id is null) get read-only
--     cross-agency visibility for support/ops — never write access to tenant data.

alter table agencies enable row level security;
alter table profiles enable row level security;
alter table agents enable row level security;
alter table properties enable row level security;
alter table leads enable row level security;
alter table lead_score_history enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table appointments enable row level security;
alter table follow_ups enable row level security;
alter table ai_settings enable row level security;
alter table lead_events enable row level security;

-- ---------------------------------------------------------------------------
-- agencies
-- ---------------------------------------------------------------------------

create policy "agencies_select_own" on agencies
  for select using (id = current_agency_id() or is_platform_admin());

create policy "agencies_update_owner" on agencies
  for update using (id = current_agency_id() and current_user_role() = 'owner');

create policy "agencies_insert_self" on agencies
  -- Any authenticated user with no agency yet may create exactly one agency
  -- during onboarding. Application code then attaches it to their profile.
  for insert with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create policy "profiles_select_self_or_agency" on profiles
  for select using (
    id = auth.uid()
    or agency_id = current_agency_id()
    or is_platform_admin()
  );

create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());

create policy "profiles_update_owner_manages_agency" on profiles
  -- An owner may edit teammates' profiles within their own agency (e.g. role changes),
  -- but may never move a profile into a different agency than their own.
  for update using (agency_id = current_agency_id() and current_user_role() = 'owner')
  with check (agency_id = current_agency_id());

-- ---------------------------------------------------------------------------
-- agents
-- ---------------------------------------------------------------------------

create policy "agents_select_agency" on agents
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "agents_write_owner" on agents
  for all using (agency_id = current_agency_id() and current_user_role() = 'owner')
  with check (agency_id = current_agency_id());

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------

create policy "properties_select_agency" on properties
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "properties_write_owner_or_agent" on properties
  for all using (
    agency_id = current_agency_id()
    and current_user_role() in ('owner', 'agent')
  )
  with check (agency_id = current_agency_id());

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------

create policy "leads_select_agency" on leads
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "leads_insert_agency" on leads
  -- Includes the service role path used by the public chat-widget API route,
  -- which authenticates the agency via the embed's agency id, not a user session.
  for insert with check (agency_id = current_agency_id());

create policy "leads_update_owner_or_assigned_agent" on leads
  for update using (
    agency_id = current_agency_id()
    and (
      current_user_role() = 'owner'
      or assigned_agent_id in (select id from agents where profile_id = auth.uid())
    )
  )
  with check (agency_id = current_agency_id());

create policy "leads_delete_owner" on leads
  for delete using (agency_id = current_agency_id() and current_user_role() = 'owner');

-- ---------------------------------------------------------------------------
-- lead_score_history
-- ---------------------------------------------------------------------------

create policy "lead_score_history_select_agency" on lead_score_history
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "lead_score_history_insert_agency" on lead_score_history
  for insert with check (agency_id = current_agency_id());

-- ---------------------------------------------------------------------------
-- conversations & messages
-- ---------------------------------------------------------------------------

create policy "conversations_select_agency" on conversations
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "conversations_write_agency" on conversations
  for all using (agency_id = current_agency_id())
  with check (agency_id = current_agency_id());

create policy "messages_select_agency" on messages
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "messages_insert_agency" on messages
  for insert with check (agency_id = current_agency_id());

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------

create policy "appointments_select_agency" on appointments
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "appointments_write_agency" on appointments
  for all using (agency_id = current_agency_id())
  with check (agency_id = current_agency_id());

-- ---------------------------------------------------------------------------
-- follow_ups
-- ---------------------------------------------------------------------------

create policy "follow_ups_select_agency" on follow_ups
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "follow_ups_write_owner" on follow_ups
  for all using (agency_id = current_agency_id() and current_user_role() = 'owner')
  with check (agency_id = current_agency_id());

-- ---------------------------------------------------------------------------
-- ai_settings
-- ---------------------------------------------------------------------------

create policy "ai_settings_select_agency" on ai_settings
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "ai_settings_write_owner" on ai_settings
  for all using (agency_id = current_agency_id() and current_user_role() = 'owner')
  with check (agency_id = current_agency_id());

-- ---------------------------------------------------------------------------
-- lead_events
-- ---------------------------------------------------------------------------

create policy "lead_events_select_agency" on lead_events
  for select using (agency_id = current_agency_id() or is_platform_admin());

create policy "lead_events_insert_agency" on lead_events
  for insert with check (agency_id = current_agency_id());
