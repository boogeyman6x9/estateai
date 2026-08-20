import Stripe from "stripe";

import type { SubscriptionPlan } from "@/types/domain";

/**
 * SERVER-ONLY. Never import this file from a Client Component — it reads
 * STRIPE_SECRET_KEY, which must never reach the browser bundle.
 */
let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Billing checkout/portal/webhooks won't work without it."
    );
  }

  cachedClient = new Stripe(apiKey);
  return cachedClient;
}

/** Plans that can be self-served through Stripe Checkout. Enterprise is deliberately absent — "Contact us", no Stripe price. */
export const CHECKOUT_PLAN_PRICE_ENV: Record<"starter" | "professional", string> = {
  starter: "STRIPE_PRICE_STARTER",
  professional: "STRIPE_PRICE_PROFESSIONAL",
};

export function getPriceIdForPlan(plan: "starter" | "professional"): string {
  const envVar = CHECKOUT_PLAN_PRICE_ENV[plan];
  const priceId = process.env[envVar];
  if (!priceId) {
    throw new Error(`${envVar} is not configured — run scripts/setup-stripe-products.ts`);
  }
  return priceId;
}

/** Reverse lookup used by the webhook handler to turn a Stripe price back into our plan enum. */
export function getPlanForPriceId(priceId: string): SubscriptionPlan | null {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return "professional";
  return null;
}
