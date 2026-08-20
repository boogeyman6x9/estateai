-- EstateAI: 0011_stripe_billing
--
-- Links an agency to its Stripe Customer/Subscription so the webhook handler
-- (app/api/webhooks/stripe) can find the right agency row to update.

alter table agencies
  add column stripe_customer_id text unique,
  add column stripe_subscription_id text unique;

comment on column agencies.stripe_customer_id is 'Stripe Customer id, set on first checkout.';
comment on column agencies.stripe_subscription_id is 'Stripe Subscription id, set/cleared by the webhook handler as it changes.';
