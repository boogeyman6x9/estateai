import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";
import { OnboardingWizard } from "@/components/auth/onboarding-wizard";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string; session_id?: string }>;
}) {
  const { billing, session_id } = await searchParams;
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

  let hasSubscription = false;
  if (profile?.agency_id) {
    const { data: agency } = await supabase
      .from("agencies")
      .select("subscription_status, stripe_subscription_id")
      .eq("id", profile.agency_id)
      .single();

    hasSubscription = !!agency && (agency.subscription_status !== "trialing" || !!agency.stripe_subscription_id);

    // Stripe's webhook usually beats the redirect back here, but not always —
    // if we just came back from a successful checkout and the row hasn't
    // caught up yet, confirm directly with Stripe instead of flashing the
    // plan step again.
    if (!hasSubscription && billing === "success" && session_id) {
      try {
        const stripe = getStripeClient();
        const session = await stripe.checkout.sessions.retrieve(session_id);
        hasSubscription = session.status === "complete" && !!session.subscription;
      } catch {
        // fall through — worst case the plan step re-renders and the user retries
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6">
      <OnboardingWizard
        fullName={profile?.full_name ?? null}
        hasAgency={!!profile?.agency_id}
        hasSubscription={hasSubscription}
        billingCancelled={billing === "cancelled"}
      />
    </div>
  );
}
