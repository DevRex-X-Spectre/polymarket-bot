import type { Market } from "@polymarket/client";
import { describe, expect, it } from "vitest";
import { isCompleteMarketIdentity } from "@polymarket-bot/market-models";
import { normalizeEvent, normalizeMarket } from "../src/normalize.js";
import { OBSERVED_AT, eventFixture, marketFixture } from "./fixtures.js";

describe("normalizeMarket", () => {
  it("preserves Polymarket identifiers and does not invent tradability", () => {
    const discovered = normalizeMarket(marketFixture(), OBSERVED_AT);
    expect(discovered).not.toBeNull();
    expect(discovered?.identity.marketId).toBe("703257");
    expect(discovered?.identity.eventId).toBe("90177");
    expect(discovered?.identity.conditionId).toContain("0x747dc809");
    expect(discovered?.identity.yesTokenId).toBeTruthy();
    expect(discovered?.identity.noTokenId).toBeTruthy();
    expect(discovered?.identity.slug).toContain("aliens");
    expect(discovered?.status).toBe("open");
    expect(discovered?.source).toBe("gamma");
    expect(discovered?.observedAt).toBe(OBSERVED_AT);
    expect(discovered?.observedResolution.source).toBe(
      "Official confirmation",
    );
    expect(isCompleteMarketIdentity(discovered!.identity)).toBe(true);
  });

  it("keeps missing identifiers unknown instead of substituting", () => {
    const discovered = normalizeMarket(
      marketFixture({
        conditionId: null,
        outcomes: {
          yes: { label: "Yes", tokenId: null, positionId: null, price: null },
          no: { label: "No", tokenId: null, positionId: null, price: null },
        },
        events: [],
        tags: [],
        resolution: {
          questionId: null,
          negRiskRequestId: null,
          umaResolutionStatus: null,
          source: null,
          resolvedBy: null,
        },
      }),
      OBSERVED_AT,
    );
    expect(discovered?.identity.conditionId).toBeNull();
    expect(discovered?.identity.yesTokenId).toBeNull();
    expect(discovered?.identity.noTokenId).toBeNull();
    expect(discovered?.identity.eventId).toBeNull();
    expect(discovered?.event).toBeNull();
    expect(discovered?.observedResolution.source).toBeNull();
    expect(isCompleteMarketIdentity(discovered!.identity)).toBe(false);
  });

  it("classifies closed Gamma markets as closed, not resolved", () => {
    const discovered = normalizeMarket(
      marketFixture({
        state: { active: false, closed: true, archived: false },
      }),
      OBSERVED_AT,
    );
    expect(discovered?.status).toBe("closed");
  });

  it("drops markets that lack a market id", () => {
    const discovered = normalizeMarket(
      marketFixture({ id: "" as Market["id"] }),
      OBSERVED_AT,
    );
    expect(discovered).toBeNull();
  });
});

describe("normalizeEvent", () => {
  it("attaches nested markets to the parent event identity", () => {
    const discovered = normalizeEvent(eventFixture(), OBSERVED_AT);
    expect(discovered?.identity.eventId).toBe("90177");
    expect(discovered?.markets).toHaveLength(1);
    expect(discovered?.markets[0]?.identity.eventId).toBe("90177");
    expect(discovered?.tags[0]?.slug).toBe("science");
  });
});
