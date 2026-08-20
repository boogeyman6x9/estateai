"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateLeadSummaryAction, type LeadSummaryResult } from "@/lib/actions/conversations";

export function LeadSummaryCard({ leadId, hasMessages }: { leadId: string; hasMessages: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<LeadSummaryResult | null>(null);

  function handleGenerate() {
    startTransition(async () => {
      setResult(await generateLeadSummaryAction(leadId));
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>AI summary</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={pending || !hasMessages}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {result && !("error" in result) ? "Regenerate" : "Generate"}
        </Button>
      </CardHeader>
      <CardContent>
        {!hasMessages ? (
          <p className="text-sm text-muted-foreground">
            Start a conversation to generate a summary.
          </p>
        ) : !result ? (
          <p className="text-sm text-muted-foreground">
            Click Generate to summarize this conversation.
          </p>
        ) : "error" in result ? (
          <p className="text-sm text-hot" role="alert">
            {result.error}
          </p>
        ) : (
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">{result.headline}</p>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
