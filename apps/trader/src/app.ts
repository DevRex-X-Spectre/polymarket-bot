import {
  assertNonLive,
  type AppConfig,
} from "@polymarket-bot/config";
import {
  FailClosedError,
  assertLiveOrdersUnavailable,
  canSubmitLiveOrders,
  type OperatingMode,
} from "@polymarket-bot/shared";

export interface TraderStartResult {
  readonly mode: OperatingMode;
  readonly status: "started";
  readonly liveOrderSubmission: false;
}

export function startTrader(config: AppConfig): TraderStartResult {
  assertLiveOrdersUnavailable();

  if (canSubmitLiveOrders()) {
    throw new FailClosedError(
      "Live order submission is not available in this build.",
      "LIVE_UNAVAILABLE",
    );
  }

  if (config.mode === "live" || config.liveTradingEnabled) {
    throw new FailClosedError(
      "Live trading is not implemented and is not authorized. Remaining in a non-live mode.",
      "LIVE_NOT_AUTHORIZED",
    );
  }

  assertNonLive(config);

  return {
    mode: config.mode,
    status: "started",
    liveOrderSubmission: false,
  };
}
