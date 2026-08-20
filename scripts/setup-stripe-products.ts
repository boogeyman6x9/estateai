/**
 * One-off setup script: creates the Stripe Products/Prices matching the plans
 * already shown in Settings > Billing (Starter $99/mo, Professional $249/mo).
 * Enterprise stays "Contact us" — no Stripe object needed for it.
 *
 * Usage:
 *   npx tsx scripts/setup-stripe-products.ts
 *
 * Safe to re-run: skips creating a product/price if one with the same
 * lookup_key already exists.
 */
import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY in .env.local");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

const PLANS = [
  { key: "estateai_starter", name: "EstateAI Starter", amountCents: 9900 },
  { key: "estateai_professional", name: "EstateAI Professional", amountCents: 24900 },
] as const;

async function ensurePrice(plan: (typeof PLANS)[number]) {
  const existing = await stripe.prices.list({ lookup_keys: [plan.key], limit: 1 });
  if (existing.data.length > 0) {
    console.log(`${plan.name}: price already exists (${existing.data[0].id})`);
    return existing.data[0].id;
  }

  const product = await stripe.products.create({ name: plan.name });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.amountCents,
    currency: "usd",
    recurring: { interval: "month" },
    lookup_key: plan.key,
  });
  console.log(`${plan.name}: created price ${price.id}`);
  return price.id;
}

async function main() {
  const ids: Record<string, string> = {};
  for (const plan of PLANS) {
    ids[plan.key] = await ensurePrice(plan);
  }

  console.log("\nAdd these to .env.local:");
  console.log(`STRIPE_PRICE_STARTER=${ids.estateai_starter}`);
  console.log(`STRIPE_PRICE_PROFESSIONAL=${ids.estateai_professional}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
