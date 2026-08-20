/**
 * Automated version of the manual tenant-isolation validation described in
 * README.md section 5: two separate agency signups through the real
 * handle_new_user trigger and create_agency_for_current_user() RPC, then a
 * cross-tenant read attempt — enforced by the database itself, not
 * application code. Requires real Supabase credentials (SUPABASE_SERVICE_ROLE_KEY
 * + NEXT_PUBLIC_SUPABASE_URL/ANON_KEY in .env.local) since RLS can only be
 * verified against a real Postgres instance, not mocked.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasCreds = !!SUPABASE_URL && !!ANON_KEY && !!SERVICE_ROLE_KEY;

const TEST_PASSWORD = "TestPass1234!";

async function createSignedInUser(email: string) {
  const admin = await createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;

  const client = createSupabaseClient<Database>(SUPABASE_URL!, ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password: TEST_PASSWORD,
  });
  if (signInError) throw signInError;

  return { userId: data.user.id, client };
}

describe.skipIf(!hasCreds)("RLS tenant isolation", () => {
  const suffix = Date.now();
  const userAEmail = `rls-test-a-${suffix}@example.com`;
  const userBEmail = `rls-test-b-${suffix}@example.com`;

  let userAId: string;
  let userBId: string;
  let clientA: ReturnType<typeof createSupabaseClient<Database>>;
  let clientB: ReturnType<typeof createSupabaseClient<Database>>;
  let agencyAId: string;
  let leadAId: string;

  beforeAll(async () => {
    const a = await createSignedInUser(userAEmail);
    const b = await createSignedInUser(userBEmail);
    userAId = a.userId;
    userBId = b.userId;
    clientA = a.client;
    clientB = b.client;

    const { data: agencyA, error: agencyAError } = await clientA.rpc(
      "create_agency_for_current_user",
      { agency_name: "RLS Test Agency A", agency_slug: `rls-test-a-${suffix}` }
    );
    if (agencyAError) throw agencyAError;
    agencyAId = agencyA.id;

    const { error: agencyBError } = await clientB.rpc("create_agency_for_current_user", {
      agency_name: "RLS Test Agency B",
      agency_slug: `rls-test-b-${suffix}`,
    });
    if (agencyBError) throw agencyBError;

    const { data: lead, error: leadError } = await clientA
      .from("leads")
      .insert({ agency_id: agencyAId, first_name: "Secret", last_name: "LeadA" })
      .select()
      .single();
    if (leadError) throw leadError;
    leadAId = lead.id;
  });

  afterAll(async () => {
    const admin = await createAdminClient();
    if (agencyAId) await admin.from("agencies").delete().eq("id", agencyAId);
    // Agency B's slug is unique to this run; find and delete it too.
    await admin.from("agencies").delete().eq("slug", `rls-test-b-${suffix}`);
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });

  it("lets agency A read its own lead", async () => {
    const { data, error } = await clientA.from("leads").select("*").eq("id", leadAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0]?.first_name).toBe("Secret");
  });

  it("never lets agency B see agency A's lead, even with an unfiltered query", async () => {
    const { data, error } = await clientB.from("leads").select("*");
    expect(error).toBeNull();
    expect(data?.some((l) => l.id === leadAId)).toBe(false);
  });

  it("never lets agency B read agency A's lead by direct id lookup either", async () => {
    const { data, error } = await clientB.from("leads").select("*").eq("id", leadAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("never lets agency B read agency A's agency row", async () => {
    const { data, error } = await clientB.from("agencies").select("*").eq("id", agencyAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("blocks a user from self-assigning into another agency by direct update", async () => {
    const { error } = await clientB
      .from("profiles")
      .update({ agency_id: agencyAId })
      .eq("id", userBId);
    // guard_profile_privileged_fields() (migration 0008) raises on any direct
    // change to profiles.agency_id/role outside the RPC's bypass flag.
    expect(error).not.toBeNull();

    const { data: profileB } = await clientB
      .from("profiles")
      .select("agency_id")
      .eq("id", userBId)
      .single();
    expect(profileB?.agency_id).not.toBe(agencyAId);
  });
});
