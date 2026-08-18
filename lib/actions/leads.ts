"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/validation/lead";
import { requireAgencyContext } from "@/lib/dashboard-context";
import type { LeadStatus } from "@/types/domain";
import type { ActionResult } from "./auth";

export async function createLeadAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { agency } = await requireAgencyContext();

  const parsed = leadSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    lead_type: formData.get("lead_type") || "general",
    property_id: formData.get("property_id") || undefined,
    budget_min: formData.get("budget_min") || undefined,
    budget_max: formData.get("budget_max") || undefined,
    source: formData.get("source") || "manual",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    agency_id: agency.id,
    ...parsed.data,
    property_id: parsed.data.property_id || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function updateLeadStatusAction(leadId: string, status: LeadStatus) {
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  await supabase
    .from("leads")
    .update({ status, last_contacted_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("agency_id", agency.id);

  await supabase.from("lead_events").insert({
    agency_id: agency.id,
    lead_id: leadId,
    event_type: "status_changed",
    actor_type: "agent",
    data: { status },
  });

  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
}
