"use client";

import { useActionState, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scheduleFollowUpAction } from "@/lib/actions/follow-ups";
import type { ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

function defaultScheduledFor() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
}

export function ScheduleFollowUpDialog({
  leadId,
  leadFirstName,
}: {
  leadId: string;
  leadFirstName: string | null;
}) {
  const [open, setOpen] = useState(false);
  const action = scheduleFollowUpAction.bind(null, leadId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [prevSuccess, setPrevSuccess] = useState(state.success);

  if (state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    if (state.success) setOpen(false);
  }

  const name = leadFirstName || "there";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Schedule follow-up">
          <CalendarClock className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a follow-up</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="scheduled_for">When</Label>
            <Input
              id="scheduled_for"
              name="scheduled_for"
              type="datetime-local"
              defaultValue={defaultScheduledFor()}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="channel">Channel</Label>
            <Select name="channel" defaultValue="website">
              <SelectTrigger id="channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["website", "sms", "whatsapp", "email", "phone", "manual"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={3}
              defaultValue={`Hi ${name}, just checking in — happy to answer any questions or arrange an inspection whenever suits.`}
              required
            />
          </div>

          {state?.error && (
            <p className="text-sm text-hot" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Schedule follow-up
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
