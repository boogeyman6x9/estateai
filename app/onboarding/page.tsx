import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/auth/onboarding-form";

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

  if (profile?.agency_id) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6">
      <OnboardingForm fullName={profile?.full_name ?? null} />
    </div>
  );
}
