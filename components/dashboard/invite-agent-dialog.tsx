"use client";

import { useActionState, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

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
import { inviteAgentAction } from "@/lib/actions/agents";
import type { ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

export function InviteAgentDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(inviteAgentAction, initialState);
  const [prevSuccess, setPrevSuccess] = useState(state.success);

  if (state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    if (state.success) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Invite agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" name="title" placeholder="Sales Agent" />
          </div>

          {state?.error && (
            <p className="text-sm text-hot" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send invite
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
