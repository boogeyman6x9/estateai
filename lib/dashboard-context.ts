import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isTrialExpired } from "@/lib/subscription";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Agency = Database["public"]["Tables"]["agencies"]["Row"];

/**
 * `allowExpiredTrial` — pass `true` only from the one place a locked-out
 * agency still needs to reach: Settings (so they can actually pay). Every
 * other page/action calls this with the default, so an expired trial gets
 * redirected to Settings automatically, server-enforced — not just hidden
 * in the UI.
 */
export async function requireAgencyContext(
  options: { allowExpiredTrial?: boolean } = {}
): Promise<{
  profile: Profile;
  agency: Agency;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (!profile.agency_id) redirect("/onboarding");

  const { data: agency } = await supabase
    .from("agencies")
    .select("*")
    .eq("id", profile.agency_id)
    .single();

  if (!agency) redirect("/onboarding");

  if (!options.allowExpiredTrial && isTrialExpired(agency)) {
    redirect("/dashboard/settings?trial=expired");
  }

  return { profile, agency };
}
