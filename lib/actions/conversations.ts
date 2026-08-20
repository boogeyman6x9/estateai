"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { sendLeadMessageSchema } from "@/lib/validation/conversation";
import { getOrCreateConversation, runConversationTurn } from "@/lib/ai/conversation-engine";
import { summarizeConversation, type ConversationMessage } from "@/lib/ai";
import type { ActionResult } from "./auth";

/**
 * Simulates the lead sending a message (there's no live chat widget yet on this
 * page — see app/api/chat/route.ts + components/dashboard/chat-widget.tsx for
 * the real one) and runs the core conversation loop via runConversationTurn.
 */
export async function sendLeadMessageAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = sendLeadMessageSchema.safeParse({
    lead_id: formData.get("lead_id"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { lead_id: leadId, content } = parsed.data;

  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("agency_id", agency.id)
    .maybeSingle();
  if (!lead) return { error: "Lead not found" };

  const { data: aiSettingsRow } = await supabase
    .from("ai_settings")
    .select("*")
    .eq("agency_id", agency.id)
    .single();
  if (!aiSettingsRow) return { error: "AI settings not configured for this agency" };

  const conversation = await getOrCreateConversation(supabase, agency.id, leadId, lead.property_id);

  try {
    await runConversationTurn({
      supabase,
      agency: { id: agency.id, name: agency.name, phone: agency.phone, email: agency.email },
      lead,
      conversation,
      aiSettingsRow,
      content,
    });
  } catch (err) {
    revalidatePath(`/dashboard/leads/${leadId}`);
    return { error: err instanceof Error ? err.message : "Failed to process message" };
  }

  revalidatePath(`/dashboard/leads/${leadId}`);
  return { success: true };
}

export type LeadSummaryResult = { headline: string; summary: string } | { error: string };

/**
 * Powers the "AI summary" block on the lead detail page (spec section 13).
 * Computed on demand rather than persisted — there's no summary column, and
 * regenerating from the live transcript is always accurate.
 */
export async function generateLeadSummaryAction(leadId: string): Promise<LeadSummaryResult> {
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
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
  if (!conversation) return { error: "No conversation yet" };

  const { data: historyRows } = await supabase
    .from("messages")
    .select("sender_type, content")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  if (!historyRows || historyRows.length === 0) return { error: "No messages yet" };

  const history: ConversationMessage[] = historyRows.map((m) => ({
    role: m.sender_type,
    content: m.content,
  }));

  try {
    return await summarizeConversation(
      {
        firstName: lead.first_name,
        leadType: lead.lead_type,
        budgetMin: lead.budget_min,
        budgetMax: lead.budget_max,
        preferredSuburbs: (lead.preferred_suburbs as string[]) ?? [],
        bedroomsRequired: lead.bedrooms_required,
        financeStatus: lead.finance_status,
        purchaseTimeline: lead.purchase_timeline,
        purpose: lead.purpose,
      },
      history
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate summary" };
  }
}
