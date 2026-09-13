export const MARKET_LIFECYCLE_STATUSES = [
  "open",
  "closed",
  "inactive",
  "unknown",
] as const;

export type MarketLifecycleStatus = (typeof MARKET_LIFECYCLE_STATUSES)[number];

/**
 * Gamma-reported operational flags. Null means the source did not provide the
 * field. These are not CLOB tradability and do not imply executable edge.
 */
export interface GammaMarketFlags {
  readonly active: boolean | null;
  readonly closed: boolean | null;
  readonly archived: boolean | null;
  readonly acceptingOrders: boolean | null;
  readonly enableOrderBook: boolean | null;
  readonly negRisk: boolean | null;
}

/**
 * Map Gamma flags to an internal lifecycle status.
 *
 * Gamma `closed` includes both resolved and otherwise-closed markets. A
 * distinct `resolved` status is reserved for resolution extraction (TODO-010)
 * and is not inferred here.
 */
export function classifyGammaMarketStatus(
  flags: GammaMarketFlags,
): MarketLifecycleStatus {
  const hasAnyFlag =
    flags.active !== null ||
    flags.closed !== null ||
    flags.archived !== null ||
    flags.acceptingOrders !== null ||
    flags.enableOrderBook !== null;

  if (!hasAnyFlag) {
    return "unknown";
  }

  if (flags.closed === true || flags.archived === true) {
    return "closed";
  }

  if (flags.active === true && flags.closed === false) {
    return "open";
  }

  if (flags.active === false) {
    return "inactive";
  }

  if (flags.acceptingOrders === false) {
    return "inactive";
  }

  return "unknown";
}

/**
 * Discovery is not tradability. A market is not executable merely because it
 * was returned by Gamma.
 */
export function isDiscoveredAsTradable(_status: MarketLifecycleStatus): false {
  return false;
}
