import { describe, expect, it } from "vitest";
import { isCompleteMarketIdentity, type MarketIdentity } from "../src/identity.js";

describe("isCompleteMarketIdentity", () => {
  it("requires market, condition, and both token ids", () => {
    const partial: MarketIdentity = {
      marketId: "703257",
      conditionId: null,
      slug: "example",
      eventId: "90177",
      yesTokenId: null,
      noTokenId: null,
    };
    expect(isCompleteMarketIdentity(partial)).toBe(false);
  });

  it("accepts a fully identified market", () => {
    const complete: MarketIdentity = {
      marketId: "703257",
      conditionId: "0xabc",
      slug: "example",
      eventId: "90177",
      yesTokenId: "1",
      noTokenId: "2",
    };
    expect(isCompleteMarketIdentity(complete)).toBe(true);
  });

  it("does not treat slug as sufficient identity", () => {
    const bySlugOnly: MarketIdentity = {
      marketId: "",
      conditionId: null,
      slug: "bitcoin-up-or-down",
      eventId: null,
      yesTokenId: null,
      noTokenId: null,
    };
    expect(isCompleteMarketIdentity(bySlugOnly)).toBe(false);
  });
});
