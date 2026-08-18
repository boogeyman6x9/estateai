"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your EstateAI dashboard.">
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@agency.com" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-navy-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>

        {state?.error && (
          <p className="text-sm text-hot" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-navy-900 hover:underline">
          Start free trial
        </Link>
      </p>
    </AuthShell>
  );
}
