import {
  Bot,
  ClipboardCheck,
  Repeat,
  Flame,
  Search,
  Sparkles,
  FileText,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  { icon: Bot, title: "AI Lead Receptionist", description: "Answers property questions instantly, day or night, in your agency's voice." },
  { icon: ClipboardCheck, title: "Smart Lead Qualification", description: "Gathers budget, timeline and finance status through natural conversation." },
  { icon: Repeat, title: "Automatic Follow-Up", description: "Configurable, on-brand follow-ups that never let a lead go cold silently." },
  { icon: Flame, title: "Lead Scoring", description: "A transparent 0–100 score classifies every lead hot, warm or cold." },
  { icon: Search, title: "Property Matching", description: "Surfaces genuinely matching listings from your own active inventory — never invented." },
  { icon: Sparkles, title: "AI Property Marketing", description: "Generate listing copy, social captions and email campaigns in one click." },
  { icon: FileText, title: "Conversation Summaries", description: "A one-glance AI summary on every lead so agents can act immediately." },
  { icon: BarChart3, title: "Agency Analytics", description: "Pipeline, conversion, and response-time metrics in one dashboard." },
];

export function Features() {
  return (
    <section id="features" className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-widest text-navy-700">Platform</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy-950">
            Everything a sales employee does — minus the sick days.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-card p-6">
              <f.icon className="h-5 w-5 text-navy-700" />
              <h3 className="mt-4 font-display text-base font-semibold text-navy-950">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
