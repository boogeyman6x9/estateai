"use server";

import { redirect } from "next/navigation";

import { requireAgencyContext } from "@/lib/dashboard-context";
import { getStripeClient, getPriceIdForPlan } from "@/lib/stripe";
import type { ActionResult } from "./auth";

// Neither trailing param is used, but both are required to match the
// (state, formData) signature useActionState calls this with.
export async function createCheckoutSessionAction(
  plan: "starter" | "professional",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: ActionResult,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<ActionResult> {
  // allowExpiredTrial: this is exactly how a locked-out (expired trial or
  // canceled) agency gets access back — it can't itself require unlocked access.
  const { agency, profile } = await requireAgencyContext({ allowExpiredTrial: true });
  if (profile.role !== "owner") return { error: "Only the agency owner can change billing." };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let url: string;

  try {
    const stripe = getStripeClient();
    const priceId = getPriceIdForPlan(plan);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: agency.stripe_customer_id ?? undefined,
      customer_email: agency.stripe_customer_id ? undefined : profile.email,
      client_reference_id: agency.id,
      subscription_data: { metadata: { agency_id: agency.id } },
      success_url: `${appUrl}/dashboard/settings?billing=success`,
      cancel_url: `${appUrl}/dashboard/settings?billing=cancelled`,
    });
    if (!session.url) return { error: "Stripe did not return a checkout URL" };
    url = session.url;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to start checkout" };
  }

  // redirect() throws internally by design — must stay outside the try/catch
  // above or its own throw gets swallowed as if it were a real error.
  redirect(url);
}

// Neither trailing param is used, but both are required to match the
// (state, formData) signature useActionState calls this with. Distinct from
// createCheckoutSessionAction above: this one runs during onboarding (before
// dashboard access is granted), attaches a 2-day trial to the subscription
// itself, and always collects a card up front.
export async function createOnboardingCheckoutSessionAction(
  plan: "starter" | "professional",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: ActionResult,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<ActionResult> {
  const { agency, profile } = await requireAgencyContext({ allowIncompleteBilling: true });
  if (profile.role !== "owner") return { error: "Only the agency owner can set up billing." };
  if (agency.stripe_subscription_id) return { error: "Billing is already set up for this agency." };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let url: string;

  try {
    const stripe = getStripeClient();
    const priceId = getPriceIdForPlan(plan);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: agency.stripe_customer_id ?? undefined,
      customer_email: agency.stripe_customer_id ? undefined : profile.email,
      client_reference_id: agency.id,
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: 2,
        metadata: { agency_id: agency.id },
      },
      success_url: `${appUrl}/onboarding?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/onboarding?billing=cancelled`,
    });
    if (!session.url) return { error: "Stripe did not return a checkout URL" };
    url = session.url;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to start checkout" };
  }

  redirect(url);
}

// Neither param is used, but both are required to match the (state, formData)
// signature useActionState calls this with.
export async function createPortalSessionAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: ActionResult,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<ActionResult> {
  // allowExpiredTrial: a locked-out agency still needs the portal — e.g. to
  // view past invoices, or update a card that just failed.
  const { agency, profile } = await requireAgencyContext({ allowExpiredTrial: true });
  if (profile.role !== "owner") return { error: "Only the agency owner can manage billing." };
  if (!agency.stripe_customer_id) {
    return { error: "No billing account yet — subscribe to a plan first." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let url: string;

  try {
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: agency.stripe_customer_id,
      return_url: `${appUrl}/dashboard/settings`,
    });
    url = session.url;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to open the billing portal" };
  }

  redirect(url);
}
