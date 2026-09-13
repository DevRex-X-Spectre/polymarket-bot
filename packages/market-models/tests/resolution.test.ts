import { describe, expect, it } from "vitest";
import { isDiscoveredAsTradable } from "../src/status.js";
import {
  extractMarketResolution,
  isResolutionValidated,
  type ResolutionExtractionInput,
} from "../src/resolution.js";
import type { MarketIdentity } from "../src/identity.js";

const EXTRACTED_AT = "2026-09-13T12:00:00.000Z";

const identity: MarketIdentity = {
  marketId: "703257",
  conditionId: "0xabc",
  slug: "example-market",
  eventId: "90177",
  yesTokenId: "1",
  noTokenId: "2",
};

function input(
  overrides: Partial<ResolutionExtractionInput> = {},
): ResolutionExtractionInput {
  return {
    identity,
    question: "Will the US confirm that aliens exist before 2027?",
    description:
      "Resolves YES if the US government confirms that aliens exist before 2027.",
    observedResolution: {
      source: "https://www.nasa.gov",
      resolvedBy: "0x157Ce2d672854c848c9b79C49a8Cc6cc89176a49",
      questionId: "0xquestion",
      umaResolutionStatus: null,
    },
    outcomes: {
      yes: { side: "yes", label: "Yes", tokenId: "1" },
      no: { side: "no", label: "No", tokenId: "2" },
    },
    timing: {
      startDate: "2024-03-15T00:00:00Z",
      endDate: "2027-01-01T00:00:00Z",
      closedTime: null,
    },
    extractedAt: EXTRACTED_AT,
    ...overrides,
  };
}

describe("extractMarketResolution", () => {
  it("extracts stated source, rule text, and outcome labels when present", () => {
    const result = extractMarketResolution(input());
    expect(result.statedSource).toBe("https://www.nasa.gov");
    expect(result.observedRuleText).toContain("Resolves YES");
    expect(result.yesDeterminedByLabel).toBe("Yes");
    expect(result.noDeterminedByLabel).toBe("No");
    expect(result.completeness).toBe("sufficient");
    expect(isResolutionValidated(result)).toBe(true);
    expect(result.referenceAsset).toBeNull();
    expect(result.extractedAt).toBe(EXTRACTED_AT);
  });

  it("keeps resolution unknown when source and rule text are missing", () => {
    const result = extractMarketResolution(
      input({
        question: "Bitcoin up or down?",
        description: null,
        observedResolution: {
          source: null,
          resolvedBy: null,
          questionId: null,
          umaResolutionStatus: null,
        },
        outcomes: {
          yes: { side: "yes", label: null, tokenId: null },
          no: { side: "no", label: null, tokenId: null },
        },
        timing: { startDate: null, endDate: null, closedTime: null },
      }),
    );
    expect(result.completeness).toBe("unknown");
    expect(result.statedSource).toBeNull();
    expect(result.observedRuleText).toBeNull();
    expect(isResolutionValidated(result)).toBe(false);
    expect(result.notes).toContain("Title and slug were not used");
  });

  it("does not treat a title-only BTC market as Binance-resolved", () => {
    const result = extractMarketResolution(
      input({
        identity: {
          ...identity,
          slug: "btc-updown-5m",
        },
        question: "Bitcoin Up or Down - 5 minutes",
        description: null,
        observedResolution: {
          source: null,
          resolvedBy: null,
          questionId: null,
          umaResolutionStatus: null,
        },
      }),
    );
    expect(result.statedSource).toBeNull();
    expect(result.referenceAsset).toBeNull();
    expect(result.completeness).not.toBe("sufficient");
    expect(result.notes.toLowerCase()).not.toContain("binance");
  });

  it("preserves a non-Binance stated source as-is", () => {
    const result = extractMarketResolution(
      input({
        observedResolution: {
          source: "https://www.nytimes.com",
          resolvedBy: null,
          questionId: null,
          umaResolutionStatus: null,
        },
      }),
    );
    expect(result.statedSource).toBe("https://www.nytimes.com");
    expect(result.statedSource?.toLowerCase()).not.toContain("binance");
  });

  it("marks conflicting market and event sources as ambiguous", () => {
    const result = extractMarketResolution(
      input({
        eventObservedResolution: {
          source: "https://www.bbc.com",
          automaticallyResolved: null,
          description: null,
        },
      }),
    );
    expect(result.sourceConflict).toBe(true);
    expect(result.statedSource).toBeNull();
    expect(result.eventStatedSource).toBe("https://www.bbc.com");
    expect(result.sourceKnown).toBe(false);
    expect(result.notes).toContain("differ");
  });

  it("does not copy identity fields incorrectly", () => {
    const result = extractMarketResolution(input());
    expect(result.identity).toEqual(identity);
    expect(result.identity.marketId).toBe("703257");
    expect(result.identity.eventId).toBe("90177");
    expect(result.identity.conditionId).toBe("0xabc");
    expect(result.identity.yesTokenId).toBe("1");
    expect(result.identity.noTokenId).toBe("2");
    expect(result.identity.slug).toBe("example-market");
  });

  it("does not map Gamma closed into UMA resolved", () => {
    const result = extractMarketResolution(
      input({
        observedResolution: {
          source: "https://www.nasa.gov",
          resolvedBy: null,
          questionId: null,
          umaResolutionStatus: null,
        },
        timing: {
          startDate: null,
          endDate: "2027-01-01T00:00:00Z",
          closedTime: "2027-01-01T00:00:01Z",
        },
      }),
    );
    expect(result.umaIndicatesResolved).toBeNull();
    expect(result.closedTime).toBe("2027-01-01T00:00:01Z");
  });

  it("records UMA resolved/settled without inventing other statuses", () => {
    expect(
      extractMarketResolution(
        input({
          observedResolution: {
            source: "https://www.nasa.gov",
            resolvedBy: null,
            questionId: null,
            umaResolutionStatus: "resolved",
          },
        }),
      ).umaIndicatesResolved,
    ).toBe(true);
    expect(
      extractMarketResolution(
        input({
          observedResolution: {
            source: "https://www.nasa.gov",
            resolvedBy: null,
            questionId: null,
            umaResolutionStatus: "proposed",
          },
        }),
      ).umaIndicatesResolved,
    ).toBe(false);
    expect(
      extractMarketResolution(
        input({
          observedResolution: {
            source: "https://www.nasa.gov",
            resolvedBy: null,
            questionId: null,
            umaResolutionStatus: "unexpected-status",
          },
        }),
      ).umaIndicatesResolved,
    ).toBeNull();
  });

  it("fails safely on blank strings", () => {
    const result = extractMarketResolution(
      input({
        description: "   ",
        question: "",
        observedResolution: {
          source: "",
          resolvedBy: "  ",
          questionId: null,
          umaResolutionStatus: " ",
        },
        outcomes: {
          yes: { side: "yes", label: "", tokenId: "1" },
          no: { side: "no", label: "   ", tokenId: "2" },
        },
      }),
    );
    expect(result.statedSource).toBeNull();
    expect(result.observedRuleText).toBeNull();
    expect(result.resolvedBy).toBeNull();
    expect(result.umaResolutionStatus).toBeNull();
    expect(result.yesDeterminedByLabel).toBeNull();
    expect(result.noDeterminedByLabel).toBeNull();
    expect(result.completeness).toBe("partial");
  });

  it("does not mark a market executable", () => {
    const result = extractMarketResolution(input());
    expect(isResolutionValidated(result)).toBe(true);
    expect(isDiscoveredAsTradable("open")).toBe(false);
  });
});
