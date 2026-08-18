import { Clock, MessageSquareOff, PhoneMissed, TrendingDown } from "lucide-react";

const PROBLEMS = [
  {
    icon: Clock,
    title: "Slow response times",
    description: "Buyers enquire at all hours. By the time an agent replies, they've already contacted three other agencies.",
  },
  {
    icon: PhoneMissed,
    title: "Missed enquiries",
    description: "Weekends, evenings, and busy open homes mean genuine buyers fall through the cracks.",
  },
  {
    icon: MessageSquareOff,
    title: "Inconsistent follow-up",
    description: "Warm leads go cold because nobody circled back — there's no system to catch them.",
  },
  {
    icon: TrendingDown,
    title: "Lost revenue",
    description: "Every unanswered enquiry is a commission that goes to a competitor instead.",
  },
];

export function Problem() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-widest text-hot">The problem</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy-950">
            Agencies lose good buyers before an agent ever picks up the phone.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p) => (
            <div key={p.title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-hot-soft text-hot">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy-950">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
