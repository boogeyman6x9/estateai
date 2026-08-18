import type { LeadTemperature } from "@/types/domain";
import type { QualificationExtraction, ScoringFactors, ScoringResult } from "./types";

/**
 * Point values per factor. Deliberately exported and named so this can be made
 * configurable per-agency later (spec: "make scoring rules configurable later")
 * without touching the scoring logic itself.
 */
export const SCORING_WEIGHTS = {
  purchaseIntent: 20,
  financePreApproved: 20,
  inspectionRequested: 20,
  budgetProvided: 10,
  timelineUnder30Days: 15,
  respondingActively: 10,
  propertyMatch: 5,
} as const satisfies Record<keyof ScoringFactors, number>;

export function scoreToTemperature(score: number): LeadTemperature {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

export interface ScoreLeadInput {
  qualification: Partial<QualificationExtraction>;
  messageCount: number;
  hasMatchingProperty: boolean;
  purposeStated: boolean;
}

/**
 * Pure function: same inputs always produce the same score, so agencies can
 * trust and audit it. Called after every qualification update — see
 * lib/ai/qualification.ts — and the result is written to lead_score_history.
 */
export function scoreLead(input: ScoreLeadInput): ScoringResult {
  const { qualification, messageCount, hasMatchingProperty, purposeStated } = input;

  const timelineUnder30Days =
    !!qualification.purchaseTimeline &&
    /\b(0|[1-9]|[12]\d|30)\s*day|within\s*(a\s*)?month|asap|immediately/i.test(
      qualification.purchaseTimeline
    );

  const factors: ScoringFactors = {
    purchaseIntent: purposeStated,
    financePreApproved: qualification.financeStatus === "pre_approved" || qualification.financeStatus === "cash_buyer",
    inspectionRequested: !!qualification.wantsInspection,
    budgetProvided: !!(qualification.budgetMin || qualification.budgetMax),
    timelineUnder30Days,
    respondingActively: messageCount >= 3,
    propertyMatch: hasMatchingProperty,
  };

  let score = 0;
  for (const key of Object.keys(factors) as (keyof ScoringFactors)[]) {
    if (factors[key]) score += SCORING_WEIGHTS[key];
  }
  score = Math.min(100, score);

  return { score, temperature: scoreToTemperature(score), factors };
}
