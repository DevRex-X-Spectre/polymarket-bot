import type {
  Event,
  Market,
  PaginationCursor,
  PublicClient,
} from "@polymarket/client";
import type {
  DiscoveredEvent,
  DiscoveredMarket,
  DiscoveryPage,
  TagIdentity,
} from "@polymarket-bot/market-models";
import { createGammaPublicClient } from "./client.js";
import { DiscoveryError } from "./errors.js";
import {
  normalizeEvent,
  normalizeMarket,
  normalizeSdkTag,
} from "./normalize.js";
import type {
  EventRef,
  ListEventsQuery,
  ListMarketsQuery,
  ListTagsQuery,
  MarketRef,
  SearchQuery,
  TagRef,
} from "./queries.js";
import { isoNow } from "./values.js";

export type GammaDiscoveryClient = Pick<
  PublicClient,
  | "listMarkets"
  | "listEvents"
  | "fetchMarket"
  | "fetchEvent"
  | "search"
  | "listTags"
  | "fetchTag"
>;

export interface MarketDiscovery {
  listMarkets(query?: ListMarketsQuery): Promise<DiscoveryPage<DiscoveredMarket>>;
  listEvents(query?: ListEventsQuery): Promise<DiscoveryPage<DiscoveredEvent>>;
  fetchMarket(ref: MarketRef): Promise<DiscoveredMarket>;
  fetchEvent(ref: EventRef): Promise<DiscoveredEvent>;
  search(query: SearchQuery): Promise<DiscoveryPage<DiscoveredEvent>>;
  listTags(query?: ListTagsQuery): Promise<DiscoveryPage<TagIdentity>>;
  fetchTag(ref: TagRef): Promise<TagIdentity>;
}

export interface CreateMarketDiscoveryOptions {
  readonly client?: GammaDiscoveryClient;
  readonly now?: () => Date;
}

export function createMarketDiscovery(
  options: CreateMarketDiscoveryOptions = {},
): MarketDiscovery {
  const client = options.client ?? createGammaPublicClient();
  const now = options.now ?? (() => new Date());

  return {
    async listMarkets(query = {}) {
      const observedAt = isoNow(now());
      try {
        const page = await client
          .listMarkets({
            closed: query.closed,
            tagId: query.tagId,
            pageSize: query.pageSize,
            cursor: asCursor(query.cursor),
            ids: query.ids ? [...query.ids] : undefined,
            conditionIds: query.conditionIds
              ? [...query.conditionIds]
              : undefined,
            slug: query.slug ? [...query.slug] : undefined,
            includeTag: true,
          })
          .firstPage();
        return mapMarketPage(page, observedAt);
      } catch (error) {
        throw wrapDiscoveryError(error, "LIST_MARKETS_FAILED");
      }
    },

    async listEvents(query = {}) {
      const observedAt = isoNow(now());
      try {
        const page = await client
          .listEvents({
            closed: query.closed,
            tagIds: query.tagIds ? [...query.tagIds] : undefined,
            pageSize: query.pageSize,
            cursor: asCursor(query.cursor),
            ids: query.ids ? [...query.ids] : undefined,
            slug: query.slug ? [...query.slug] : undefined,
            titleSearch: query.titleSearch,
          })
          .firstPage();
        return mapEventPage(page, observedAt);
      } catch (error) {
        throw wrapDiscoveryError(error, "LIST_EVENTS_FAILED");
      }
    },

    async fetchMarket(ref) {
      const observedAt = isoNow(now());
      try {
        const market = await client.fetchMarket(ref);
        const discovered = normalizeMarket(market, observedAt);
        if (discovered === null) {
          throw new DiscoveryError(
            "Gamma returned a market without a market id.",
            "MARKET_IDENTITY_MISSING",
          );
        }
        return discovered;
      } catch (error) {
        if (error instanceof DiscoveryError) {
          throw error;
        }
        throw wrapDiscoveryError(error, "FETCH_MARKET_FAILED");
      }
    },

    async fetchEvent(ref) {
      const observedAt = isoNow(now());
      try {
        const event = await client.fetchEvent(ref);
        const discovered = normalizeEvent(event, observedAt);
        if (discovered === null) {
          throw new DiscoveryError(
            "Gamma returned an event without an event id.",
            "EVENT_IDENTITY_MISSING",
          );
        }
        return discovered;
      } catch (error) {
        if (error instanceof DiscoveryError) {
          throw error;
        }
        throw wrapDiscoveryError(error, "FETCH_EVENT_FAILED");
      }
    },

    async search(query) {
      const observedAt = isoNow(now());
      try {
        const page = await client
          .search({
            q: query.q,
            pageSize: query.pageSize,
            cursor: asCursor(query.cursor),
          })
          .firstPage();
        return mapSearchPage(page, observedAt);
      } catch (error) {
        throw wrapDiscoveryError(error, "SEARCH_FAILED");
      }
    },

    async listTags(query = {}) {
      const observedAt = isoNow(now());
      try {
        const page = await client
          .listTags({
            pageSize: query.pageSize,
            cursor: asCursor(query.cursor),
          })
          .firstPage();
        return {
          items: (page.items ?? []).map(normalizeSdkTag),
          droppedCount: 0,
          hasMore: page.hasMore,
          nextCursor: page.nextCursor ?? null,
          observedAt,
        };
      } catch (error) {
        throw wrapDiscoveryError(error, "LIST_TAGS_FAILED");
      }
    },

    async fetchTag(ref) {
      try {
        const tag = await client.fetchTag(ref);
        return normalizeSdkTag(tag);
      } catch (error) {
        throw wrapDiscoveryError(error, "FETCH_TAG_FAILED");
      }
    },
  };
}

function mapMarketPage(
  page: { items: Market[]; hasMore: boolean; nextCursor?: string },
  observedAt: string,
): DiscoveryPage<DiscoveredMarket> {
  const items: DiscoveredMarket[] = [];
  let droppedCount = 0;
  for (const market of page.items ?? []) {
    const discovered = normalizeMarket(market, observedAt);
    if (discovered === null) {
      droppedCount += 1;
      continue;
    }
    items.push(discovered);
  }
  return {
    items,
    droppedCount,
    hasMore: page.hasMore,
    nextCursor: page.nextCursor ?? null,
    observedAt,
  };
}

function mapEventPage(
  page: { items: Event[]; hasMore: boolean; nextCursor?: string },
  observedAt: string,
): DiscoveryPage<DiscoveredEvent> {
  const items: DiscoveredEvent[] = [];
  let droppedCount = 0;
  for (const event of page.items ?? []) {
    const discovered = normalizeEvent(event, observedAt);
    if (discovered === null) {
      droppedCount += 1;
      continue;
    }
    items.push(discovered);
  }
  return {
    items,
    droppedCount,
    hasMore: page.hasMore,
    nextCursor: page.nextCursor ?? null,
    observedAt,
  };
}

function asCursor(cursor: string | undefined): PaginationCursor | undefined {
  return cursor as PaginationCursor | undefined;
}

function mapSearchPage(
  page: {
    items: { events?: Event[] };
    hasMore: boolean;
    nextCursor?: string;
  },
  observedAt: string,
): DiscoveryPage<DiscoveredEvent> {
  const items: DiscoveredEvent[] = [];
  let droppedCount = 0;
  for (const event of page.items?.events ?? []) {
    const discovered = normalizeEvent(event, observedAt);
    if (discovered === null) {
      droppedCount += 1;
      continue;
    }
    items.push(discovered);
  }
  return {
    items,
    droppedCount,
    hasMore: page.hasMore,
    nextCursor: page.nextCursor ?? null,
    observedAt,
  };
}

function wrapDiscoveryError(error: unknown, code: string): DiscoveryError {
  const message =
    error instanceof Error ? error.message : "Unknown discovery error";
  return new DiscoveryError(message, code, { cause: error });
}
