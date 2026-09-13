import { describe, expect, it } from "vitest";
import {
  extractMarketResolution,
  validateMarketFamily,
  type DiscoveredMarket,
  type MarketFamilyCandidate,
  type MarketIdentity,
} from "../src/index.js";

const identity: MarketIdentity = {
  marketId: "market-a",
  conditionId: "condition-a",
  slug: "btc-up-or-down",
  eventId: "event-a",
  yesTokenId: "yes-a",
  noTokenId: "no-a",
};

function candidate(overrides: Partial<DiscoveredMarket> = {}): MarketFamilyCandidate {
  const market: DiscoveredMarket = {
    identity,
    event: { eventId: "event-a", slug: "btc-event", title: "BTC event" },
    question: "Bitcoin closes above 100,000 at noon",
    description: "Resolves YES when the stated source reports Bitcoin above 100,000 at noon.",
    category: "Crypto",
    status: "open",
    gammaFlags: {
      active: true,
      closed: false,
      archived: false,
      acceptingOrders: true,
      enableOrderBook: true,
      negRisk: false,
    },
    timing: { startDate: null, endDate: "2026-09-13T12:00:00Z", closedTime: null },
    outcomes: {
      yes: { side: "yes", label: "Yes", tokenId: "yes-a" },
      no: { side: "no", label: "No", tokenId: "no-a" },
    },
    tags: [],
    observedResolution: {
      source: "https://example.com/reference",
      resolvedBy: "uma",
      questionId: "question-a",
      umaResolutionStatus: null,
    },
    resolution: extractMarketResolution({
      identity,
      question: "Bitcoin closes above 100,000 at noon",
      description: "Resolves YES when the stated source reports Bitcoin above 100,000 at noon.",
      observedResolution: {
        source: "https://example.com/reference",
        resolvedBy: "uma",
        questionId: "question-a",
        umaResolutionStatus: null,
      },
      outcomes: {
        yes: { side: "yes", label: "Yes", tokenId: "yes-a" },
        no: { side: "no", label: "No", tokenId: "no-a" },
      },
      timing: { startDate: null, endDate: "2026-09-13T12:00:00Z", closedTime: null },
      extractedAt: "2026-09-13T10:00:00Z",
    }),
    source: "gamma",
    observedAt: "2026-09-13T10:00:00Z",
    ...overrides,
  };
  return {
    market,
    facts: { underlying: "bitcoin", referenceAsset: "BTC-USD" },
  };
}

function validate(left: MarketFamilyCandidate, right: MarketFamilyCandidate) {
  return validateMarketFamily(left, right, { relationship: "distinct-contract" });
}

describe("validateMarketFamily", () => {
  it("accepts genuinely compatible distinct contracts", () => {
    const right = candidate({
      identity: { ...identity, marketId: "market-b", conditionId: "condition-b" },
    });
    const result = validate(candidate(), right);
    expect(result.status).toBe("compatible");
    expect(result.relationship).toBe("match");
  });

  it("rejects a different required event", () => {
    const right = candidate({
      identity: { ...identity, marketId: "market-b", conditionId: "condition-b", eventId: "event-b" },
      event: { eventId: "event-b", slug: "other-event", title: "Other event" },
    });
    expect(validate(candidate(), right)).toMatchObject({
      status: "incompatible",
      eventIdentity: "mismatch",
    });
  });

  it("rejects an incompatible resolution mechanism", () => {
    const right = candidate();
    const altered = candidate({
      identity: { ...identity, marketId: "market-b", conditionId: "condition-b" },
      resolution: { ...right.market.resolution, resolvedBy: "different-mechanism" },
    });
    expect(validate(candidate(), altered)).toMatchObject({
      status: "incompatible",
      resolutionMechanism: "mismatch",
    });
  });

  it("rejects different resolution timestamps", () => {
    const right = candidate({
      identity: { ...identity, marketId: "market-b", conditionId: "condition-b" },
      resolution: { ...candidate().market.resolution, endDate: "2026-09-13T12:05:00Z" },
    });
    expect(validate(candidate(), right)).toMatchObject({
      status: "incompatible",
      resolutionTimestamp: "mismatch",
    });
  });

  it("rejects different YES/NO semantics", () => {
    const right = candidate({
      identity: { ...identity, marketId: "market-b", conditionId: "condition-b" },
      resolution: {
        ...candidate().market.resolution,
        yesDeterminedByLabel: "Above 100,000",
        noDeterminedByLabel: "At or below 100,000",
      },
    });
    expect(validate(candidate(), right)).toMatchObject({
      status: "incompatible",
      outcomeSemantics: "mismatch",
    });
  });

  it("keeps missing resolution information explicitly unknown", () => {
    const right = candidate({
      identity: { ...identity, marketId: "market-b", conditionId: "condition-b" },
      resolution: { ...candidate().market.resolution, statedSource: null },
    });
    expect(validate(candidate(), right)).toMatchObject({
      status: "unknown",
      resolutionSource: "unknown",
    });
  });

  it("rejects similar titles when authoritative metadata differs", () => {
    const right = candidate({
      identity: { ...identity, marketId: "market-b", conditionId: "condition-b", slug: "btc-up-or-down" },
      question: "Bitcoin up or down?",
      resolution: { ...candidate().market.resolution, statedSource: "https://other.example" },
    });
    expect(validate(candidate(), right)).toMatchObject({
      status: "incompatible",
      resolutionSource: "mismatch",
    });
  });

  it("does not mutate either market identity", () => {
    const left = candidate();
    const right = candidate({
      identity: { ...identity, marketId: "market-b", conditionId: "condition-b" },
    });
    const leftIdentity = { ...left.market.identity };
    const rightIdentity = { ...right.market.identity };
    validate(left, right);
    expect(left.market.identity).toEqual(leftIdentity);
    expect(right.market.identity).toEqual(rightIdentity);
  });
});
