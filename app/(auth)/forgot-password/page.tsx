"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction, type ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to choose a new one."
    >
      {state?.success ? (
        <div className="flex items-start gap-3 rounded-md border border-positive-soft bg-positive-soft p-4 text-sm text-positive">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>If an account exists for that email, we&apos;ve sent a reset link.</p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@agency.com" required />
          </div>

          {state?.error && (
            <p className="text-sm text-hot" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-navy-900 hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}
