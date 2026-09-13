import type { MarketResolutionMetadata } from "./resolution.js";
import type { GammaMarketFlags, MarketLifecycleStatus } from "./status.js";

export const DISCOVERY_SOURCE_GAMMA = "gamma" as const;

export type DiscoverySource = typeof DISCOVERY_SOURCE_GAMMA;

export interface MarketIdentity {
  readonly marketId: string;
  readonly conditionId: string | null;
  readonly slug: string | null;
  readonly eventId: string | null;
  readonly yesTokenId: string | null;
  readonly noTokenId: string | null;
}

export interface EventIdentity {
  readonly eventId: string;
  readonly slug: string | null;
  readonly title: string | null;
}

export interface OutcomeIdentity {
  readonly side: "yes" | "no";
  readonly label: string | null;
  readonly tokenId: string | null;
}

export interface TagIdentity {
  readonly id: string | null;
  readonly slug: string | null;
  readonly label: string | null;
}

export interface MarketTiming {
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly closedTime: string | null;
}

/**
 * Resolution fields copied from Gamma/SDK without interpretation.
 */
export interface ObservedResolution {
  readonly source: string | null;
  readonly resolvedBy: string | null;
  readonly questionId: string | null;
  readonly umaResolutionStatus: string | null;
}

export interface EventObservedResolution {
  readonly source: string | null;
  readonly automaticallyResolved: boolean | null;
  readonly description: string | null;
}

export interface DiscoveredMarket {
  readonly identity: MarketIdentity;
  readonly event: EventIdentity | null;
  readonly question: string | null;
  readonly description: string | null;
  readonly category: string | null;
  readonly status: MarketLifecycleStatus;
  readonly gammaFlags: GammaMarketFlags;
  readonly timing: MarketTiming;
  readonly outcomes: {
    readonly yes: OutcomeIdentity;
    readonly no: OutcomeIdentity;
  };
  readonly tags: readonly TagIdentity[];
  readonly observedResolution: ObservedResolution;
  readonly resolution: MarketResolutionMetadata;
  readonly source: DiscoverySource;
  readonly observedAt: string;
}

export interface DiscoveredEvent {
  readonly identity: EventIdentity;
  readonly markets: readonly DiscoveredMarket[];
  readonly tags: readonly TagIdentity[];
  readonly observedResolution: EventObservedResolution;
  readonly source: DiscoverySource;
  readonly observedAt: string;
}

export interface DiscoveryPage<T> {
  readonly items: readonly T[];
  readonly droppedCount: number;
  readonly hasMore: boolean;
  readonly nextCursor: string | null;
  readonly observedAt: string;
}

export function isCompleteMarketIdentity(identity: MarketIdentity): boolean {
  return (
    identity.marketId.length > 0 &&
    identity.conditionId !== null &&
    identity.yesTokenId !== null &&
    identity.noTokenId !== null
  );
}
