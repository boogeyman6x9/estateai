# EstateAI

**Turn every property enquiry into an opportunity.**

An AI-powered sales assistant for real estate agencies that captures, qualifies,
scores, follows up with, and manages property leads 24/7.

This repository is the **Phase 1 foundation** from the build spec: project scaffold,
database schema + Row Level Security, authentication, onboarding, the dashboard
shell (Dashboard / Leads / Properties / Agents / Settings), and the `lib/ai/`
service abstraction wired to a real LLM provider. It has been built, typechecked,
linted, and the schema + RLS have been validated end-to-end against a local
Postgres instance (see "What's been verified" below).

---

## 1. Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Radix UI primitives ·
Supabase (Postgres + Auth) · Zod · React Hook Form · Recharts.

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
   (or the Supabase CLI — see below). They live in `supabase/migrations/000N_*.sql`
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

### 2.3 Run it

```bash
npm run dev
```

Visit `http://localhost:3000`, sign up, and you'll land in a one-step "create
your agency" flow, then the dashboard.

### 2.4 Seed demo data (optional)

Populates a realistic demo agency — **Harbour & Co Real Estate**, 5 agents, 15
properties, 30 leads with conversations, appointments, and follow-ups — kept
entirely separate from the schema migrations.

```bash
npx tsx scripts/seed-demo-data.ts
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in
`.env.local`. Demo login: `owner@harbourandco.demo` / `Demo1234!`.

## 3. What's built (Phase 1 of the spec's 10-phase plan)

- **Schema & security**: 9 migrations covering every table in the spec —
  agencies, profiles, agents, properties, leads (+ score history),
  conversations/messages, appointments/follow-ups, ai_settings, lead_events —
  plus a full Row Level Security policy set enforcing tenant isolation, and two
  guarded RPCs (`create_agency_for_current_user`, `attach_invited_agent`) so a
  user can never self-assign into another agency's data.
- **Auth**: signup, login, logout, forgot/reset password, protected routes via
  `proxy.ts` (Next.js 16's renamed middleware), and a minimal one-step
  onboarding (full multi-step wizard is Phase 2 in the spec).
- **Dashboard shell**: sidebar + topbar navigation across Dashboard, Leads,
  Properties, Agents, Settings — all wired to real Supabase queries, not
  placeholder data.
- **Leads & Properties**: filterable list views, create dialogs, and detail
  pages with real reads/writes (a lighter version of the full Phase 3/4 CRUD
  the spec describes for later phases).
- **Agents**: list view + an invite flow using Supabase's admin
  `inviteUserByEmail`, gated to the agency owner.
- **Settings**: agency details form and the full AI assistant configuration
  page from spec section 21 (tone, greeting, custom instructions, feature
  toggles, live preview).
- **`lib/ai/`**: a provider-agnostic abstraction (swap LLM vendors in one
  file), a fully deterministic and transparent lead-scoring engine matching
  the spec's exact point rules, real property matching against the agency's
  own listings (never invents a property), and working conversation /
  qualification / summarization / marketing-content services built on top of
  the provider.
- **Landing page**: hero, problem, solution, features, how-it-works, pricing,
  and final CTA, using a deliberate navy/paper design system (not shadcn/AI
  defaults) with the hot/warm/cold lead-temperature system as its visual
  signature.

## 4. What's intentionally not built yet

Per the spec's own phased development order (section 30), these come later and
are out of scope for this foundation pass: the full multi-step onboarding
wizard, the embeddable website chat widget, the automated follow-up scheduler
(cron/edge function), billing/Stripe, phone/SMS/WhatsApp channels, and the
analytics dashboard's deeper charts. The architecture (schema, RLS, `lib/ai/`)
is already shaped to support all of them without rework.

## 5. What's been verified

- `npx tsc --noEmit` — zero errors.
- `npx eslint .` — zero errors, zero warnings.
- `npm run build` — clean production build (Turbopack), all 15 routes compile.
- **All 9 migrations were applied in order against a real local Postgres 16
  instance** (with a minimal stub of Supabase's `auth` schema) and succeeded
  with no errors.
- **End-to-end flow validated against that database**: simulated two separate
  agency signups through the real `handle_new_user` trigger and
  `create_agency_for_current_user` RPC, inserted a property and a lead for one
  agency, then queried as a non-superuser role with RLS enforced — confirming
  the second agency's owner saw **zero** rows from the first agency's leads
  table, while the first agency's owner correctly saw their own. This is the
  core tenant-isolation guarantee from spec section 6, and it's enforced by
  the database itself, not just application code.

This was not run against a live Supabase project (none exists yet for this
build), so run through the flow yourself after connecting your project —
particularly Google auth if you enable it, and the invite-agent email flow,
which depends on Supabase's email sending being configured.

## 6. Deployment

### 6.1 Connect the project

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com), **Add New → Project** and import it.
   Framework preset is auto-detected as Next.js — no build command changes
   needed (`next.config.ts` is unmodified from defaults).

### 6.2 Environment variables

In **Project Settings → Environment Variables**, add everything from
`.env.local`:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase project as local dev (or a separate prod project — see below) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | " |
| `SUPABASE_SERVICE_ROLE_KEY` | " — mark **Sensitive**, server-only |
| `AI_PROVIDER` | `anthropic` |
| `ANTHROPIC_API_KEY` | mark **Sensitive** |
| `NEXT_PUBLIC_APP_URL` | your production URL, e.g. `https://your-app.vercel.app` — **do not leave this as `localhost:3000`** |

`NEXT_PUBLIC_APP_URL` isn't cosmetic: `lib/actions/auth.ts` and
`lib/actions/agents.ts` use it to build the `redirectTo` link in
password-reset and agent-invite emails. Leaving it unset/`localhost` sends
those links to the wrong place in production.

### 6.3 Supabase auth settings

In your Supabase project, **Authentication → URL Configuration**, add your
Vercel URL:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**` (or the specific
  `/reset-password` path)

Without this, Supabase will reject the redirect and the reset/invite links
in step 6.2 will fail even though `NEXT_PUBLIC_APP_URL` is correct.

### 6.4 Deploy

Click **Deploy**. On future pushes to your default branch, Vercel redeploys
automatically. If you run migrations against a fresh prod Supabase project,
do it before or immediately after the first deploy (`supabase db push` or
the SQL Editor, per section 2.1) — the app will error on missing tables
otherwise.

### 6.5 One project vs. two

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
  tenant-isolation validation described in section 5: two real agency
  signups through `create_agency_for_current_user()`, then a cross-tenant
  read attempt that must return zero rows, enforced by RLS itself.

The two integration suites need real Supabase credentials
(`SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` in
`.env.local`) and talk to whichever project those point at — they
`describe.skipIf` themselves out cleanly if credentials aren't present. Run
them against a dev/test Supabase project, not production, since they create
and delete real rows (test data is clearly namespaced and always cleaned up,
but there's no reason to point them at prod).

## 8. Project structure

```
app/                  Routes (App Router)
  (auth)/              signup, login, forgot-password, reset-password
  dashboard/           Dashboard, leads, properties, agents, settings
  onboarding/          Create-agency step
components/
  ui/                  Hand-built shadcn-style primitives
  dashboard/           Dashboard-specific components
  landing/             Marketing page sections
  auth/                Auth shell + onboarding form
lib/
  ai/                  Provider-agnostic AI service layer
  actions/             Server Actions (auth, leads, properties, agents, settings)
  supabase/            Browser/server/admin clients + middleware helper
  validation/          Zod schemas
supabase/
  migrations/          9 SQL migrations, run in order
scripts/
  seed-demo-data.ts     Demo data generator (kept separate from migrations)
types/
  database.ts          Hand-written Supabase types (regenerate once you have a live project)
  domain.ts            Shared enums/types mirroring the schema
```
