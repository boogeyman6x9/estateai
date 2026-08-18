import { getAIProvider, type AIMessage } from "./provider";
import type { GenerateReplyInput, GenerateReplyResult, PropertyContext } from "./types";

function formatProperty(p: PropertyContext): string {
  const specs = [
    p.bedrooms != null ? `${p.bedrooms} bed` : null,
    p.bathrooms != null ? `${p.bathrooms} bath` : null,
    p.parkingSpaces != null ? `${p.parkingSpaces} car` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return [
    `- "${p.title}" in ${p.suburb} (${p.propertyType}, for ${p.listingType})`,
    p.priceDisplay ? `  Price: ${p.priceDisplay}` : null,
    specs ? `  Specs: ${specs}` : null,
    p.features.length ? `  Features: ${p.features.join(", ")}` : null,
    p.inspectionInformation ? `  Inspections: ${p.inspectionInformation}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSystemPrompt(input: GenerateReplyInput): string {
  const { agency, aiSettings, property, matchingProperties, lead } = input;

  const knownPropertyBlock = property
    ? `The lead is enquiring about this specific listing:\n${formatProperty(property)}`
    : "No specific listing is attached to this conversation yet.";

  const matchesBlock =
    matchingProperties.length > 0
      ? `Other active listings that may match the lead's stated requirements:\n${matchingProperties
          .map(formatProperty)
          .join("\n")}`
      : "No other matching listings were found in the agency's current active listings.";

  const knownLeadBlock = [
    lead.firstName ? `Name: ${lead.firstName}` : null,
    lead.leadType ? `Type: ${lead.leadType}` : null,
    lead.budgetMin || lead.budgetMax
      ? `Budget: ${lead.budgetMin ?? "?"} - ${lead.budgetMax ?? "?"}`
      : null,
    lead.preferredSuburbs.length ? `Preferred suburbs: ${lead.preferredSuburbs.join(", ")}` : null,
    lead.bedroomsRequired != null ? `Bedrooms required: ${lead.bedroomsRequired}` : null,
    lead.financeStatus ? `Finance status: ${lead.financeStatus}` : null,
    lead.purchaseTimeline ? `Timeline: ${lead.purchaseTimeline}` : null,
    lead.purpose ? `Purpose: ${lead.purpose}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are ${aiSettings.assistantName}, the AI sales assistant for ${agency.name}, a real estate agency.
Tone: ${aiSettings.personality}.

${knownPropertyBlock}

${matchesBlock}

What we already know about this lead (do not re-ask for this):
${knownLeadBlock || "Nothing yet — this is the start of the conversation."}

${aiSettings.customInstructions ? `Agency-specific instructions:\n${aiSettings.customInstructions}` : ""}

Hard rules — follow all of them:
1. Never invent property facts, prices, or availability. Only state what is given above.
2. If asked something not covered above, say you don't have that information and offer to connect them with an agent.
3. Never claim an inspection is booked — only that you can arrange one; a human/system confirms bookings.
4. Never promise anything the agency has not configured here.
5. Gather buyer/renter/investor status, budget, area, bedrooms, finance status, and timeline naturally through conversation — never as a rapid-fire questionnaire, and never re-ask what's already known.
6. Keep replies concise (2-4 sentences), warm, and professional — never robotic.
7. If the lead expresses frustration, urgency for a human, or a complex/legal question, say you'll connect them with an agent from ${agency.name}${agency.phone ? ` (${agency.phone})` : ""}.`;
}

/**
 * Generates the AI's next reply in a lead conversation, grounded strictly in
 * the agency's own data. This is the Phase 5 conversation engine described in
 * spec section 18 — wired here so the chat widget (Phase 6) can call it directly.
 */
export async function generateReply(input: GenerateReplyInput): Promise<GenerateReplyResult> {
  const provider = getAIProvider();
  const system = buildSystemPrompt(input);

  const messages: AIMessage[] = input.history
    .filter((m) => m.role === "lead" || m.role === "ai")
    .map((m) => ({
      role: m.role === "lead" ? "user" : "assistant",
      content: m.content,
    }));

  const reply = await provider.complete({ system, messages, maxTokens: 400, temperature: 0.5 });

  const escalationSignals = /human|agent|call me|speak to someone|not helpful|frustrated/i;
  const lastLeadMessage = [...input.history].reverse().find((m) => m.role === "lead");
  const shouldEscalateToAgent = !!lastLeadMessage && escalationSignals.test(lastLeadMessage.content);

  return { reply, shouldEscalateToAgent };
}
