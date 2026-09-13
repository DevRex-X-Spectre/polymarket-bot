import { FailClosedError } from "./errors.js";

/**
 * Hard safety flag. Must remain false until live execution is implemented
 * AND human authorization is recorded in project state.
 */
export const LIVE_ORDER_SUBMISSION_IMPLEMENTED = false as const;

export function assertLiveOrdersUnavailable(): void {
  if (LIVE_ORDER_SUBMISSION_IMPLEMENTED) {
    throw new FailClosedError(
      "LIVE_ORDER_SUBMISSION_IMPLEMENTED is true without an authorized live execution path",
      "LIVE_FLAG_INVALID",
    );
  }
}

export function canSubmitLiveOrders(): false {
  assertLiveOrdersUnavailable();
  return false;
}
