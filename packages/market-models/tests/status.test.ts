import { describe, expect, it } from "vitest";
import {
  classifyGammaMarketStatus,
  isDiscoveredAsTradable,
  type GammaMarketFlags,
} from "../src/status.js";

const empty: GammaMarketFlags = {
  active: null,
  closed: null,
  archived: null,
  acceptingOrders: null,
  enableOrderBook: null,
  negRisk: null,
};

describe("classifyGammaMarketStatus", () => {
  it("keeps unknown when no flags are present", () => {
    expect(classifyGammaMarketStatus(empty)).toBe("unknown");
  });

  it("classifies an active unclosed market as open", () => {
    expect(
      classifyGammaMarketStatus({
        ...empty,
        active: true,
        closed: false,
        acceptingOrders: true,
      }),
    ).toBe("open");
  });

  it("classifies closed markets as closed, not resolved", () => {
    expect(
      classifyGammaMarketStatus({
        ...empty,
        active: false,
        closed: true,
      }),
    ).toBe("closed");
  });

  it("classifies archived markets as closed", () => {
    expect(
      classifyGammaMarketStatus({
        ...empty,
        archived: true,
        active: true,
        closed: false,
      }),
    ).toBe("closed");
  });

  it("classifies inactive when active is false and not closed", () => {
    expect(
      classifyGammaMarketStatus({
        ...empty,
        active: false,
        closed: false,
      }),
    ).toBe("inactive");
  });

  it("does not treat discovery as tradability", () => {
    expect(isDiscoveredAsTradable("open")).toBe(false);
    expect(isDiscoveredAsTradable("closed")).toBe(false);
    expect(isDiscoveredAsTradable("unknown")).toBe(false);
  });
});
