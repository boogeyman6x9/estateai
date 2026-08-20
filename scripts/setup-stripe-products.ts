/**
 * One-off setup script: creates the Stripe Products/Prices matching the plans
 * shown on the landing page (Starter $299/mo, Professional $699/mo).
 * Enterprise stays "Contact us" — no Stripe object needed for it.
 *
 * Usage:
 *   npx tsx scripts/setup-stripe-products.ts
 *
 * Safe to re-run: skips creating a product/price if one with the same
 * lookup_key already exists. Stripe prices are immutable, so a price change
 * means a new lookup_key here (bumping the old one out of use) rather than
 * editing amountCents on an existing entry.
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
  { key: "estateai_starter_299", productName: "EstateAI Starter", amountCents: 29900 },
  { key: "estateai_professional_699", productName: "EstateAI Professional", amountCents: 69900 },
] as const;

// Superseded lookup_keys to archive once the new prices exist, so old test
// checkouts can't accidentally reuse a stale amount.
const OLD_LOOKUP_KEYS = ["estateai_starter", "estateai_professional"];

async function ensurePrice(plan: (typeof PLANS)[number]) {
  const existing = await stripe.prices.list({ lookup_keys: [plan.key], limit: 1 });
  if (existing.data.length > 0) {
    console.log(`${plan.productName}: price already exists (${existing.data[0].id})`);
    return existing.data[0].id;
  }

  const products = await stripe.products.list({ limit: 100 });
  const product =
    products.data.find((p) => p.name === plan.productName) ??
    (await stripe.products.create({ name: plan.productName }));

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.amountCents,
    currency: "usd",
    recurring: { interval: "month" },
    lookup_key: plan.key,
  });
  console.log(`${plan.productName}: created price ${price.id}`);
  return price.id;
}

async function archiveOldPrices() {
  for (const key of OLD_LOOKUP_KEYS) {
    const existing = await stripe.prices.list({ lookup_keys: [key], limit: 1 });
    const price = existing.data[0];
    if (price && price.active) {
      await stripe.prices.update(price.id, { active: false });
      console.log(`Archived old price ${price.id} (${key})`);
    }
  }
}

async function main() {
  const ids: Record<string, string> = {};
  for (const plan of PLANS) {
    ids[plan.key] = await ensurePrice(plan);
  }
  await archiveOldPrices();

  console.log("\nUpdate these in .env.local and Vercel env vars:");
  console.log(`STRIPE_PRICE_STARTER=${ids.estateai_starter_299}`);
  console.log(`STRIPE_PRICE_PROFESSIONAL=${ids.estateai_professional_699}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
