"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLeadAction } from "@/lib/actions/leads";
import type { ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

export function CreateLeadDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createLeadAction, initialState);
  const [prevSuccess, setPrevSuccess] = useState(state.success);

  if (state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    if (state.success) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a lead manually</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" name="first_name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" name="last_name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead_type">Lead type</Label>
            <Select name="lead_type" defaultValue="general">
              <SelectTrigger id="lead_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["buyer", "renter", "investor", "seller", "landlord", "general"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state?.error && (
            <p className="text-sm text-hot" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add lead
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
