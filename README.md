# EstateAI

**Turn every property enquiry into an opportunity.**

An AI-powered sales assistant for real estate agencies that captures, qualifies,
scores, follows up with, and manages property leads 24/7.

This is a working product, not a scaffold: real-time AI conversations, a
website chat widget agencies embed on their own site, lead scoring, AI
marketing content, a 2-day trial with paid plans behind real Stripe
Checkout/webhooks/portal, analytics, and a full test suite — all built,
verified against a live Supabase project, and deployed.

---

## 1. Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Radix UI primitives ·
Supabase (Postgres + Auth + Storage) · Stripe · Anthropic (Claude) · Zod ·
React Hook Form · Recharts · Vitest.

`components.json` is present so the shadcn/ui CLI (`npx shadcn add ...`) works
normally on your machine — the primitives already in `components/ui/` were
hand-built in this environment because `ui.shadcn.com` wasn't reachable from
the sandbox network, but they follow the same conventions and the CLI will
happily add more alongside them.

## 2. Getting started

```bash
npm install
cp .env.example .env.local
```

### 2.1 Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project Settings → API → Project URL / anon key / service_role key**
   into `.env.local`.
3. Run the migrations, in order, via the SQL Editor in the Supabase dashboard
   (or the Supabase CLI — see below). They live in `supabase/migrations/00NN_*.sql`
   and must be run in numeric order; each one depends on the previous.

**Using the Supabase CLI instead (recommended once you have it installed):**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 2.2 Add your AI provider key

`lib/ai/provider.ts` calls the Anthropic API directly (server-side only). Get a
key at [console.anthropic.com](https://console.anthropic.com) and set
`ANTHROPIC_API_KEY` in `.env.local`. Without it, AI features fail loudly with a
clear "no AI provider configured" error rather than silently faking a response
— see `lib/ai/provider.ts`'s `UnconfiguredProvider`.

### 2.3 Add Stripe (optional for local dev)

Billing works without Stripe configured — the app just won't be able to run
checkout. To test it:

1. Get a test-mode secret key from [dashboard.stripe.com](https://dashboard.stripe.com)
   (Developers → API keys) and set `STRIPE_SECRET_KEY`.
2. Run `npx tsx scripts/setup-stripe-products.ts` — creates the Starter/
   Professional Products+Prices in your Stripe account and prints the price
   IDs to add as `STRIPE_PRICE_STARTER`/`STRIPE_PRICE_PROFESSIONAL`.
3. For webhooks locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe` prints a
   signing secret — set that as `STRIPE_WEBHOOK_SECRET`.

### 2.4 Run it

```bash
npm run dev
```

Visit `http://localhost:3000`, sign up, and you'll go through a 7-step
onboarding wizard (agency details → owner details → invite an agent → add a
listing → configure the AI assistant → finish), then land in the dashboard.

### 2.5 Seed demo data (optional)

Populates a realistic demo agency — **Harbour & Co Real Estate**, 5 agents, 15
properties, 30 leads with conversations, appointments, and follow-ups — kept
entirely separate from the schema migrations.

```bash
npx tsx scripts/seed-demo-data.ts
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in
`.env.local`. Demo login: `owner@harbourandco.demo` / `Demo1234!`.

## 3. What's built

- **Schema & security**: 13 migrations covering every core table — agencies,
  profiles, agents, properties, leads (+ score history), conversations/
  messages, appointments/follow-ups, ai_settings, lead_events — plus Stripe
  billing fields, trial tracking, and a Postgres-backed rate limiter. Full
  Row Level Security on every table enforcing tenant isolation, two guarded
  RPCs (`create_agency_for_current_user`, `attach_invited_agent`) so a user
  can never self-assign into another agency's data, and a Supabase Storage
  bucket (`property-images`) with agency-scoped upload/delete policies.
- **Auth & onboarding**: signup, login, logout, forgot/reset password, and a
  full 7-step onboarding wizard (agency details, owner details, invite an
  agent, add a listing, configure the AI assistant, finish) — each optional
  step skippable, all server-enforced via `requireAgencyContext()`.
- **The core conversation loop**: real AI replies in the lead detail page —
  send a message, get a grounded reply (never invents property details),
  automatic re-qualification and re-scoring after every exchange, and an
  on-demand AI-generated conversation summary.
- **Website chat widget**: a public, credential-free API (`/api/chat`, CORS-
  enabled, rate-limited) backing both an in-dashboard demo widget and a real
  external embed — agencies copy a `<script>` snippet from Settings that
  drops a floating chat bubble onto their *own* website via an iframe that
  resizes itself over `postMessage` (`public/widget.js` +
  `app/widget/[agencyId]`).
- **Leads & Properties**: full create/edit/withdraw flows (not just create),
  property photo upload/delete via Supabase Storage, filterable list views,
  and detail pages wired to real data throughout.
- **Agents**: list view + an invite flow using Supabase's admin
  `inviteUserByEmail`, gated to the agency owner.
- **AI marketing content**: generates listing descriptions, social captions,
  email campaigns, SMS, and open-home reminders per property, grounded in
  that property's real data — Professional-plan feature.
- **Follow-up scheduler**: a cron endpoint (`/api/cron/follow-ups`, scheduled
  via `vercel.json`) that picks up due follow-ups, posts the message into the
  lead's conversation, and retries up to 3 times on failure before marking it
  failed.
- **Notifications**: an in-app bell surfacing hot-lead detections, inspection
  requests, and overdue follow-ups, computed from the `lead_events` audit log.
- **Analytics**: conversion funnel, lead source breakdown, and top-performing
  properties — Professional-plan feature.
- **Billing**: a real Stripe integration — Checkout for Starter/Professional,
  a Customer Portal link for self-service management, and a webhook handler
  keeping `agencies.subscription_plan`/`subscription_status` in sync.
- **2-day free trial**: server-enforced — every page and Server Action
  redirects an expired-trial agency to Settings via `requireAgencyContext()`,
  their public chat widget returns 503, and even during an active trial,
  AI marketing content and analytics are locked (Professional-only) to make
  the limits felt before the trial ends, not just after.
- **`lib/ai/`**: a provider-agnostic abstraction (swap LLM vendors in one
  file), a fully deterministic and transparent lead-scoring engine, real
  property matching against the agency's own listings only, and the shared
  `runConversationTurn` engine used by both the dashboard's "test as lead"
  tool and the public widget so the logic exists in exactly one place.
- **Landing page**: hero, problem, solution, features, how-it-works, pricing,
  and final CTA, using a deliberate navy/paper design system with the
  hot/warm/cold lead-temperature system as its visual signature.
- **Tests**: a Vitest suite — pure unit tests for lead scoring, integration
  tests for property matching, and an automated version of the manual
  tenant-isolation validation (two real agency signups, then a cross-tenant
  read that must return zero rows) — see section 7.

## 4. What's intentionally not built yet

- **No UI schedules a follow-up.** The cron processor in section 3 works, but
  nothing in the app creates a `follow_ups` row yet — only the (unused) demo
  seed script did, historically. Worth building if the scheduler is meant to
  be used for real.
- **Stripe is in test mode.** Real payments need a live secret key and
  re-running `scripts/setup-stripe-products.ts` against live mode.
- **Outbound email is sandboxed.** Supabase Auth is wired to send through
  Resend, but until a domain is verified with Resend, confirmation/reset
  emails only deliver to the Resend account's own address — not real users
  signing up. Needs: buy a domain → verify it with Resend → point
  `smtp_admin_email` at it.
- **One Supabase project for everything.** Local dev, this deployment, and
  any future production traffic currently share the same project. Fine for
  now; split before real customer data and your own testing should stop
  mixing.
- Phone/SMS/WhatsApp channels aren't wired — `conversations.channel` supports
  them, nothing sends through them yet.

## 5. What's been verified

Everything below was checked against the real, live Supabase project and (for
the items marked prod) the actual Vercel deployment — not assumed from code
review:

- `npx tsc --noEmit`, `npx eslint .`, `npm run build`, `npm test` — all clean.
- All 13 migrations applied against the live project with no errors.
- RLS tenant isolation: automated in `tests/rls-tenant-isolation.test.ts` (see
  section 7) — two real agency signups through the actual RPC, then a
  cross-tenant read that returns zero rows.
- The full conversation loop (send message → AI reply → re-qualify → re-score)
  driven through a real browser against the live app and a real Anthropic
  API call.
- The external chat widget embed, tested from a genuinely different origin
  (not just same-origin) — cross-origin CORS, the iframe resize protocol, and
  a real grounded AI reply all confirmed working from outside this app's own
  domain.
- A full Stripe Checkout purchase completed with a real test card, confirmed
  the webhook synced `agencies.subscription_plan`/`status` correctly, then
  cancelled it and confirmed the cancellation webhook did the same.
- The 2-day trial lockout: expired an agency's trial directly in the database
  and confirmed every dashboard route redirects to Settings, only Billing
  stays usable, and the public widget returns 503 for that agency.
- Rate limiting on `/api/chat`: fired concurrent requests at the live
  production endpoint and confirmed the 11th-and-beyond within a minute gets
  a 429.
- **Deployed to Vercel** (prod), connected to GitHub for auto-deploy on push
  to `main`, with Supabase Auth's Site URL/redirect allow-list and a real
  Stripe webhook endpoint pointed at the production domain.

## 6. Deployment

This app is already deployed and connected to GitHub — pushing to `main`
auto-deploys via Vercel's GitHub integration. To set this up on a fresh
Vercel account instead:

### 6.1 Connect the project

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com), **Add New → Project** and import it.
   Framework preset is auto-detected as Next.js.

### 6.2 Environment variables

In **Project Settings → Environment Variables**, add everything from
`.env.local` — Supabase, Anthropic, and (if using billing) the four Stripe
variables and `CRON_SECRET`. Mark service-role/secret keys **Sensitive**.

`NEXT_PUBLIC_APP_URL` isn't cosmetic: password-reset/invite emails, the chat
widget embed snippet, and Stripe Checkout's success/cancel URLs all build off
it. Set it to your real deployed URL once you know it (first deploy, then
update and redeploy).

### 6.3 Supabase auth settings

**Authentication → URL Configuration** in your Supabase project:

- **Site URL**: your production URL.
- **Redirect URLs**: `https://your-app.vercel.app/**` (localhost can stay in
  the allow-list too, for local dev against the same project).

### 6.4 Stripe webhook (if using billing)

Create a webhook endpoint in the Stripe Dashboard (or via API) pointed at
`https://your-app.vercel.app/api/webhooks/stripe`, subscribed to
`checkout.session.completed`, `customer.subscription.updated`, and
`customer.subscription.deleted`. Set the signing secret it gives you as
`STRIPE_WEBHOOK_SECRET`.

### 6.5 Cron jobs

`vercel.json` schedules the follow-up processor. **Vercel's Hobby plan only
allows once-daily cron jobs** — the schedule is already set accordingly
(`0 21 * * *`); tighten it if you're on a paid plan and want faster
follow-up processing.

### 6.6 One Supabase project vs. two

For anything beyond a demo, use **separate Supabase projects for local dev
and production** rather than pointing Vercel at the same project you develop
against — otherwise local testing writes real rows into your prod database.

## 7. Testing

```bash
npm test          # run once
npm run test:watch
```

Vitest, three suites:

- `lib/ai/scoring.test.ts` — pure unit tests for the lead-scoring engine. No
  network, no credentials, runs anywhere.
- `lib/ai/matching.test.ts` — integration tests for property matching against
  a real Postgres instance (creates a throwaway test agency + properties,
  asserts filtering, cleans up in `afterAll`).
- `tests/rls-tenant-isolation.test.ts` — automated version of the manual
  tenant-isolation validation: two real agency signups through
  `create_agency_for_current_user()`, then a cross-tenant read attempt that
  must return zero rows, enforced by RLS itself.

The two integration suites need real Supabase credentials
(`SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` in
`.env.local`) and talk to whichever project those point at — they
`describe.skipIf` themselves out cleanly if credentials aren't present. Run
them against a dev/test Supabase project, not production, since they create
and delete real rows (test data is clearly namespaced and always cleaned up,
but there's no reason to point them at prod).

## 8. Project structure

```
app/                       Routes (App Router)
  (auth)/                   signup, login, forgot-password, reset-password
  onboarding/                7-step onboarding wizard
  dashboard/                 Dashboard, leads, properties, agents, analytics, settings
  widget/[agencyId]/         Public external chat-widget embed page
  api/
    chat/                     Public, rate-limited chat widget API
    cron/follow-ups/          Follow-up scheduler (Vercel Cron)
    webhooks/stripe/          Stripe billing webhook handler
components/
  ui/                       Hand-built shadcn-style primitives
  dashboard/                Dashboard-specific components (chat widget, billing, analytics charts, etc.)
  widget/                   External-embed-specific wrapper
  landing/                  Marketing page sections
  auth/                     Auth shell + onboarding wizard
lib/
  ai/                       Provider-agnostic AI service layer + shared conversation engine
  actions/                  Server Actions (auth, leads, properties, agents, settings, billing, marketing, onboarding)
  supabase/                 Browser/server/admin clients + middleware helper
  validation/               Zod schemas
  stripe.ts                 Stripe client + plan/price mapping
  subscription.ts           Trial/plan gating helpers
  rate-limit.ts             Postgres-backed rate limiter
  notifications.ts          In-app notification feed
supabase/
  migrations/               13 SQL migrations, run in order
scripts/
  seed-demo-data.ts          Demo data generator (kept separate from migrations)
  setup-stripe-products.ts   Creates Stripe Products/Prices for the plans
tests/
  rls-tenant-isolation.test.ts  Automated tenant-isolation validation
  setup.ts                      Loads .env.local for the test runner
types/
  database.ts               Hand-written Supabase types (regenerate once schema stabilizes)
  domain.ts                 Shared enums/types mirroring the schema
public/
  widget.js                 The loader script agencies paste into their own website
```
