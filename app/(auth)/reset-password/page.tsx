"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction, type ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Use at least 8 characters. You'll stay signed in on this device."
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
        </div>

        {state?.error && (
          <p className="text-sm text-hot" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
