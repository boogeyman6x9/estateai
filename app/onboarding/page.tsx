import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/auth/onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id, full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6">
      <OnboardingWizard fullName={profile?.full_name ?? null} hasAgency={!!profile?.agency_id} />
    </div>
  );
}
