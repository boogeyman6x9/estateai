import { Flame, ThermometerSun, BadgeCheck, CalendarCheck2, TrendingUp, MessagesSquare, Clock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { getDashboardDateRanges, lastNDayLabels } from "@/lib/date-utils";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TemperatureChart } from "@/components/dashboard/temperature-chart";
import { LeadsOverTimeChart } from "@/components/dashboard/leads-over-time-chart";
import { RecentLeadsTable } from "@/components/dashboard/recent-leads-table";

export default async function DashboardPage() {
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { startOfToday, fourteenDaysAgo } = getDashboardDateRanges();

  const [
    { count: newLeadsToday },
    { count: hotLeads },
    { count: warmLeads },
    { count: coldLeads },
    { count: qualifiedLeads },
    { count: upcomingAppointments },
    { count: totalLeads },
    { count: convertedLeads },
    { count: aiConversations },
    { count: followUpsDue },
    { data: recentLeads },
    { data: leadsForChart },
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).gte("created_at", startOfToday.toISOString()),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).eq("lead_temperature", "hot"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).eq("lead_temperature", "warm"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).eq("lead_temperature", "cold"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).in("status", ["qualified", "inspection_booked", "negotiating"]),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).gte("scheduled_at", new Date().toISOString()).in("status", ["requested", "confirmed"]),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("agency_id", agency.id),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).eq("status", "converted"),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("agency_id", agency.id),
    supabase.from("follow_ups").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).eq("status", "scheduled").lte("scheduled_for", new Date().toISOString()),
    supabase.from("leads").select("id, first_name, last_name, lead_score, lead_temperature, status, source").eq("agency_id", agency.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("leads").select("created_at").eq("agency_id", agency.id).gte("created_at", fourteenDaysAgo.toISOString()),
  ]);

  const conversionRate =
    totalLeads && totalLeads > 0 ? Math.round(((convertedLeads ?? 0) / totalLeads) * 100) : 0;

  const temperatureData = [
    { name: "Hot", value: hotLeads ?? 0, fill: "var(--hot)" },
    { name: "Warm", value: warmLeads ?? 0, fill: "var(--warm)" },
    { name: "Cold", value: coldLeads ?? 0, fill: "var(--cold)" },
  ];

  const dayBuckets = new Map<string, number>();
  for (const label of lastNDayLabels(14)) {
    dayBuckets.set(label, 0);
  }
  for (const lead of leadsForChart ?? []) {
    const key = new Date(lead.created_at).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }
  const leadsOverTime = Array.from(dayBuckets, ([date, leads]) => ({ date, leads }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="New leads today" value={newLeadsToday ?? 0} icon={ThermometerSun} accent="navy" />
        <MetricCard label="Hot leads" value={hotLeads ?? 0} icon={Flame} accent="hot" />
        <MetricCard label="Qualified leads" value={qualifiedLeads ?? 0} icon={BadgeCheck} accent="positive" />
        <MetricCard label="Upcoming inspections" value={upcomingAppointments ?? 0} icon={CalendarCheck2} accent="navy" />
        <MetricCard label="Conversion rate" value={`${conversionRate}%`} icon={TrendingUp} accent="positive" />
        <MetricCard label="AI conversations" value={aiConversations ?? 0} icon={MessagesSquare} accent="navy" />
        <MetricCard label="Follow-ups due" value={followUpsDue ?? 0} icon={Clock} accent="warm" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <LeadsOverTimeChart data={leadsOverTime} />
        <TemperatureChart data={temperatureData} />
      </div>

      <RecentLeadsTable leads={recentLeads ?? []} />
    </div>
  );
}
