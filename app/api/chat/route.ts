import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/server";
import { chatRequestSchema } from "@/lib/validation/chat";
import { getOrCreateConversation, runConversationTurn } from "@/lib/ai/conversation-engine";
import { isAccessLocked } from "@/lib/subscription";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { Database } from "@/types/database";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Conversation = Database["public"]["Tables"]["conversations"]["Row"];

// Public, credential-free endpoint called from arbitrary agency websites once
// embedded (app/widget/[agencyId] + public/widget.js) — no cookies/session
// involved, so a wildcard origin is safe; every query below is still scoped
// to the validated agencyId regardless of who's asking.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Public endpoint for the website chat widget (spec section 19) — no Supabase
 * user session. The agency is identified by its public id (agencyId), the way
 * a Stripe/Intercom-style publishable key works: safe to embed client-side
 * because every query below is scoped to that agency, and privileged writes
 * only happen through the admin client running on the server.
 */
export async function POST(request: Request) {
  const supabase = await createAdminClient();

  // Checked before even parsing the body — cheapest possible reject for a
  // client hammering this public, credential-free endpoint.
  const allowed = await checkRateLimit(supabase, `chat:${getClientIp(request)}`, {
    windowSeconds: 60,
    maxRequests: 10,
  });
  if (!allowed) {
    return json({ error: "Too many messages — please wait a moment and try again." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, 400);
  }
  const { agencyId, conversationId, propertyId, message, lead: leadInput } = parsed.data;

  const { data: agency } = await supabase
    .from("agencies")
    .select("id, name, phone, email, subscription_status, trial_ends_at")
    .eq("id", agencyId)
    .maybeSingle();
  if (!agency) return json({ error: "Unknown agency" }, 404);
  if (isAccessLocked(agency)) return json({ error: "Chat is currently unavailable" }, 503);

  const { data: aiSettingsRow } = await supabase
    .from("ai_settings")
    .select("*")
    .eq("agency_id", agency.id)
    .single();
  if (!aiSettingsRow?.enabled) {
    return json({ error: "Chat is currently unavailable" }, 503);
  }

  let lead: Lead;
  let conversation: Conversation;

  if (conversationId) {
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("agency_id", agency.id)
      .maybeSingle();
    if (!existingConversation) {
      return json({ error: "Conversation not found" }, 404);
    }
    conversation = existingConversation;

    const { data: existingLead } = await supabase
      .from("leads")
      .select("*")
      .eq("id", conversation.lead_id)
      .eq("agency_id", agency.id)
      .maybeSingle();
    if (!existingLead) return json({ error: "Lead not found" }, 404);
    lead = existingLead;
  } else {
    if (propertyId) {
      const { data: property } = await supabase
        .from("properties")
        .select("id")
        .eq("id", propertyId)
        .eq("agency_id", agency.id)
        .maybeSingle();
      if (!property) return json({ error: "Unknown property" }, 404);
    }

    const { data: createdLead, error: leadError } = await supabase
      .from("leads")
      .insert({
        agency_id: agency.id,
        property_id: propertyId ?? null,
        first_name: leadInput?.firstName ?? null,
        email: leadInput?.email ?? null,
        phone: leadInput?.phone ?? null,
        source: "website",
      })
      .select()
      .single();
    if (leadError || !createdLead) {
      return json({ error: leadError?.message ?? "Failed to create lead" }, 500);
    }
    lead = createdLead;
    conversation = await getOrCreateConversation(supabase, agency.id, lead.id, propertyId ?? null);
  }

  try {
    const result = await runConversationTurn({
      supabase,
      agency,
      lead,
      conversation,
      aiSettingsRow,
      content: message,
    });

    return json({
      conversationId: conversation.id,
      leadId: lead.id,
      reply: result.reply,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed to process message" }, 502);
  }
}
