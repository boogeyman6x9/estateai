import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgencyDetailsForm } from "@/components/dashboard/agency-details-form";
import { AiSettingsForm } from "@/components/dashboard/ai-settings-form";

export default async function SettingsPage() {
  const { agency, profile } = await requireAgencyContext();
  const supabase = await createClient();

  const { data: aiSettings } = await supabase
    .from("ai_settings")
    .select("*")
    .eq("agency_id", agency.id)
    .single();

  const readOnly = profile.role !== "owner";

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

      <Tabs defaultValue="agency">
        <TabsList>
          <TabsTrigger value="agency">Agency</TabsTrigger>
          <TabsTrigger value="ai">AI assistant</TabsTrigger>
        </TabsList>
        <TabsContent value="agency">
          <AgencyDetailsForm agency={agency} readOnly={readOnly} />
        </TabsContent>
        <TabsContent value="ai">
          {aiSettings && <AiSettingsForm settings={aiSettings} readOnly={readOnly} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
