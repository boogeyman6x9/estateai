import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeClient, getPlanForPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/domain";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "past_due";
    case "canceled":
    case "paused":
      return "canceled";
    default:
      return "active";
  }
}

/**
 * Keeps agencies.subscription_plan/status/stripe_* in sync with Stripe —
 * the only place billing state actually changes after checkout. Configure
 * this URL in the Stripe Dashboard (or `stripe listen --forward-to`
 * locally) for: checkout.session.completed, customer.subscription.updated,
 * customer.subscription.deleted.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 }
    );
  }

  const supabase = await createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const agencyId = session.client_reference_id ?? session.metadata?.agency_id;
      if (!agencyId || !session.customer || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? getPlanForPriceId(priceId) : null;

      const update: {
        stripe_customer_id: string;
        stripe_subscription_id: string;
        subscription_status: SubscriptionStatus;
        subscription_plan?: SubscriptionPlan;
        trial_ends_at?: string | null;
      } = {
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_status: mapStripeStatus(subscription.status),
        trial_ends_at: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      };
      if (plan) update.subscription_plan = plan;

      await supabase.from("agencies").update(update).eq("id", agencyId);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const agencyId = subscription.metadata?.agency_id;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? getPlanForPriceId(priceId) : null;

      const update: {
        subscription_status: SubscriptionStatus;
        subscription_plan?: SubscriptionPlan;
        stripe_subscription_id?: null;
        trial_ends_at?: string | null;
      } = {
        subscription_status: mapStripeStatus(subscription.status),
        trial_ends_at: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      };
      if (plan) update.subscription_plan = plan;
      if (event.type === "customer.subscription.deleted") update.stripe_subscription_id = null;

      const filterColumn = agencyId ? "id" : "stripe_subscription_id";
      const filterValue = agencyId ?? subscription.id;
      await supabase.from("agencies").update(update).eq(filterColumn, filterValue);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
