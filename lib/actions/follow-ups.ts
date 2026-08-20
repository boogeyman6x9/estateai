"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { scheduleFollowUpSchema } from "@/lib/validation/follow-up";
import type { ActionResult } from "./auth";

export async function scheduleFollowUpAction(
  leadId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { agency } = await requireAgencyContext();

  const parsed = scheduleFollowUpSchema.safeParse({
    scheduled_for: formData.get("scheduled_for"),
    channel: formData.get("channel") || "website",
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("id", leadId)
    .eq("agency_id", agency.id)
    .maybeSingle();
  if (!lead) return { error: "Lead not found" };

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("agency_id", agency.id)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const scheduledFor = new Date(parsed.data.scheduled_for).toISOString();

  const { error } = await supabase.from("follow_ups").insert({
    agency_id: agency.id,
    lead_id: leadId,
    conversation_id: conversation?.id ?? null,
    scheduled_for: scheduledFor,
    channel: parsed.data.channel,
    message: parsed.data.message,
    status: "scheduled",
  });
  if (error) return { error: error.message };

  await supabase.from("lead_events").insert({
    agency_id: agency.id,
    lead_id: leadId,
    event_type: "follow_up_scheduled",
    actor_type: "agent",
    data: { scheduled_for: scheduledFor, channel: parsed.data.channel },
  });

  revalidatePath(`/dashboard/leads/${leadId}`);
  return { success: true };
}

export async function cancelFollowUpAction(leadId: string, followUpId: string) {
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "cancelled" })
    .eq("id", followUpId)
    .eq("agency_id", agency.id)
    .eq("status", "scheduled");
  if (error) {
    console.error("Failed to cancel follow-up", error);
    return;
  }

  revalidatePath(`/dashboard/leads/${leadId}`);
}
