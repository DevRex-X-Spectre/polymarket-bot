import { describe, expect, it } from "vitest";
import { ConfigError } from "../src/errors.js";
import { loadConfig, toPublicConfig } from "../src/load.js";

describe("loadConfig", () => {
  it("defaults to research with live trading disabled", () => {
    const config = loadConfig({});
    expect(config).toEqual({
      mode: "research",
      liveTradingEnabled: false,
      nodeEnv: "development",
    });
    expect(toPublicConfig(config).canSubmitLiveOrders).toBe(false);
  });

  it("loads paper mode", () => {
    const config = loadConfig({
      POLYMARKET_BOT_MODE: "paper",
      NODE_ENV: "development",
    });
    expect(config.mode).toBe("paper");
    expect(config.liveTradingEnabled).toBe(false);
  });

  it("fails closed on unknown mode", () => {
    expect(() => loadConfig({ POLYMARKET_BOT_MODE: "prod" })).toThrow(
      ConfigError,
    );
  });

  it("fails closed on unknown NODE_ENV", () => {
    expect(() => loadConfig({ NODE_ENV: "staging" })).toThrow(ConfigError);
  });

  it("fails closed on invalid boolean", () => {
    expect(() =>
      loadConfig({ POLYMARKET_BOT_LIVE_TRADING_ENABLED: "maybe" }),
    ).toThrow(ConfigError);
  });

  it("rejects live mode without the explicit enable flag", () => {
    expect(() =>
      loadConfig({ POLYMARKET_BOT_MODE: "live", NODE_ENV: "development" }),
    ).toThrow(/LIVE_TRADING_ENABLED/);
  });

  it("rejects the enable flag unless mode is live", () => {
    expect(() =>
      loadConfig({
        POLYMARKET_BOT_MODE: "research",
        POLYMARKET_BOT_LIVE_TRADING_ENABLED: "true",
        NODE_ENV: "development",
      }),
    ).toThrow(/requires POLYMARKET_BOT_MODE=live/);
  });

  it("rejects live configuration in test", () => {
    expect(() =>
      loadConfig({
        POLYMARKET_BOT_MODE: "live",
        POLYMARKET_BOT_LIVE_TRADING_ENABLED: "true",
        NODE_ENV: "test",
      }),
    ).toThrow(/NODE_ENV=test/);
  });

  it("accepts explicit live flags outside test but still cannot submit orders", () => {
    const config = loadConfig({
      POLYMARKET_BOT_MODE: "live",
      POLYMARKET_BOT_LIVE_TRADING_ENABLED: "true",
      NODE_ENV: "production",
    });
    expect(config.mode).toBe("live");
    expect(config.liveTradingEnabled).toBe(true);
    expect(toPublicConfig(config).canSubmitLiveOrders).toBe(false);
  });
});
