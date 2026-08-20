import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HOW_IT_WORKS = [
  { title: "Connect your agency", description: "Create your account and set up your agency profile in minutes." },
  { title: "Add your properties", description: "Import or add your active listings so the AI can speak to them accurately." },
  { title: "Activate your AI assistant", description: "Choose a tone, write a greeting, and turn qualification and scoring on." },
  { title: "EstateAI handles enquiries", description: "New leads are captured, qualified, scored, and followed up automatically." },
];

const PLANS = [
  {
    name: "Starter",
    price: "$299",
    description: "For a single office finding its footing with AI.",
    features: ["Up to 200 AI conversations/mo", "Up to 50 active listings", "Core lead scoring", "Email support"],
  },
  {
    name: "Professional",
    price: "$699",
    description: "For growing agencies that want full automation.",
    features: ["Up to 1,000 AI conversations/mo", "Unlimited active listings", "Automated follow-ups", "AI marketing content", "Priority support"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For multi-office agencies with custom needs.",
    features: ["Unlimited conversations", "Multi-office support", "Custom integrations", "Dedicated success manager"],
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-navy-700">Getting started</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-navy-950">
          Live in an afternoon, not a quarter.
        </h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_IT_WORKS.map((step, i) => (
          <div key={step.title} className="rounded-lg border border-border bg-card p-6">
            <span className="font-mono text-2xl font-semibold text-navy-100">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-display text-base font-semibold text-navy-950">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-ink-soft">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-widest text-navy-700">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy-950">
            Simple, agency-sized plans.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={plan.featured ? "border-navy-900 shadow-md ring-1 ring-navy-900" : ""}
            >
              <CardContent className="p-6">
                {plan.featured && (
                  <span className="mb-3 inline-block rounded-full bg-navy-900 px-2.5 py-0.5 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold text-navy-950">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-4 font-display text-3xl font-semibold text-navy-950">
                  {plan.price}
                  {plan.price !== "Custom" && (
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  )}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={plan.featured ? "default" : "outline"}
                  asChild
                >
                  <Link href="/signup">Start Free</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="rounded-xl bg-navy-950 px-8 py-16 text-center">
        <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-semibold text-white sm:text-4xl">
          Stop losing leads while your agents are busy.
        </h2>
        <div className="mt-8">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">
              Start Building Your AI Sales Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} EstateAI. All rights reserved.</p>
        <Link href="/cancellation-policy" className="hover:text-navy-900">
          Cancellation &amp; refund policy
        </Link>
        <p className="font-mono text-xs">Turn every property enquiry into an opportunity.</p>
      </div>
    </footer>
  );
}
