import { getAIProvider } from "./provider";
import type { ConversationMessage, ConversationSummary, LeadContext } from "./types";

const SUMMARY_SYSTEM_PROMPT = `You write short, factual summaries of real-estate lead conversations for a busy sales agent to skim.
Only state facts that appear in the conversation or the known lead data provided — never invent numbers, names, or intentions.
Return a JSON object with exactly these keys:
{
  "headline": string,   // one short sentence, e.g. "High-intent buyer, pre-approved, wants Saturday inspection"
  "summary": string      // 2-4 sentences, third person, e.g. "Sarah is a high-intent buyer looking for a 3-bedroom home around Parramatta with a budget up to $950,000..."
}`;

/**
 * Powers the "AI summary" block on the lead detail page (spec section 13).
 */
export async function summarizeConversation(
  lead: LeadContext & { firstName: string | null },
  history: ConversationMessage[]
): Promise<ConversationSummary> {
  const provider = getAIProvider();

  const transcript = history
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const knownFacts = JSON.stringify(lead, null, 2);

  return provider.completeJSON<ConversationSummary>({
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Known lead data:\n${knownFacts}\n\nConversation:\n${transcript}`,
      },
    ],
    maxTokens: 300,
    temperature: 0.2,
  });
}
