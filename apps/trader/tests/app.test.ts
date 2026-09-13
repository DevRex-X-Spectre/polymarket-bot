import { describe, expect, it } from "vitest";
import { loadConfig } from "@polymarket-bot/config";
import { FailClosedError } from "@polymarket-bot/shared";
import { startTrader } from "../src/app.js";
import { run } from "../src/main.js";

describe("trader app", () => {
  it("starts in research mode without credentials", () => {
    const result = startTrader(loadConfig({ NODE_ENV: "development" }));
    expect(result).toEqual({
      mode: "research",
      status: "started",
      liveOrderSubmission: false,
    });
  });

  it("starts in paper mode without submitting live orders", () => {
    const result = startTrader(
      loadConfig({ POLYMARKET_BOT_MODE: "paper", NODE_ENV: "development" }),
    );
    expect(result.mode).toBe("paper");
    expect(result.liveOrderSubmission).toBe(false);
  });

  it("refuses to start when live flags are set", () => {
    const config = loadConfig({
      POLYMARKET_BOT_MODE: "live",
      POLYMARKET_BOT_LIVE_TRADING_ENABLED: "true",
      NODE_ENV: "production",
    });
    expect(() => startTrader(config)).toThrow(FailClosedError);
  });

  it("run() boots from empty env", () => {
    const result = run({ NODE_ENV: "development" });
    expect(result.ok).toBe(true);
    expect(result.mode).toBe("research");
  });
});
