"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { ownerDetailsSchema } from "@/lib/validation/auth";
import { aiAssistantBasicsSchema } from "@/lib/validation/ai-settings";
import type { ActionResult } from "./auth";

/**
 * Onboarding step 3: personalize the owner's own profile/agent record (both
 * already exist — create_agency_for_current_user creates the "Principal"
 * agent row). Every field is optional; this step is a nicety, not a gate.
 */
export async function updateOwnerDetailsAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { agency, profile } = await requireAgencyContext();

  const parsed = ownerDetailsSchema.safeParse({
    phone: formData.get("phone") || undefined,
    title: formData.get("title") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  if (parsed.data.phone) {
    const { error } = await supabase
      .from("profiles")
      .update({ phone: parsed.data.phone })
      .eq("id", profile.id);
    if (error) return { error: error.message };
  }
  if (parsed.data.title) {
    const { error } = await supabase
      .from("agents")
      .update({ title: parsed.data.title })
      .eq("agency_id", agency.id)
      .eq("profile_id", profile.id);
    if (error) return { error: error.message };
  }

  return { success: true };
}

/**
 * Onboarding step 6: a trimmed version of the AI settings form (spec section
 * 21's full toggle set is configurable later from Settings). Only touches
 * assistant_name/personality/greeting/custom_instructions so it can't
 * accidentally flip the enabled/qualification/scoring/etc. toggles off — those
 * default to "on" from the ai_settings table itself and aren't in this form.
 */
export async function updateAiAssistantBasicsAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { agency, profile } = await requireAgencyContext();
  if (profile.role !== "owner") return { error: "Only the agency owner can edit AI settings." };

  const parsed = aiAssistantBasicsSchema.safeParse({
    assistant_name: formData.get("assistant_name"),
    personality: formData.get("personality"),
    greeting: formData.get("greeting"),
    custom_instructions: formData.get("custom_instructions") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_settings")
    .update(parsed.data)
    .eq("agency_id", agency.id);
  if (error) return { error: error.message };

  return { success: true };
}
