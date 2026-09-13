import type { DiscoveredMarket } from "./identity.js";

export const MARKET_FAMILY_VALIDATION_STATUSES = [
  "compatible",
  "incompatible",
  "unknown",
] as const;

export type MarketFamilyValidationStatus =
  (typeof MARKET_FAMILY_VALIDATION_STATUSES)[number];

export const MARKET_RELATIONSHIPS = [
  "same-contract",
  "distinct-contract",
] as const;

export type MarketRelationship = (typeof MARKET_RELATIONSHIPS)[number];

export const MARKET_FAMILY_FIELD_STATUSES = [
  "match",
  "mismatch",
  "unknown",
] as const;

export type MarketFamilyFieldStatus =
  (typeof MARKET_FAMILY_FIELD_STATUSES)[number];

export interface MarketFamilyFacts {
  readonly underlying: string | null;
  readonly referenceAsset: string | null;
}

export interface MarketFamilyCandidate {
  readonly market: Pick<
    DiscoveredMarket,
    "identity" | "event" | "resolution"
  >;
  readonly facts: MarketFamilyFacts;
}

export interface MarketFamilyValidationOptions {
  readonly relationship: MarketRelationship;
  readonly requireSameEvent?: boolean;
}

export interface MarketFamilyValidation {
  readonly status: MarketFamilyValidationStatus;
  readonly relationship: MarketFamilyFieldStatus;
  readonly eventIdentity: MarketFamilyFieldStatus;
  readonly underlying: MarketFamilyFieldStatus;
  readonly referenceAsset: MarketFamilyFieldStatus;
  readonly resolutionMechanism: MarketFamilyFieldStatus;
  readonly resolutionSource: MarketFamilyFieldStatus;
  readonly resolutionCondition: MarketFamilyFieldStatus;
  readonly resolutionTimestamp: MarketFamilyFieldStatus;
  readonly outcomeSemantics: MarketFamilyFieldStatus;
  readonly reasons: readonly string[];
}

export function validateMarketFamily(
  left: MarketFamilyCandidate,
  right: MarketFamilyCandidate,
  options: MarketFamilyValidationOptions,
): MarketFamilyValidation {
  const relationship = compareRelationship(
    left.market.identity.conditionId,
    right.market.identity.conditionId,
    options.relationship,
  );
  const eventIdentity = options.requireSameEvent === false
    ? "match"
    : compareValue(eventId(left.market), eventId(right.market));
  const underlying = compareValue(
    left.facts.underlying,
    right.facts.underlying,
  );
  const referenceAsset = compareValue(
    left.facts.referenceAsset,
    right.facts.referenceAsset,
  );
  const resolutionMechanism = compareComposite(
    left.market.resolution.resolvedBy,
    left.market.resolution.questionId,
    right.market.resolution.resolvedBy,
    right.market.resolution.questionId,
  );
  const resolutionSource = compareValue(
    left.market.resolution.statedSource,
    right.market.resolution.statedSource,
  );
  const resolutionCondition = compareValue(
    left.market.resolution.observedRuleText,
    right.market.resolution.observedRuleText,
  );
  const resolutionTimestamp = compareTimestamp(
    left.market.resolution.endDate,
    right.market.resolution.endDate,
  );
  const outcomeSemantics = compareComposite(
    left.market.resolution.yesDeterminedByLabel,
    left.market.resolution.noDeterminedByLabel,
    right.market.resolution.yesDeterminedByLabel,
    right.market.resolution.noDeterminedByLabel,
  );

  const checks = {
    relationship,
    eventIdentity,
    underlying,
    referenceAsset,
    resolutionMechanism,
    resolutionSource,
    resolutionCondition,
    resolutionTimestamp,
    outcomeSemantics,
  };
  const statuses = Object.values(checks);
  const status = statuses.includes("mismatch")
    ? "incompatible"
    : statuses.includes("unknown")
      ? "unknown"
      : "compatible";

  return {
    status,
    ...checks,
    reasons: buildReasons(checks, options),
  };
}

function eventId(market: MarketFamilyCandidate["market"]): string | null {
  const identityEventId = market.identity.eventId;
  const eventEventId = market.event?.eventId ?? null;
  if (
    identityEventId !== null &&
    eventEventId !== null &&
    identityEventId !== eventEventId
  ) {
    return null;
  }
  return identityEventId ?? eventEventId;
}

function compareRelationship(
  left: string | null,
  right: string | null,
  expected: MarketRelationship,
): MarketFamilyFieldStatus {
  if (left === null || right === null) {
    return "unknown";
  }
  const actual: MarketRelationship = left === right
    ? "same-contract"
    : "distinct-contract";
  return actual === expected ? "match" : "mismatch";
}

function compareValue(
  left: string | null,
  right: string | null,
): MarketFamilyFieldStatus {
  if (left === null || right === null) {
    return "unknown";
  }
  return left === right ? "match" : "mismatch";
}

function compareComposite(
  leftFirst: string | null,
  leftSecond: string | null,
  rightFirst: string | null,
  rightSecond: string | null,
): MarketFamilyFieldStatus {
  if (
    leftFirst === null ||
    leftSecond === null ||
    rightFirst === null ||
    rightSecond === null
  ) {
    return "unknown";
  }
  return leftFirst === rightFirst && leftSecond === rightSecond
    ? "match"
    : "mismatch";
}

function compareTimestamp(
  left: string | null,
  right: string | null,
): MarketFamilyFieldStatus {
  if (left === null || right === null) {
    return "unknown";
  }
  const leftTimestamp = Date.parse(left);
  const rightTimestamp = Date.parse(right);
  if (Number.isNaN(leftTimestamp) || Number.isNaN(rightTimestamp)) {
    return "unknown";
  }
  return leftTimestamp === rightTimestamp ? "match" : "mismatch";
}

function buildReasons(
  checks: Omit<MarketFamilyValidation, "status" | "reasons">,
  options: MarketFamilyValidationOptions,
): readonly string[] {
  return Object.entries(checks)
    .filter(([, status]) => status !== "match")
    .map(([field, status]) => {
      if (field === "relationship") {
        return status === "mismatch"
          ? `Markets do not have the requested ${options.relationship} relationship.`
          : "Market relationship cannot be established without both condition ids.";
      }
      if (field === "eventIdentity" && options.requireSameEvent === false) {
        return "";
      }
      return status === "mismatch"
        ? `${field} differs between markets.`
        : `${field} is unknown for at least one market.`;
    })
    .filter((reason) => reason.length > 0);
}
