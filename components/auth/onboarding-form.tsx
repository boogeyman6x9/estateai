"use client";

import { useActionState, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAgencyAction, type ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function OnboardingForm({ fullName }: { fullName: string | null }) {
  const [state, formAction, pending] = useActionState(createAgencyAction, initialState);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <CardTitle className="font-display text-xl">
          {fullName ? `Welcome, ${fullName.split(" ")[0]}.` : "Welcome to EstateAI."}
        </CardTitle>
        <CardDescription>
          Set up your agency to activate your AI sales assistant. You can add agents,
          properties, and fine-tune the AI from your dashboard afterwards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
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

          {state?.error && (
            <p className="text-sm text-hot" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create my agency
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
