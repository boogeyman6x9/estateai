import Link from "next/link";
import { BarChart3, Lock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { hasProFeatures } from "@/lib/subscription";
import { ConversionFunnelChart, type FunnelStage } from "@/components/dashboard/conversion-funnel-chart";
import { LeadSourceChart } from "@/components/dashboard/lead-source-chart";
import { PropertyPerformanceTable } from "@/components/dashboard/property-performance-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";

const FUNNEL_COLORS: Record<string, string> = {
  New: "var(--navy-900)",
  Contacted: "var(--navy-700)",
  Qualified: "var(--warm)",
  "Inspection booked": "var(--warm)",
  Negotiating: "var(--positive)",
  Converted: "var(--positive)",
};

export default async function AnalyticsPage() {
  const { agency } = await requireAgencyContext();

  if (!hasProFeatures(agency)) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-navy-950">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            How leads move through your pipeline, where they come from, and which listings
            perform best.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-16 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Analytics is a Professional feature</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Upgrade to see your conversion funnel, lead source breakdown, and top-performing
            listings.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/settings?tab=billing">View plans</Link>
          </Button>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: leadsForAnalytics }, { data: properties }] = await Promise.all([
    supabase.from("leads").select("status, source, property_id").eq("agency_id", agency.id),
    supabase.from("properties").select("id, title, suburb").eq("agency_id", agency.id),
  ]);

  const statuses = (leadsForAnalytics ?? []).map((l) => l.status);
  const total = statuses.length;
  const reached = (stages: string[]) => statuses.filter((s) => stages.includes(s)).length;

  const funnelStages: { stage: string; count: number }[] = [
    { stage: "New", count: total },
    {
      stage: "Contacted",
      count: reached(["contacted", "qualified", "inspection_booked", "negotiating", "converted"]),
    },
    {
      stage: "Qualified",
      count: reached(["qualified", "inspection_booked", "negotiating", "converted"]),
    },
    {
      stage: "Inspection booked",
      count: reached(["inspection_booked", "negotiating", "converted"]),
    },
    { stage: "Negotiating", count: reached(["negotiating", "converted"]) },
    { stage: "Converted", count: reached(["converted"]) },
  ];
  const funnelData: FunnelStage[] = funnelStages.map((s) => ({
    ...s,
    fill: FUNNEL_COLORS[s.stage] ?? "var(--navy-700)",
  }));

  const sourceCounts = new Map<string, number>();
  for (const l of leadsForAnalytics ?? []) {
    const key = l.source || "unknown";
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const sourceData = Array.from(sourceCounts, ([source, count]) => ({ source, count })).sort(
    (a, b) => b.count - a.count
  );

  const propertyLeadCounts = new Map<string, number>();
  for (const l of leadsForAnalytics ?? []) {
    if (!l.property_id) continue;
    propertyLeadCounts.set(l.property_id, (propertyLeadCounts.get(l.property_id) ?? 0) + 1);
  }
  const propertyRows = (properties ?? [])
    .map((p) => ({
      id: p.id,
      title: p.title,
      suburb: p.suburb,
      enquiries: propertyLeadCounts.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.enquiries - a.enquiries)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy-950">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          How leads move through your pipeline, where they come from, and which listings perform best.
        </p>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No leads yet"
          description="Once your AI assistant starts capturing enquiries, your pipeline, lead sources, and top listings will show up here."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ConversionFunnelChart data={funnelData} />
            <LeadSourceChart data={sourceData} />
          </div>

          <PropertyPerformanceTable rows={propertyRows} />
        </>
      )}
    </div>
  );
}
