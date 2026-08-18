"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { aiSettingsSchema } from "@/lib/validation/ai-settings";
import { requireAgencyContext } from "@/lib/dashboard-context";
import type { ActionResult } from "./auth";

const agencyDetailsSchema = z.object({
  name: z.string().min(2, "Enter your agency name"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  address: z.string().optional(),
});

export async function updateAgencyDetailsAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { agency, profile } = await requireAgencyContext();
  if (profile.role !== "owner") return { error: "Only the agency owner can edit these details." };

  const parsed = agencyDetailsSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    website: formData.get("website") || undefined,
    address: formData.get("address") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("agencies").update(parsed.data).eq("id", agency.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateAiSettingsAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { agency, profile } = await requireAgencyContext();
  if (profile.role !== "owner") return { error: "Only the agency owner can edit AI settings." };

  const parsed = aiSettingsSchema.safeParse({
    enabled: formData.get("enabled") === "on",
    assistant_name: formData.get("assistant_name"),
    personality: formData.get("personality"),
    greeting: formData.get("greeting"),
    qualification_enabled: formData.get("qualification_enabled") === "on",
    lead_scoring_enabled: formData.get("lead_scoring_enabled") === "on",
    follow_up_enabled: formData.get("follow_up_enabled") === "on",
    booking_enabled: formData.get("booking_enabled") === "on",
    custom_instructions: formData.get("custom_instructions") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("ai_settings").update(parsed.data).eq("agency_id", agency.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}
