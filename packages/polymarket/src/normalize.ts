import type { Event, Market, Tag } from "@polymarket/client";
import {
  DISCOVERY_SOURCE_GAMMA,
  classifyGammaMarketStatus,
  extractMarketResolution,
  type DiscoveredEvent,
  type DiscoveredMarket,
  type EventIdentity,
  type EventObservedResolution,
  type GammaMarketFlags,
  type ObservedResolution,
  type TagIdentity,
} from "@polymarket-bot/market-models";
import { asBoolean, asOptionalString } from "./values.js";

export function normalizeMarket(
  market: Market,
  observedAt: string,
  parentEvent: EventIdentity | null = null,
  eventResolutionHint: EventObservedResolution | null = null,
): DiscoveredMarket | null {
  const marketId = asOptionalString(market.id);
  if (marketId === null) {
    return null;
  }

  const event = parentEvent ?? firstEventIdentity(market);
  const flags = gammaFlags(market);
  const yes = market.outcomes?.yes;
  const no = market.outcomes?.no;
  const identity = {
    marketId,
    conditionId: asOptionalString(market.conditionId),
    slug: asOptionalString(market.slug),
    eventId: event?.eventId ?? null,
    yesTokenId: asOptionalString(yes?.tokenId),
    noTokenId: asOptionalString(no?.tokenId),
  };
  const observedResolution = observedResolutionFromMarket(market);
  const timing = {
    startDate: asOptionalString(market.state?.startDate),
    endDate: asOptionalString(market.state?.endDate),
    closedTime: asOptionalString(market.state?.closedTime),
  };
  const outcomes = {
    yes: {
      side: "yes" as const,
      label: asOptionalString(yes?.label),
      tokenId: asOptionalString(yes?.tokenId),
    },
    no: {
      side: "no" as const,
      label: asOptionalString(no?.label),
      tokenId: asOptionalString(no?.tokenId),
    },
  };
  const question = asOptionalString(market.question);
  const description = asOptionalString(market.description);

  return {
    identity,
    event,
    question,
    description,
    category: asOptionalString(market.category),
    status: classifyGammaMarketStatus(flags),
    gammaFlags: flags,
    timing,
    outcomes,
    tags: (market.tags ?? []).map(normalizeTag),
    observedResolution,
    resolution: extractMarketResolution({
      identity,
      question,
      description,
      observedResolution,
      outcomes,
      timing,
      eventObservedResolution: eventResolutionHint,
      extractedAt: observedAt,
    }),
    source: DISCOVERY_SOURCE_GAMMA,
    observedAt,
  };
}

export function normalizeEvent(
  event: Event,
  observedAt: string,
): DiscoveredEvent | null {
  const identity = eventIdentity(event);
  if (identity === null) {
    return null;
  }

  const observedResolution: EventObservedResolution = {
    source: asOptionalString(event.resolution?.source),
    automaticallyResolved: asBoolean(event.resolution?.automaticallyResolved),
    description: asOptionalString(event.description),
  };

  const markets: DiscoveredMarket[] = [];
  for (const market of event.markets ?? []) {
    const normalized = normalizeMarket(
      market,
      observedAt,
      identity,
      observedResolution,
    );
    if (normalized !== null) {
      markets.push(normalized);
    }
  }

  return {
    identity,
    markets,
    tags: (event.tags ?? []).map(normalizeTag),
    observedResolution,
    source: DISCOVERY_SOURCE_GAMMA,
    observedAt,
  };
}

export function normalizeTag(tag: {
  id?: unknown;
  slug?: string | null;
  label?: string | null;
}): TagIdentity {
  return {
    id: asOptionalString(tag.id),
    slug: asOptionalString(tag.slug),
    label: asOptionalString(tag.label),
  };
}

export function normalizeSdkTag(tag: Tag): TagIdentity {
  return normalizeTag(tag);
}

function eventIdentity(event: Event): EventIdentity | null {
  const eventId = asOptionalString(event.id);
  if (eventId === null) {
    return null;
  }
  return {
    eventId,
    slug: asOptionalString(event.slug),
    title: asOptionalString(event.title),
  };
}

function firstEventIdentity(market: Market): EventIdentity | null {
  const first = market.events?.[0];
  if (!first) {
    return null;
  }
  const eventId = asOptionalString(first.id);
  if (eventId === null) {
    return null;
  }
  return {
    eventId,
    slug: asOptionalString(first.slug),
    title: asOptionalString(first.title),
  };
}

function gammaFlags(market: Market): GammaMarketFlags {
  const state = market.state;
  return {
    active: asBoolean(state?.active),
    closed: asBoolean(state?.closed),
    archived: asBoolean(state?.archived),
    acceptingOrders: asBoolean(state?.acceptingOrders),
    enableOrderBook: asBoolean(state?.enableOrderBook),
    negRisk: asBoolean(state?.negRisk),
  };
}

function observedResolutionFromMarket(market: Market): ObservedResolution {
  const resolution = market.resolution;
  return {
    source: asOptionalString(resolution?.source),
    resolvedBy: asOptionalString(resolution?.resolvedBy),
    questionId: asOptionalString(resolution?.questionId),
    umaResolutionStatus: asOptionalString(resolution?.umaResolutionStatus),
  };
}
