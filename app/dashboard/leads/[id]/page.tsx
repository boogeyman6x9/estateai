import { notFound } from "next/navigation";
import { Mail, Phone, CalendarPlus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemperatureBadge } from "@/components/dashboard/temperature-badge";
import { LeadStatusSelect } from "@/components/dashboard/lead-status-select";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SendLeadMessageForm } from "@/components/dashboard/send-lead-message-form";
import { LeadSummaryCard } from "@/components/dashboard/lead-summary-card";
import { EditLeadDialog } from "@/components/dashboard/edit-lead-dialog";
import { MessagesSquare, Clock3 } from "lucide-react";

const EVENT_LABEL: Record<string, string> = {
  lead_created: "Lead created",
  message_received: "Message received",
  ai_response: "AI responded",
  lead_scored: "Lead scored",
  lead_qualified: "Lead qualified",
  inspection_requested: "Inspection requested",
  inspection_booked: "Inspection booked",
  agent_assigned: "Agent assigned",
  follow_up_scheduled: "Follow-up scheduled",
  follow_up_sent: "Follow-up sent",
  lead_converted: "Lead converted",
  status_changed: "Status changed",
  note_added: "Note added",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("agency_id", agency.id)
    .maybeSingle();

  if (!lead) notFound();

  const [{ data: conversations }, { data: events }, { data: agentRows }, { data: properties }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("id")
        .eq("agency_id", agency.id)
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("lead_events")
        .select("*")
        .eq("agency_id", agency.id)
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("agents")
        .select("id, title, profile_id, profiles(full_name, email)")
        .eq("agency_id", agency.id)
        .eq("active", true),
      supabase
        .from("properties")
        .select("id, title")
        .eq("agency_id", agency.id)
        .neq("status", "withdrawn")
        .order("created_at", { ascending: false }),
    ]);

  const agents = (agentRows ?? []).map((a) => {
    const p = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
    return { id: a.id, label: p?.full_name ?? p?.email ?? a.title ?? "Agent" };
  });

  const conversationId = conversations?.[0]?.id;
  const { data: messages } = conversationId
    ? await supabase
        .from("messages")
        .select("id, sender_type, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] as { id: string; sender_type: string; content: string; created_at: string }[] };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-semibold text-navy-950">
                {lead.first_name} {lead.last_name}
              </h1>
              <TemperatureBadge temperature={lead.lead_temperature} />
              <span className="font-mono text-sm text-muted-foreground">
                {lead.lead_score}/100
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {lead.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {lead.email}
                </span>
              )}
              {lead.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {lead.phone}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeadStatusSelect leadId={lead.id} status={lead.status} />
            <EditLeadDialog
              lead={lead}
              agents={agents}
              properties={(properties ?? []).map((p) => ({ id: p.id, title: p.title }))}
            />
            <Button variant="outline" size="icon" aria-label="Schedule inspection">
              <CalendarPlus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Type" value={lead.lead_type} />
            <Field
              label="Budget"
              value={
                lead.budget_min || lead.budget_max
                  ? `$${(lead.budget_min ?? 0).toLocaleString()} – $${(
                      lead.budget_max ?? 0
                    ).toLocaleString()}`
                  : null
              }
            />
            <Field
              label="Suburbs"
              value={
                Array.isArray(lead.preferred_suburbs) && lead.preferred_suburbs.length
                  ? (lead.preferred_suburbs as string[]).join(", ")
                  : null
              }
            />
            <Field label="Bedrooms" value={lead.bedrooms_required} />
            <Field label="Finance" value={lead.finance_status?.replace(/_/g, " ")} />
            <Field label="Timeline" value={lead.purchase_timeline} />
            <Field label="Purpose" value={lead.purpose?.replace(/_/g, " ")} />
            <Field label="Source" value={lead.source} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            {!messages || messages.length === 0 ? (
              <EmptyState
                icon={MessagesSquare}
                title="No conversation yet"
                description="Send a message below to test the AI assistant, or wait for the website chat widget to create one."
              />
            ) : (
              <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                {messages
                  .slice()
                  .reverse()
                  .map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        m.sender_type === "lead"
                          ? "bg-secondary text-foreground"
                          : "ml-auto bg-navy-900 text-white"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
              </div>
            )}
            <SendLeadMessageForm leadId={lead.id} />
          </CardContent>
        </Card>
      </div>

      <LeadSummaryCard leadId={lead.id} hasMessages={!!messages && messages.length > 0} />

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {!events || events.length === 0 ? (
            <EmptyState icon={Clock3} title="No activity yet" description="Lead events will appear here as they happen." />
          ) : (
            <ol className="space-y-4 border-l border-border pl-4">
              {events.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-navy-700" />
                  <p className="text-sm font-medium text-foreground">
                    {EVENT_LABEL[event.event_type] ?? event.event_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString("en-AU")}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize text-foreground">{value ?? "—"}</span>
    </div>
  );
}
