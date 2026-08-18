const STEPS = [
  { n: "01", title: "New enquiry", description: "A lead messages your website chat, any hour of the day." },
  { n: "02", title: "AI conversation", description: "EstateAI replies instantly, grounded only in your real listings." },
  { n: "03", title: "Qualification", description: "Budget, area, timeline and finance status are gathered naturally." },
  { n: "04", title: "Lead scoring", description: "Every lead is scored 0–100 and classified hot, warm, or cold." },
  { n: "05", title: "Agent notification", description: "High-value leads are flagged to the right agent immediately." },
  { n: "06", title: "Follow-up", description: "Unresponsive leads get a timed, on-brand follow-up automatically." },
  { n: "07", title: "Inspection booking", description: "Interested buyers can request a viewing without waiting on a callback." },
];

export function Solution() {
  return (
    <section id="solution" className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-positive">The solution</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-navy-950">
          One AI assistant, working every enquiry from first message to booked inspection.
        </h2>
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.n} className="border-t-2 border-navy-900 pt-4">
            <span className="font-mono text-xs text-muted-foreground">{step.n}</span>
            <h3 className="mt-1 font-display text-lg font-semibold text-navy-950">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm text-ink-soft">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
