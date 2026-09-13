import { describe, expect, it } from "vitest";
import {
  LIVE_ORDER_SUBMISSION_IMPLEMENTED,
  assertLiveOrdersUnavailable,
  canSubmitLiveOrders,
} from "../src/safety.js";

describe("live-order safety flag", () => {
  it("is false in this build", () => {
    expect(LIVE_ORDER_SUBMISSION_IMPLEMENTED).toBe(false);
    expect(canSubmitLiveOrders()).toBe(false);
    expect(() => assertLiveOrdersUnavailable()).not.toThrow();
  });
});
