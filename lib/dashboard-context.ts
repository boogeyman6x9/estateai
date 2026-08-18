import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Agency = Database["public"]["Tables"]["agencies"]["Row"];

export async function requireAgencyContext(): Promise<{
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

  return { profile, agency };
}
