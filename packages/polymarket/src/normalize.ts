import type { Event, Market, Tag } from "@polymarket/client";
import {
  DISCOVERY_SOURCE_GAMMA,
  classifyGammaMarketStatus,
  type DiscoveredEvent,
  type DiscoveredMarket,
  type EventIdentity,
  type GammaMarketFlags,
  type ObservedResolution,
  type TagIdentity,
} from "@polymarket-bot/market-models";
import { asBoolean, asOptionalString } from "./values.js";

export function normalizeMarket(
  market: Market,
  observedAt: string,
  parentEvent: EventIdentity | null = null,
): DiscoveredMarket | null {
  const marketId = asOptionalString(market.id);
  if (marketId === null) {
    return null;
  }

  const event = parentEvent ?? firstEventIdentity(market);
  const flags = gammaFlags(market);
  const yes = market.outcomes?.yes;
  const no = market.outcomes?.no;

  return {
    identity: {
      marketId,
      conditionId: asOptionalString(market.conditionId),
      slug: asOptionalString(market.slug),
      eventId: event?.eventId ?? null,
      yesTokenId: asOptionalString(yes?.tokenId),
      noTokenId: asOptionalString(no?.tokenId),
    },
    event,
    question: asOptionalString(market.question),
    description: asOptionalString(market.description),
    category: asOptionalString(market.category),
    status: classifyGammaMarketStatus(flags),
    gammaFlags: flags,
    timing: {
      startDate: asOptionalString(market.state?.startDate),
      endDate: asOptionalString(market.state?.endDate),
      closedTime: asOptionalString(market.state?.closedTime),
    },
    outcomes: {
      yes: {
        side: "yes",
        label: asOptionalString(yes?.label),
        tokenId: asOptionalString(yes?.tokenId),
      },
      no: {
        side: "no",
        label: asOptionalString(no?.label),
        tokenId: asOptionalString(no?.tokenId),
      },
    },
    tags: (market.tags ?? []).map(normalizeTag),
    observedResolution: observedResolutionFromMarket(market),
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

  const markets: DiscoveredMarket[] = [];
  for (const market of event.markets ?? []) {
    const normalized = normalizeMarket(market, observedAt, identity);
    if (normalized !== null) {
      markets.push(normalized);
    }
  }

  return {
    identity,
    markets,
    tags: (event.tags ?? []).map(normalizeTag),
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
