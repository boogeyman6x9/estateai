import { getAIProvider } from "./provider";
import type { ConversationMessage, QualificationExtraction } from "./types";

const QUALIFICATION_SYSTEM_PROMPT = `You extract structured lead-qualification data from a real-estate sales conversation.
Only extract information the lead has explicitly stated or clearly implied — never guess or infer numbers that weren't mentioned.
If a field was not discussed, use null (or an empty array for list fields).

Return a JSON object with exactly these keys:
{
  "leadType": "buyer" | "renter" | "investor" | "seller" | "landlord" | "general" | null,
  "budgetMin": number | null,
  "budgetMax": number | null,
  "preferredSuburbs": string[],
  "bedroomsRequired": number | null,
  "financeStatus": "unknown" | "not_started" | "in_progress" | "pre_approved" | "cash_buyer",
  "purchaseTimeline": string | null,
  "purpose": "owner_occupier" | "investment" | "unknown",
  "wantsInspection": boolean
}`;

/**
 * Runs after each lead message to keep the lead's structured fields (budget,
 * suburb, timeline, etc.) up to date from natural conversation — spec section 16:
 * "Do NOT interrogate the user with a giant questionnaire."
 */
export async function extractQualification(
  history: ConversationMessage[]
): Promise<QualificationExtraction> {
  const provider = getAIProvider();

  const transcript = history
    .filter((m) => m.role === "lead" || m.role === "ai")
    .map((m) => `${m.role === "lead" ? "Lead" : "Assistant"}: ${m.content}`)
    .join("\n");

  return provider.completeJSON<QualificationExtraction>({
    system: QUALIFICATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: transcript }],
    maxTokens: 500,
    temperature: 0,
  });
}
