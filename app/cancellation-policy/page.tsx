import Link from "next/link";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/sections";

export const metadata = {
  title: "Cancellation & Refund Policy — EstateAI",
};

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-navy-700">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy-950">
          Cancellation &amp; refund policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated 21 August 2026.</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink-soft">
          <section>
            <h2 className="font-display text-lg font-semibold text-navy-950">Free trial</h2>
            <p className="mt-2">
              Every new subscription starts with a 2-day free trial. We ask for a card up front to
              activate the trial, but you are not charged anything during those 2 days. If you
              cancel before the trial ends, you will never be charged.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-950">Billing</h2>
            <p className="mt-2">
              Once your trial ends, your card is charged automatically for the plan you selected
              (Starter or Professional), and then again on the same date every month until you
              cancel. There are no lock-in contracts — every plan is billed month to month.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-950">How to cancel</h2>
            <p className="mt-2">
              Cancel any time from your dashboard: go to{" "}
              <span className="font-medium text-navy-950">Settings &rarr; Billing &rarr; Manage billing</span>,
              which opens Stripe&apos;s secure billing portal. Cancellation takes effect at the end
              of your current billing period — you keep full access until then, and you will not
              be charged again after that.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-950">Refunds</h2>
            <p className="mt-2">
              Because access continues through the end of the billing period you&apos;ve already
              paid for, we don&apos;t offer prorated refunds for cancelling mid-cycle. If you were
              charged in error, or you cancel within 7 days of a charge and haven&apos;t made
              meaningful use of the account in that period, contact us and we&apos;ll refund it in
              full — no questions asked.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-950">Failed payments</h2>
            <p className="mt-2">
              If a renewal payment fails, we&apos;ll let you know and retry automatically over the
              following days. Update your card any time from the same billing portal to avoid
              interruption.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-950">Contact us</h2>
            <p className="mt-2">
              Questions about billing, cancellations, or refunds — email{" "}
              <a href="mailto:inammuzammil5@gmail.com" className="text-navy-900 underline">
                inammuzammil5@gmail.com
              </a>{" "}
              and we&apos;ll get back to you within one business day.
            </p>
          </section>

          <p>
            <Link href="/" className="text-navy-900 underline">
              &larr; Back to EstateAI
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
