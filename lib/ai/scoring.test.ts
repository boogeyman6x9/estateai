import { describe, expect, it } from "vitest";

import { SCORING_WEIGHTS, scoreLead, scoreToTemperature } from "./scoring";
import type { ScoreLeadInput } from "./scoring";

const baseInput: ScoreLeadInput = {
  qualification: {},
  messageCount: 0,
  hasMatchingProperty: false,
  purposeStated: false,
};

describe("scoreToTemperature", () => {
  it("classifies 80+ as hot", () => {
    expect(scoreToTemperature(80)).toBe("hot");
    expect(scoreToTemperature(100)).toBe("hot");
  });

  it("classifies 50-79 as warm", () => {
    expect(scoreToTemperature(79)).toBe("warm");
    expect(scoreToTemperature(50)).toBe("warm");
  });

  it("classifies below 50 as cold", () => {
    expect(scoreToTemperature(49)).toBe("cold");
    expect(scoreToTemperature(0)).toBe("cold");
  });
});

describe("scoreLead", () => {
  it("scores 0 and cold when nothing is known", () => {
    const result = scoreLead(baseInput);
    expect(result.score).toBe(0);
    expect(result.temperature).toBe("cold");
    expect(result.factors).toEqual({
      purchaseIntent: false,
      financePreApproved: false,
      inspectionRequested: false,
      budgetProvided: false,
      timelineUnder30Days: false,
      respondingActively: false,
      propertyMatch: false,
    });
  });

  it("scores exactly 100 (weights sum to 100) when every factor is true", () => {
    const result = scoreLead({
      qualification: {
        financeStatus: "pre_approved",
        wantsInspection: true,
        budgetMin: 500000,
        purchaseTimeline: "Within 30 days",
      },
      messageCount: 5,
      hasMatchingProperty: true,
      purposeStated: true,
    });
    expect(Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
    expect(result.score).toBe(100);
    expect(result.temperature).toBe("hot");
  });

  it("accepts cash_buyer as equivalent to pre_approved for finance points", () => {
    const result = scoreLead({
      ...baseInput,
      qualification: { financeStatus: "cash_buyer" },
    });
    expect(result.factors.financePreApproved).toBe(true);
    expect(result.score).toBe(SCORING_WEIGHTS.financePreApproved);
  });

  it("does not award finance points for in_progress or not_started", () => {
    for (const status of ["in_progress", "not_started", "unknown"] as const) {
      const result = scoreLead({ ...baseInput, qualification: { financeStatus: status } });
      expect(result.factors.financePreApproved).toBe(false);
    }
  });

  it("awards budget points when either bound is provided", () => {
    expect(
      scoreLead({ ...baseInput, qualification: { budgetMin: 400000 } }).factors.budgetProvided
    ).toBe(true);
    expect(
      scoreLead({ ...baseInput, qualification: { budgetMax: 900000 } }).factors.budgetProvided
    ).toBe(true);
    expect(scoreLead(baseInput).factors.budgetProvided).toBe(false);
  });

  it("requires at least 3 messages for the responding-actively factor", () => {
    expect(scoreLead({ ...baseInput, messageCount: 2 }).factors.respondingActively).toBe(false);
    expect(scoreLead({ ...baseInput, messageCount: 3 }).factors.respondingActively).toBe(true);
  });

  describe("timelineUnder30Days detection", () => {
    const grounded = (purchaseTimeline: string) =>
      scoreLead({ ...baseInput, qualification: { purchaseTimeline } }).factors
        .timelineUnder30Days;

    it("matches explicit day counts up to 30", () => {
      expect(grounded("Within 30 days")).toBe(true);
      expect(grounded("15 days")).toBe(true);
      expect(grounded("moving in 7 days")).toBe(true);
    });

    it("matches asap/immediately/within a month phrasing", () => {
      expect(grounded("ASAP")).toBe(true);
      expect(grounded("Immediately")).toBe(true);
      expect(grounded("within a month")).toBe(true);
      expect(grounded("within month")).toBe(true);
    });

    it("does not match longer or vague timelines", () => {
      expect(grounded("3-6 months")).toBe(false);
      expect(grounded("Just researching")).toBe(false);
      expect(grounded("1-3 months")).toBe(false);
    });

    it("is false when no timeline was given at all", () => {
      expect(scoreLead(baseInput).factors.timelineUnder30Days).toBe(false);
    });
  });

  it("caps the score at 100 even if called with a hypothetically inflated input", () => {
    // Defensive: weights currently sum to exactly 100, but the cap should hold
    // regardless of future weight tuning.
    const result = scoreLead({
      qualification: {
        financeStatus: "cash_buyer",
        wantsInspection: true,
        budgetMin: 1,
        budgetMax: 2,
        purchaseTimeline: "asap",
      },
      messageCount: 100,
      hasMatchingProperty: true,
      purposeStated: true,
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("is a pure function — same input always produces the same output", () => {
    const input: ScoreLeadInput = {
      qualification: { financeStatus: "pre_approved", purchaseTimeline: "10 days" },
      messageCount: 4,
      hasMatchingProperty: false,
      purposeStated: true,
    };
    const a = scoreLead(input);
    const b = scoreLead(input);
    expect(a).toEqual(b);
  });
});
