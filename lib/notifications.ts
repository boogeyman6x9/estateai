import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type SupaClient = SupabaseClient<Database>;

export type NotificationType = "hot_lead" | "inspection_requested" | "follow_up_overdue";

export interface Notification {
  id: string;
  type: NotificationType;
  leadId: string;
  leadName: string;
  message: string;
  createdAt: string;
}

function leadName(row: { first_name: string | null; last_name: string | null } | undefined): string {
  if (!row) return "A lead";
  return [row.first_name, row.last_name].filter(Boolean).join(" ") || "A lead";
}

/**
 * Powers the notification bell (spec section 22): 🔥 hot lead detected,
 * 📅 inspection requested, ⚠️ follow-up overdue. Computed on demand from
 * lead_events + follow_ups rather than a separate notifications table — there's
 * no read/unread tracking yet, just a rolling recent-activity feed.
 */
export async function getNotifications(
  supabase: SupaClient,
  agencyId: string,
  limit = 20
): Promise<Notification[]> {
  const [{ data: eventRows }, { data: overdueRows }] = await Promise.all([
    supabase
      .from("lead_events")
      .select("id, event_type, data, created_at, lead_id")
      .eq("agency_id", agencyId)
      .in("event_type", ["lead_scored", "inspection_requested"])
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("follow_ups")
      .select("id, scheduled_for, message, lead_id")
      .eq("agency_id", agencyId)
      .eq("status", "scheduled")
      .lt("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(20),
  ]);

  const leadIds = [
    ...new Set([...(eventRows ?? []).map((r) => r.lead_id), ...(overdueRows ?? []).map((r) => r.lead_id)]),
  ];
  const { data: leadRows } =
    leadIds.length > 0
      ? await supabase.from("leads").select("id, first_name, last_name").in("id", leadIds)
      : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] };
  const leadById = new Map((leadRows ?? []).map((l) => [l.id, l]));

  const notifications: Notification[] = [];

  for (const row of eventRows ?? []) {
    const name = leadName(leadById.get(row.lead_id));

    if (row.event_type === "lead_scored") {
      const data = row.data as { temperature?: string } | null;
      if (data?.temperature === "hot") {
        notifications.push({
          id: `hot-${row.id}`,
          type: "hot_lead",
          leadId: row.lead_id,
          leadName: name,
          message: `${name} just scored as a hot lead`,
          createdAt: row.created_at,
        });
      }
    } else if (row.event_type === "inspection_requested") {
      notifications.push({
        id: `insp-${row.id}`,
        type: "inspection_requested",
        leadId: row.lead_id,
        leadName: name,
        message: `${name} requested an inspection`,
        createdAt: row.created_at,
      });
    }
  }

  for (const row of overdueRows ?? []) {
    const name = leadName(leadById.get(row.lead_id));
    notifications.push({
      id: `overdue-${row.id}`,
      type: "follow_up_overdue",
      leadId: row.lead_id,
      leadName: name,
      message: `Follow-up with ${name} is overdue`,
      createdAt: row.scheduled_for,
    });
  }

  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return notifications.slice(0, limit);
}
