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

/** The "none"/"unassigned" Select option is a UI sentinel — treat it as absent. */
function nullableSelectValue(value: FormDataEntryValue | null): string | undefined {
  if (!value || value === "none") return undefined;
  return value as string;
}

export async function updateLeadAction(
  leadId: string,
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
    assigned_agent_id: nullableSelectValue(formData.get("assigned_agent_id")),
    property_id: nullableSelectValue(formData.get("property_id")),
    budget_min: formData.get("budget_min") || undefined,
    budget_max: formData.get("budget_max") || undefined,
    preferred_suburbs: (formData.get("preferred_suburbs") as string | null)
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [],
    bedrooms_required: formData.get("bedrooms_required") || undefined,
    finance_status: formData.get("finance_status") || "unknown",
    purchase_timeline: formData.get("purchase_timeline") || undefined,
    purpose: formData.get("purpose") || "unknown",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      lead_type: parsed.data.lead_type,
      budget_min: parsed.data.budget_min,
      budget_max: parsed.data.budget_max,
      preferred_suburbs: parsed.data.preferred_suburbs,
      bedrooms_required: parsed.data.bedrooms_required,
      finance_status: parsed.data.finance_status,
      purchase_timeline: parsed.data.purchase_timeline,
      purpose: parsed.data.purpose,
      property_id: parsed.data.property_id || null,
      assigned_agent_id: parsed.data.assigned_agent_id || null,
    })
    .eq("id", leadId)
    .eq("agency_id", agency.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  return { success: true };
}

export async function updateLeadStatusAction(leadId: string, status: LeadStatus) {
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status, last_contacted_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("agency_id", agency.id);
  if (error) {
    console.error("Failed to update lead status", error);
    return;
  }

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
