"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAgencyAction, type ActionResult } from "@/lib/actions/auth";
import { updateOwnerDetailsAction, updateAiAssistantBasicsAction } from "@/lib/actions/onboarding";
import { inviteAgentAction } from "@/lib/actions/agents";
import { createPropertyAction } from "@/lib/actions/properties";

const TOTAL_STEPS = 7;
const STEP_TITLES: Record<number, string> = {
  1: "Welcome to EstateAI",
  2: "Your agency",
  3: "Your details",
  4: "Add your first agent",
  5: "Add your first listing",
  6: "Configure your AI assistant",
  7: "You're all set",
};

const initialState: ActionResult = {};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Advances `step` exactly once per action result, matching the render-time
 * state-comparison pattern already used elsewhere in this codebase (e.g.
 * CreateLeadDialog) instead of an effect. */
function useStepAdvance(state: ActionResult, onSuccess: () => void) {
  const [prevSuccess, setPrevSuccess] = useState(state.success);
  if (state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    if (state.success) onSuccess();
  }
}

export function OnboardingWizard({
  fullName,
  hasAgency,
}: {
  fullName: string | null;
  hasAgency: boolean;
}) {
  // hasAgency means this user already has an agency — either they finished the
  // wizard before and navigated back here directly, or (mid-wizard) a server
  // action's revalidatePath caused this Server Component to re-render with
  // fresh props. Either way, useState's initializer only runs on first mount,
  // so an in-progress wizard's step is never reset by that re-render — this
  // only decides where a *fresh* mount starts.
  const [step, setStep] = useState(hasAgency ? 7 : 1);
  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  const [agencyState, agencyAction, agencyPending] = useActionState(createAgencyAction, initialState);
  const [ownerState, ownerAction, ownerPending] = useActionState(updateOwnerDetailsAction, initialState);
  const [agentState, agentAction, agentPending] = useActionState(inviteAgentAction, initialState);
  const [propertyState, propertyAction, propertyPending] = useActionState(createPropertyAction, initialState);
  const [aiState, aiAction, aiPending] = useActionState(updateAiAssistantBasicsAction, initialState);

  useStepAdvance(agencyState, next);
  useStepAdvance(ownerState, next);
  useStepAdvance(agentState, next);
  useStepAdvance(propertyState, next);
  useStepAdvance(aiState, next);

  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} className="mb-2" />
        <CardTitle className="font-display text-xl">
          {step === 1 && fullName ? `Welcome, ${fullName.split(" ")[0]}.` : STEP_TITLES[step]}
        </CardTitle>
        <CardDescription>Step {step} of {TOTAL_STEPS}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Let&apos;s set up your agency. It only takes a couple of minutes, and every step
              after this one can be skipped and finished later from your dashboard.
            </p>
            <Button className="w-full" onClick={next}>
              Get started
            </Button>
          </div>
        )}

        {step === 2 && (
          <form action={agencyAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="agencyName">Agency name</Label>
              <Input
                id="agencyName"
                name="agencyName"
                placeholder="Harbour & Co Real Estate"
                required
                onChange={(e) => {
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agencySlug">Agency URL</Label>
              <div className="flex items-center rounded-md border border-input bg-white pl-3 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
                <span>estateai.com/</span>
                <input
                  id="agencySlug"
                  name="agencySlug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  required
                  className="w-full bg-transparent px-1 py-2 text-foreground outline-none"
                  placeholder="harbour-and-co"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="agencyPhone">Phone (optional)</Label>
                <Input id="agencyPhone" name="agencyPhone" placeholder="+61 2 9555 0100" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agencyEmail">Email (optional)</Label>
                <Input id="agencyEmail" name="agencyEmail" type="email" placeholder="hello@agency.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agencyAddress">Address (optional)</Label>
              <Input id="agencyAddress" name="agencyAddress" placeholder="12 Wharf Street, Sydney NSW" />
            </div>

            {agencyState?.error && (
              <p className="text-sm text-hot" role="alert">
                {agencyState.error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={agencyPending}>
              {agencyPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        )}

        {step === 3 && (
          <form action={ownerAction} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A few details for your own profile — you&apos;re set up as the Principal agent.
              Both fields are optional.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="title">Your title</Label>
              <Input id="title" name="title" placeholder="Principal" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Your phone</Label>
              <Input id="phone" name="phone" placeholder="+61 4XX XXX XXX" />
            </div>

            {ownerState?.error && (
              <p className="text-sm text-hot" role="alert">
                {ownerState.error}
              </p>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="w-full" onClick={next}>
                Skip
              </Button>
              <Button type="submit" className="w-full" disabled={ownerPending}>
                {ownerPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form action={agentAction} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Invite a teammate now, or skip and do it later from Agents.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agentTitle">Title (optional)</Label>
              <Input id="agentTitle" name="title" placeholder="Sales Agent" />
            </div>

            {agentState?.error && (
              <p className="text-sm text-hot" role="alert">
                {agentState.error}
              </p>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="w-full" onClick={next}>
                Skip
              </Button>
              <Button type="submit" className="w-full" disabled={agentPending}>
                {agentPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Send invite
              </Button>
            </div>
          </form>
        )}

        {step === 5 && (
          <form action={propertyAction} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add your first listing so the AI assistant has something real to talk about, or
              skip and add listings later from Properties.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Sun-Filled Family Home" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="property_type">Property type</Label>
                <Select name="property_type" defaultValue="house">
                  <SelectTrigger id="property_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["house", "apartment", "townhouse", "villa", "land", "commercial", "other"].map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {t[0].toUpperCase() + t.slice(1)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="listing_type">Listing type</Label>
                <Select name="listing_type" defaultValue="sale">
                  <SelectTrigger id="listing_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For sale</SelectItem>
                    <SelectItem value="rent">For rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="23 Smith Street" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="suburb">Suburb</Label>
                <Input id="suburb" name="suburb" placeholder="Parramatta" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price ($, optional)</Label>
              <Input id="price" name="price" type="number" placeholder="950000" />
            </div>

            {propertyState?.error && (
              <p className="text-sm text-hot" role="alert">
                {propertyState.error}
              </p>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="w-full" onClick={next}>
                Skip
              </Button>
              <Button type="submit" className="w-full" disabled={propertyPending}>
                {propertyPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add listing
              </Button>
            </div>
          </form>
        )}

        {step === 6 && (
          <form action={aiAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="assistant_name">Assistant name</Label>
                <Input id="assistant_name" name="assistant_name" defaultValue="Alex" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="personality">Tone</Label>
                <Select name="personality" defaultValue="professional">
                  <SelectTrigger id="personality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="greeting">Greeting</Label>
              <Textarea
                id="greeting"
                name="greeting"
                rows={2}
                defaultValue="Hi! Thanks for your enquiry — how can I help you today?"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom_instructions">Custom instructions (optional)</Label>
              <Textarea
                id="custom_instructions"
                name="custom_instructions"
                rows={3}
                placeholder="Always be friendly and professional. Prioritize arranging inspections."
              />
            </div>

            {aiState?.error && (
              <p className="text-sm text-hot" role="alert">
                {aiState.error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={aiPending}>
              {aiPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your agency is set up and your AI assistant is ready to start qualifying leads.
              You can fine-tune everything — agents, listings, AI behavior — from your
              dashboard at any time.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
