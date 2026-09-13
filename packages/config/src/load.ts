import { canSubmitLiveOrders } from "@polymarket-bot/shared";
import { ConfigError } from "./errors.js";
import { parseBoolean, parseMode, parseNodeEnv } from "./parse.js";
import type { AppConfig, EnvSource, PublicConfig } from "./types.js";

export function loadConfig(env: EnvSource = process.env): AppConfig {
  const nodeEnv = parseNodeEnv(env.NODE_ENV);
  const mode = parseMode(env.POLYMARKET_BOT_MODE);
  const liveTradingEnabled = parseBoolean(
    env.POLYMARKET_BOT_LIVE_TRADING_ENABLED,
    false,
  );

  if (nodeEnv === "test" && (mode === "live" || liveTradingEnabled)) {
    throw new ConfigError(
      "Live trading cannot be enabled while NODE_ENV=test.",
    );
  }

  if (liveTradingEnabled && mode !== "live") {
    throw new ConfigError(
      "POLYMARKET_BOT_LIVE_TRADING_ENABLED=true requires POLYMARKET_BOT_MODE=live.",
    );
  }

  if (mode === "live" && !liveTradingEnabled) {
    throw new ConfigError(
      "POLYMARKET_BOT_MODE=live requires POLYMARKET_BOT_LIVE_TRADING_ENABLED=true.",
    );
  }

  return { mode, liveTradingEnabled, nodeEnv };
}

export function toPublicConfig(config: AppConfig): PublicConfig {
  return {
    mode: config.mode,
    liveTradingEnabled: config.liveTradingEnabled,
    nodeEnv: config.nodeEnv,
    canSubmitLiveOrders: canSubmitLiveOrders(),
  };
}

export function assertNonLive(config: AppConfig): void {
  if (config.mode === "live" || config.liveTradingEnabled) {
    throw new ConfigError(
      "Live trading configuration is not authorized for this process.",
    );
  }
}
