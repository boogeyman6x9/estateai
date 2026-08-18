"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAgencyDetailsAction } from "@/lib/actions/settings";
import type { ActionResult } from "@/lib/actions/auth";
import type { Database } from "@/types/database";

type Agency = Database["public"]["Tables"]["agencies"]["Row"];

const initialState: ActionResult = {};

export function AgencyDetailsForm({ agency, readOnly }: { agency: Agency; readOnly: boolean }) {
  const [state, formAction, pending] = useActionState(updateAgencyDetailsAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency details</CardTitle>
        <CardDescription>
          Shown to leads in AI conversations and on your public listings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Agency name</Label>
            <Input id="name" name="name" defaultValue={agency.name} disabled={readOnly} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={agency.phone ?? ""} disabled={readOnly} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={agency.email ?? ""}
                disabled={readOnly}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={agency.website ?? ""} disabled={readOnly} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={agency.address ?? ""} disabled={readOnly} />
          </div>

          {state?.error && (
            <p className="text-sm text-hot" role="alert">
              {state.error}
            </p>
          )}
          {state?.success && <p className="text-sm text-positive">Saved.</p>}

          {!readOnly && (
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
