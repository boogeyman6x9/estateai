import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import {
  extractQualification,
  findMatchingProperties,
  generateReply,
  getPropertyContext,
  scoreLead,
  type AiSettingsContext,
  type ConversationMessage,
} from "@/lib/ai";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
type AiSettingsRow = Database["public"]["Tables"]["ai_settings"]["Row"];
type SupaClient = SupabaseClient<Database>;

/**
 * Shared by the dashboard's "test as lead" tool (lib/actions/conversations.ts)
 * and the public chat-widget API route (app/api/chat/route.ts) — both need a
 * conversation to attach messages to. Callers resolve/authorize the lead
 * differently (session vs public agency id), so that stays their job.
 */
export async function getOrCreateConversation(
  supabase: SupaClient,
  agencyId: string,
  leadId: string,
  propertyId: string | null
): Promise<Conversation> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("agency_id", agencyId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ agency_id: agencyId, lead_id: leadId, property_id: propertyId })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export interface ConversationTurnParams {
  supabase: SupaClient;
  agency: { id: string; name: string; phone: string | null; email: string | null };
  lead: Lead;
  conversation: Conversation;
  aiSettingsRow: AiSettingsRow;
  content: string;
}

export interface ConversationTurnResult {
  /** null when the AI assistant is disabled for this agency — message was still saved. */
  reply: string | null;
}

/**
 * The core conversation loop (spec section 18): persist the incoming lead
 * message, get a grounded AI reply, then re-qualify and re-score the lead from
 * the updated transcript. Throws if the message insert or the AI reply call
 * fails; qualification/scoring failures are logged but non-fatal since the
 * reply has already succeeded and is visible to the lead.
 */
export async function runConversationTurn(
  params: ConversationTurnParams
): Promise<ConversationTurnResult> {
  const { supabase, agency, lead, conversation, aiSettingsRow, content } = params;

  const { error: insertError } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    agency_id: agency.id,
    sender_type: "lead",
    content,
  });
  if (insertError) throw insertError;

  await supabase.from("lead_events").insert({
    agency_id: agency.id,
    lead_id: lead.id,
    event_type: "message_received",
    actor_type: "lead",
    data: { conversation_id: conversation.id },
  });

  if (!aiSettingsRow.enabled) return { reply: null };

  const { data: historyRows } = await supabase
    .from("messages")
    .select("sender_type, content")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  const history: ConversationMessage[] = (historyRows ?? []).map((m) => ({
    role: m.sender_type,
    content: m.content,
  }));

  const property = lead.property_id
    ? await getPropertyContext(supabase, agency.id, lead.property_id)
    : null;

  const listingType =
    lead.lead_type === "renter"
      ? "rent"
      : lead.lead_type === "buyer" || lead.lead_type === "investor"
        ? "sale"
        : undefined;

  const matchingProperties = await findMatchingProperties(supabase, agency.id, {
    budgetMin: lead.budget_min,
    budgetMax: lead.budget_max,
    suburbs: (lead.preferred_suburbs as string[]) ?? [],
    bedrooms: lead.bedrooms_required,
    listingType,
  });

  const result = await generateReply({
    agency,
    aiSettings: {
      assistantName: aiSettingsRow.assistant_name,
      personality: aiSettingsRow.personality as AiSettingsContext["personality"],
      greeting: aiSettingsRow.greeting,
      qualificationEnabled: aiSettingsRow.qualification_enabled,
      bookingEnabled: aiSettingsRow.booking_enabled,
      customInstructions: aiSettingsRow.custom_instructions,
    },
    property,
    matchingProperties,
    lead: {
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
    history,
  });

  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    agency_id: agency.id,
    sender_type: "ai",
    content: result.reply,
  });
  await supabase.from("lead_events").insert({
    agency_id: agency.id,
    lead_id: lead.id,
    event_type: "ai_response",
    actor_type: "ai",
    data: result.shouldEscalateToAgent ? { shouldEscalateToAgent: true } : {},
  });

  if (aiSettingsRow.qualification_enabled) {
    const fullHistory: ConversationMessage[] = [...history, { role: "ai", content: result.reply }];

    try {
      const qualification = await extractQualification(fullHistory);

      const mergedSuburbs = qualification.preferredSuburbs.length
        ? qualification.preferredSuburbs
        : ((lead.preferred_suburbs as string[]) ?? []);
      const mergedFinance = qualification.financeStatus ?? lead.finance_status;
      const mergedPurpose = qualification.purpose ?? lead.purpose;
      const mergedTimeline = qualification.purchaseTimeline ?? lead.purchase_timeline;
      let mergedBudgetMin = qualification.budgetMin ?? lead.budget_min;
      let mergedBudgetMax = qualification.budgetMax ?? lead.budget_max;
      if (mergedBudgetMin != null && mergedBudgetMax != null && mergedBudgetMin > mergedBudgetMax) {
        // This turn's extraction conflicts with a stale stored bound (e.g. only one
        // side was restated). Trust whichever bound was actually grounded in this
        // conversation over the stale one, rather than persist an inverted range.
        if (qualification.budgetMax != null) mergedBudgetMin = qualification.budgetMin ?? null;
        else if (qualification.budgetMin != null) mergedBudgetMax = qualification.budgetMax ?? null;
      }

      await supabase
        .from("leads")
        .update({
          lead_type: qualification.leadType ?? lead.lead_type,
          budget_min: mergedBudgetMin,
          budget_max: mergedBudgetMax,
          preferred_suburbs: mergedSuburbs,
          bedrooms_required: qualification.bedroomsRequired ?? lead.bedrooms_required,
          finance_status: mergedFinance,
          purchase_timeline: mergedTimeline,
          purpose: mergedPurpose,
        })
        .eq("id", lead.id);

      await supabase.from("lead_events").insert({
        agency_id: agency.id,
        lead_id: lead.id,
        event_type: "lead_qualified",
        actor_type: "ai",
        data: { ...qualification },
      });

      if (qualification.wantsInspection) {
        await supabase.from("lead_events").insert({
          agency_id: agency.id,
          lead_id: lead.id,
          event_type: "inspection_requested",
          actor_type: "ai",
          data: {},
        });
      }

      if (aiSettingsRow.lead_scoring_enabled) {
        const leadMessageCount = fullHistory.filter((m) => m.role === "lead").length;
        const scoreResult = scoreLead({
          qualification: {
            budgetMin: mergedBudgetMin,
            budgetMax: mergedBudgetMax,
            financeStatus: mergedFinance,
            purchaseTimeline: mergedTimeline,
            purpose: mergedPurpose,
            wantsInspection: qualification.wantsInspection,
          },
          messageCount: leadMessageCount,
          hasMatchingProperty: matchingProperties.length > 0,
          purposeStated: mergedPurpose != null && mergedPurpose !== "unknown",
        });

        await supabase
          .from("leads")
          .update({ lead_score: scoreResult.score, lead_temperature: scoreResult.temperature })
          .eq("id", lead.id);

        await supabase.from("lead_score_history").insert({
          lead_id: lead.id,
          agency_id: agency.id,
          score: scoreResult.score,
          temperature: scoreResult.temperature,
          factors: { ...scoreResult.factors },
        });

        await supabase.from("lead_events").insert({
          agency_id: agency.id,
          lead_id: lead.id,
          event_type: "lead_scored",
          actor_type: "ai",
          data: { score: scoreResult.score, temperature: scoreResult.temperature },
        });
      }
    } catch (err) {
      console.error("Lead qualification/scoring failed", err);
    }
  }

  return { reply: result.reply };
}
