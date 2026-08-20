"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendLeadMessageAction } from "@/lib/actions/conversations";
import type { ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

export function SendLeadMessageForm({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(sendLeadMessageAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-2 border-t border-border pt-4">
      <input type="hidden" name="lead_id" value={leadId} />
      <Textarea
        name="content"
        placeholder="Type a message as the lead to test the AI assistant's reply…"
        rows={2}
        required
        disabled={pending}
      />
      {state.error && (
        <p className="text-sm text-hot" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </Button>
      </div>
    </form>
  );
}
