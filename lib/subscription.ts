import type { Database } from "@/types/database";

type Agency = Database["public"]["Tables"]["agencies"]["Row"];

/** True once a trialing agency's 2-day window has passed. Paid agencies (any status other than trialing) are never "expired" here — past_due/canceled billing issues are Stripe's/the portal's concern, not a trial gate. */
export function isTrialExpired(agency: Pick<Agency, "subscription_status" | "trial_ends_at">): boolean {
  if (agency.subscription_status !== "trialing") return false;
  if (!agency.trial_ends_at) return false;
  return new Date(agency.trial_ends_at).getTime() <= Date.now();
}

export function trialDaysRemaining(agency: Pick<Agency, "subscription_status" | "trial_ends_at">): number {
  if (agency.subscription_status !== "trialing" || !agency.trial_ends_at) return 0;
  const msRemaining = new Date(agency.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
}

export function trialHoursRemaining(agency: Pick<Agency, "subscription_status" | "trial_ends_at">): number {
  if (agency.subscription_status !== "trialing" || !agency.trial_ends_at) return 0;
  const msRemaining = new Date(agency.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60)));
}

/**
 * Professional-tier features (AI marketing content, deeper analytics). Trial
 * agencies deliberately get LESS than Starter — the point is to make the
 * limits felt during the trial itself, not just after it ends.
 */
export function hasProFeatures(agency: Pick<Agency, "subscription_status" | "subscription_plan">): boolean {
  if (agency.subscription_status === "trialing") return false;
  return agency.subscription_plan === "professional" || agency.subscription_plan === "enterprise";
}
