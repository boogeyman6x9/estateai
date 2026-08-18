import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "hot" | "warm" | "positive" | "navy";
}) {
  const accentClasses = {
    hot: "bg-hot-soft text-hot",
    warm: "bg-warm-soft text-warm",
    positive: "bg-positive-soft text-positive",
    navy: "bg-navy-100 text-navy-900",
  } as const;

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-navy-950">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
            accentClasses[accent ?? "navy"]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
