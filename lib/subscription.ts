import type { Database } from "@/types/database";

type Agency = Database["public"]["Tables"]["agencies"]["Row"];

/** True once a trialing agency's 2-day window has passed. Paid agencies (any status other than trialing) are never "expired" here — past_due/canceled billing issues are handled separately by isAccessLocked below, not this trial gate. */
export function isTrialExpired(agency: Pick<Agency, "subscription_status" | "trial_ends_at">): boolean {
  if (agency.subscription_status !== "trialing") return false;
  if (!agency.trial_ends_at) return false;
  return new Date(agency.trial_ends_at).getTime() <= Date.now();
}

/**
 * True when the dashboard should be locked to Settings/Billing only — an
 * expired trial, or a subscription Stripe has fully canceled (the sync
 * happens via the `customer.subscription.deleted` webhook). Deliberately
 * excludes `past_due`: Stripe auto-retries a failed card for several days
 * first, and we don't want to lock someone out mid-retry.
 */
export function isAccessLocked(
  agency: Pick<Agency, "subscription_status" | "trial_ends_at">
): boolean {
  return isTrialExpired(agency) || agency.subscription_status === "canceled";
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
