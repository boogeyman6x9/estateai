"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAiSettingsAction } from "@/lib/actions/settings";
import type { ActionResult } from "@/lib/actions/auth";
import type { Database } from "@/types/database";

type AiSettings = Database["public"]["Tables"]["ai_settings"]["Row"];

const initialState: ActionResult = {};

function ToggleRow({
  name,
  label,
  description,
  defaultChecked,
  disabled,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
  disabled: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        name={name}
        checked={checked}
        onCheckedChange={setChecked}
        disabled={disabled}
      />
    </div>
  );
}

export function AiSettingsForm({
  settings,
  readOnly,
}: {
  settings: AiSettings;
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateAiSettingsAction, initialState);
  const [greeting, setGreeting] = useState(settings.greeting);
  const [name, setName] = useState(settings.assistant_name);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>AI assistant</CardTitle>
          <CardDescription>
            Configure how your AI sales assistant sounds and what it&apos;s allowed to do.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="assistant_name">Assistant name</Label>
                <Input
                  id="assistant_name"
                  name="assistant_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={readOnly}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="personality">Tone</Label>
                <Select name="personality" defaultValue={settings.personality} disabled={readOnly}>
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
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                disabled={readOnly}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom_instructions">Custom instructions</Label>
              <Textarea
                id="custom_instructions"
                name="custom_instructions"
                rows={4}
                defaultValue={settings.custom_instructions ?? ""}
                placeholder="Always be friendly and professional. Prioritize arranging inspections. Never make up property information."
                disabled={readOnly}
              />
            </div>

            <div>
              <ToggleRow
                name="enabled"
                label="AI assistant enabled"
                description="Turn your AI assistant on or off agency-wide."
                defaultChecked={settings.enabled}
                disabled={readOnly}
              />
              <ToggleRow
                name="qualification_enabled"
                label="Lead qualification"
                description="Naturally gather budget, timeline, and requirements during conversation."
                defaultChecked={settings.qualification_enabled}
                disabled={readOnly}
              />
              <ToggleRow
                name="lead_scoring_enabled"
                label="Lead scoring"
                description="Automatically score and classify leads as hot, warm, or cold."
                defaultChecked={settings.lead_scoring_enabled}
                disabled={readOnly}
              />
              <ToggleRow
                name="follow_up_enabled"
                label="Automatic follow-up"
                description="Send scheduled follow-up messages to unresponsive leads."
                defaultChecked={settings.follow_up_enabled}
                disabled={readOnly}
              />
              <ToggleRow
                name="booking_enabled"
                label="Inspection booking"
                description="Allow the assistant to offer and request inspection bookings."
                defaultChecked={settings.booking_enabled}
                disabled={readOnly}
              />
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
                Save AI settings
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live preview</CardTitle>
          <CardDescription>How your greeting appears to a new lead.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted p-4">
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {name || "Assistant"} · website chat
            </p>
            <div className="mt-3 rounded-lg bg-navy-900 px-3 py-2 text-sm text-white">
              {greeting || "Hi! Thanks for your enquiry — how can I help?"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
