import Link from "next/link";
import { Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TemperatureBadge } from "@/components/dashboard/temperature-badge";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { LeadFilters } from "@/components/dashboard/lead-filters";
import { CreateLeadDialog } from "@/components/dashboard/create-lead-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { LeadStatus, LeadTemperature } from "@/types/domain";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ temperature?: string; status?: string }>;
}) {
  const { temperature, status } = await searchParams;
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select(
      "id, first_name, last_name, lead_type, budget_min, budget_max, lead_score, lead_temperature, status, source, next_follow_up_at, last_contacted_at, property_id, assigned_agent_id"
    )
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: false });

  if (temperature) query = query.eq("lead_temperature", temperature as LeadTemperature);
  if (status) query = query.eq("status", status as LeadStatus);

  const { data: leads } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-navy-950">Leads</h2>
          <p className="text-sm text-muted-foreground">
            {leads?.length ?? 0} lead{leads?.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LeadFilters />
          <CreateLeadDialog />
        </div>
      </div>

      {!leads || leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads match these filters"
          description="Once your AI assistant starts capturing enquiries, they'll show up here automatically — scored and ready to work."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Next follow-up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/leads/${lead.id}`} className="hover:underline">
                      {lead.first_name} {lead.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {lead.lead_type}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {lead.budget_min || lead.budget_max
                      ? `$${(lead.budget_min ?? 0).toLocaleString()} – $${(
                          lead.budget_max ?? 0
                        ).toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{lead.lead_score}</span>
                      <TemperatureBadge temperature={lead.lead_temperature} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.next_follow_up_at
                      ? new Date(lead.next_follow_up_at).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
