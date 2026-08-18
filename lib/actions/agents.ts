"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import type { ActionResult } from "./auth";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  fullName: z.string().min(2, "Enter their full name"),
  title: z.string().optional(),
});

export async function inviteAgentAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { profile } = await requireAgencyContext();

  if (profile.role !== "owner") {
    return { error: "Only the agency owner can invite teammates." };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    title: formData.get("title") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const admin = await createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: { full_name: parsed.data.fullName },
      redirectTo: `${appUrl}/reset-password`,
    }
  );

  if (inviteError) return { error: inviteError.message };

  const supabase = await createClient();
  const { error: attachError } = await supabase.rpc("attach_invited_agent", {
    invited_profile_id: invited.user.id,
    agent_title: parsed.data.title ?? null,
  });

  if (attachError) return { error: attachError.message };

  revalidatePath("/dashboard/agents");
  return { success: true };
}

export async function toggleAgentActiveAction(agentId: string, active: boolean) {
  const { agency, profile } = await requireAgencyContext();
  if (profile.role !== "owner") return;

  const supabase = await createClient();
  await supabase.from("agents").update({ active }).eq("id", agentId).eq("agency_id", agency.id);
  revalidatePath("/dashboard/agents");
}
