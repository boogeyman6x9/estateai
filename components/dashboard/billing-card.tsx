"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createCheckoutSessionAction, createPortalSessionAction } from "@/lib/actions/billing";
import type { ActionResult } from "@/lib/actions/auth";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/domain";

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
};

const STATUS_VARIANT: Record<SubscriptionStatus, "positive" | "warm" | "hot" | "secondary"> = {
  trialing: "secondary",
  active: "positive",
  past_due: "warm",
  canceled: "hot",
};

const PLANS: {
  id: SubscriptionPlan;
  name: string;
  price: string;
  features: string[];
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$299/mo",
    features: ["Up to 200 AI conversations/mo", "Up to 50 active listings", "Core lead scoring", "Email support"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$699/mo",
    features: [
      "Up to 1,000 AI conversations/mo",
      "Unlimited active listings",
      "Automated follow-ups",
      "AI marketing content",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited conversations",
      "Multi-office support",
      "Custom integrations",
      "Dedicated success manager",
    ],
  },
];

const initialState: ActionResult = {};

function CheckoutButton({ plan, label }: { plan: "starter" | "professional"; label: string }) {
  const action = createCheckoutSessionAction.bind(null, plan);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="mb-2 text-xs text-hot" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </Button>
    </form>
  );
}

function ManageBillingButton() {
  const [state, formAction, pending] = useActionState(createPortalSessionAction, initialState);

  return (
    <form action={formAction} className="space-y-1">
      {state?.error && (
        <p className="text-xs text-hot" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Manage billing
      </Button>
    </form>
  );
}

function handleEnterpriseContact() {
  toast.info("Reach out to your account manager to set up Enterprise.");
}

export function BillingCard({
  currentPlan,
  status,
  readOnly,
  hasStripeCustomer,
}: {
  currentPlan: SubscriptionPlan;
  status: SubscriptionStatus;
  readOnly: boolean;
  hasStripeCustomer: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Manage your subscription and payment details.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-semibold capitalize text-navy-950">
              {currentPlan}
            </span>
            <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
          </div>
          {!readOnly && hasStripeCustomer && <ManageBillingButton />}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          // A canceled subscription isn't "current" on any plan anymore —
          // otherwise the card for their old plan would show a disabled
          // "Current plan" button instead of letting them resubscribe to it.
          const isCurrent = plan.id === currentPlan && status !== "canceled";
          return (
            <Card key={plan.id} className={cn(isCurrent && "border-navy-900 ring-1 ring-navy-900")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge variant="positive">Current</Badge>}
                </div>
                <CardDescription className="font-mono text-base text-navy-900">
                  {plan.price}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!readOnly && isCurrent && (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                )}
                {!readOnly && !isCurrent && plan.id === "enterprise" && (
                  <Button variant="default" className="w-full" onClick={handleEnterpriseContact}>
                    Contact us
                  </Button>
                )}
                {!readOnly && !isCurrent && plan.id !== "enterprise" && (
                  <CheckoutButton
                    plan={plan.id}
                    label={status === "canceled" ? "Resubscribe" : "Switch plan"}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
