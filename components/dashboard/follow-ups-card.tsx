"use client";

import { useTransition } from "react";
import { Loader2, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cancelFollowUpAction } from "@/lib/actions/follow-ups";

interface FollowUpRow {
  id: string;
  scheduled_for: string;
  channel: string;
  message: string;
  status: string;
}

export function FollowUpsCard({ leadId, followUps }: { leadId: string; followUps: FollowUpRow[] }) {
  const [pending, startTransition] = useTransition();

  if (followUps.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled follow-ups</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {followUps.map((f) => (
          <div
            key={f.id}
            className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                {new Date(f.scheduled_for).toLocaleString("en-AU")}
                <Badge variant="secondary" className="capitalize">
                  {f.channel}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">{f.message}</p>
            </div>
            {f.status === "scheduled" && (
              <button
                type="button"
                aria-label="Cancel follow-up"
                disabled={pending}
                onClick={() => startTransition(() => cancelFollowUpAction(leadId, f.id))}
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-secondary hover:text-hot"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
