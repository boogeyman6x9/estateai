import { AlertTriangle } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { isTrialExpired } from "@/lib/subscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AgencyDetailsForm } from "@/components/dashboard/agency-details-form";
import { AiSettingsForm } from "@/components/dashboard/ai-settings-form";
import { ChatWidget } from "@/components/dashboard/chat-widget";
import { BillingCard } from "@/components/dashboard/billing-card";
import { EmbedSnippetCard } from "@/components/dashboard/embed-snippet-card";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ trial?: string; tab?: string }>;
}) {
  // The one page an expired-trial agency must still reach — see
  // app/dashboard/layout.tsx and lib/dashboard-context.ts for the lockout.
  const { agency, profile } = await requireAgencyContext({ allowExpiredTrial: true });
  const { trial, tab } = await searchParams;
  const supabase = await createClient();

  const { data: aiSettings } = await supabase
    .from("ai_settings")
    .select("*")
    .eq("agency_id", agency.id)
    .single();

  const readOnly = profile.role !== "owner";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const embedSnippet = `<script src="${appUrl}/widget.js" data-agency-id="${agency.id}" async></script>`;
  const trialLocked = trial === "expired" && isTrialExpired(agency);
  const defaultTab = trialLocked || tab === "billing" ? "billing" : "agency";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy-950">Settings</h2>
        <p className="text-sm text-muted-foreground">
          {readOnly
            ? "Only the agency owner can make changes here."
            : "Manage your agency profile and AI sales assistant."}
        </p>
      </div>

      {trialLocked && (
        <Card className="border-hot bg-hot-soft">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-hot" />
            <div>
              <p className="text-sm font-semibold text-hot">Your trial has ended</p>
              <p className="mt-1 text-sm text-ink-soft">
                The rest of your dashboard is locked until you subscribe. Pick a plan below to
                pick up right where you left off — your data is safe and untouched.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="agency">Agency</TabsTrigger>
          <TabsTrigger value="ai">AI assistant</TabsTrigger>
          <TabsTrigger value="widget">Chat widget</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="agency">
          {trialLocked ? (
            <LockedTabNotice />
          ) : (
            <AgencyDetailsForm agency={agency} readOnly={readOnly} />
          )}
        </TabsContent>
        <TabsContent value="ai">
          {trialLocked ? (
            <LockedTabNotice />
          ) : (
            aiSettings && <AiSettingsForm settings={aiSettings} readOnly={readOnly} />
          )}
        </TabsContent>
        <TabsContent value="widget" className="space-y-4">
          {trialLocked ? (
            <LockedTabNotice />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Chat widget</CardTitle>
                  <CardDescription>
                    Click the bubble in the corner to try the exact widget your website visitors
                    will see — it talks to the same public API the embed below uses, and creates a
                    real lead on first message.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {aiSettings?.enabled
                      ? "Enabled and ready."
                      : "The AI assistant is currently disabled — enable it under the AI assistant tab before adding it to your website."}
                  </p>
                </CardContent>
              </Card>
              {aiSettings?.enabled && <EmbedSnippetCard snippet={embedSnippet} />}
              {aiSettings && (
                <ChatWidget
                  agencyId={agency.id}
                  agencyName={agency.name}
                  assistantName={aiSettings.assistant_name}
                  greeting={aiSettings.greeting}
                />
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="billing">
          <BillingCard
            currentPlan={agency.subscription_plan}
            status={agency.subscription_status}
            readOnly={readOnly}
            hasStripeCustomer={!!agency.stripe_customer_id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LockedTabNotice() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-12 text-center">
      <p className="text-sm font-medium text-foreground">This is locked until you subscribe</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Pick a plan on the Billing tab to unlock the rest of your dashboard again.
      </p>
    </div>
  );
}
