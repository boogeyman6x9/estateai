"use client";

import { useActionState, useState } from "react";
import { Loader2, Pencil } from "lucide-react";

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
import { updateLeadAction } from "@/lib/actions/leads";
import type { ActionResult } from "@/lib/actions/auth";
import type { Database } from "@/types/database";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

const initialState: ActionResult = {};

export function EditLeadDialog({
  lead,
  agents,
  properties,
}: {
  lead: Lead;
  agents: { id: string; label: string }[];
  properties: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const action = updateLeadAction.bind(null, lead.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [prevSuccess, setPrevSuccess] = useState(state.success);

  if (state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    if (state.success) setOpen(false);
  }

  const suburbs = Array.isArray(lead.preferred_suburbs) ? (lead.preferred_suburbs as string[]) : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Edit lead">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit lead</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_first_name">First name</Label>
              <Input id="edit_first_name" name="first_name" defaultValue={lead.first_name ?? ""} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_last_name">Last name</Label>
              <Input id="edit_last_name" name="last_name" defaultValue={lead.last_name ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_email">Email</Label>
              <Input id="edit_email" name="email" type="email" defaultValue={lead.email ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_phone">Phone</Label>
              <Input id="edit_phone" name="phone" defaultValue={lead.phone ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_lead_type">Lead type</Label>
              <Select name="lead_type" defaultValue={lead.lead_type}>
                <SelectTrigger id="edit_lead_type">
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
            <div className="space-y-1.5">
              <Label htmlFor="edit_purpose">Purpose</Label>
              <Select name="purpose" defaultValue={lead.purpose}>
                <SelectTrigger id="edit_purpose">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner_occupier">Owner occupier</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_budget_min">Budget min ($)</Label>
              <Input
                id="edit_budget_min"
                name="budget_min"
                type="number"
                defaultValue={lead.budget_min ?? undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_budget_max">Budget max ($)</Label>
              <Input
                id="edit_budget_max"
                name="budget_max"
                type="number"
                defaultValue={lead.budget_max ?? undefined}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_preferred_suburbs">Preferred suburbs (comma separated)</Label>
            <Input id="edit_preferred_suburbs" name="preferred_suburbs" defaultValue={suburbs.join(", ")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_bedrooms_required">Bedrooms required</Label>
              <Input
                id="edit_bedrooms_required"
                name="bedrooms_required"
                type="number"
                min={0}
                defaultValue={lead.bedrooms_required ?? undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_finance_status">Finance status</Label>
              <Select name="finance_status" defaultValue={lead.finance_status}>
                <SelectTrigger id="edit_finance_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["unknown", "not_started", "in_progress", "pre_approved", "cash_buyer"].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_purchase_timeline">Timeline</Label>
            <Input
              id="edit_purchase_timeline"
              name="purchase_timeline"
              placeholder="Within 30 days"
              defaultValue={lead.purchase_timeline ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_assigned_agent_id">Assigned agent</Label>
              <Select name="assigned_agent_id" defaultValue={lead.assigned_agent_id ?? "none"}>
                <SelectTrigger id="edit_assigned_agent_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_property_id">Property</Label>
              <Select name="property_id" defaultValue={lead.property_id ?? "none"}>
                <SelectTrigger id="edit_property_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-hot" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
