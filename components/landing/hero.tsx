import Link from "next/link";
import { ArrowRight, Flame, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% -10%, rgba(16,28,58,0.08), transparent 45%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-navy-700">
            Your AI Sales Employee for Real Estate
          </p>
          <h1 className="mt-4 max-w-xl text-balance font-display text-4xl font-semibold leading-[1.1] text-navy-950 sm:text-5xl">
            Turn every property enquiry into an opportunity.
          </h1>
          <p className="mt-6 max-w-lg text-balance text-lg text-ink-soft">
            EstateAI captures, qualifies and follows up with property leads 24/7 — so
            your agents can focus on closing deals, not chasing enquiries.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#solution">See How It Works</a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required · Set up your assistant in minutes
          </p>
        </div>

        {/* Signature element: an enquiry arriving overnight, becoming a scored hot lead by morning */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Moon className="h-3.5 w-3.5" />
              11:47 PM &middot; website chat
            </div>
            <div className="mt-3 space-y-2">
              <div className="max-w-[85%] rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">
                Hi, is this house still available? Looking for something around
                $950k in Parramatta.
              </div>
              <div className="ml-auto max-w-[85%] rounded-lg bg-navy-900 px-3 py-2 text-sm text-white">
                Yes, still available! Are you pre-approved, and would Saturday
                work for an inspection?
              </div>
            </div>
          </div>

          <div className="relative z-10 -mt-4 ml-6 rounded-xl border border-hot/30 bg-card p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full bg-hot-soft px-2.5 py-1 text-xs font-medium text-hot">
                <Flame className="h-3.5 w-3.5" />
                Hot lead · 94/100
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">7:02 AM</span>
            </div>
            <p className="mt-3 font-display text-base font-semibold text-navy-950">
              Sarah Khan
            </p>
            <dl className="mt-2 space-y-1 text-sm text-ink-soft">
              <div className="flex justify-between">
                <dt>Budget</dt>
                <dd className="font-mono text-navy-900">$950,000</dd>
              </div>
              <div className="flex justify-between">
                <dt>Finance</dt>
                <dd className="text-navy-900">Pre-approved</dd>
              </div>
              <div className="flex justify-between">
                <dt>Inspection</dt>
                <dd className="text-navy-900">Sat 11:30 AM</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
