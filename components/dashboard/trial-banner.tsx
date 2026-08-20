import Link from "next/link";
import { Sparkles } from "lucide-react";

export function TrialBanner({ hoursRemaining }: { hoursRemaining: number }) {
  const label =
    hoursRemaining <= 1
      ? "Your trial ends within the hour"
      : hoursRemaining <= 24
        ? `Your trial ends in ${hoursRemaining} hours`
        : `Your trial ends in ${Math.ceil(hoursRemaining / 24)} days`;

  return (
    <div className="flex items-center justify-between gap-4 bg-navy-900 px-4 py-2 text-sm text-white lg:px-8">
      <span className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-warm" />
        {label} — you&apos;re on a limited trial. Upgrade for full access to marketing content,
        analytics, and more.
      </span>
      <Link
        href="/dashboard/settings?tab=billing"
        className="shrink-0 rounded-md bg-white px-3 py-1 font-medium text-navy-950 hover:bg-navy-100"
      >
        Upgrade now
      </Link>
    </div>
  );
}
