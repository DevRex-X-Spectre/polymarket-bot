import type { PublicClient } from "@polymarket/client";
import type { EventIdentity, MarketIdentity } from "@polymarket-bot/market-models";
import { MarketDataError } from "./errors.js";
import { createGammaPublicClient } from "./client.js";
import { isoNow } from "./values.js";

export interface ClobMarketTarget {
  readonly identity: MarketIdentity;
  readonly event: EventIdentity | null;
  readonly tokenId: string;
}

export interface OrderBookLevel {
  readonly price: string;
  readonly size: string;
}

export interface ClobOrderBook {
  readonly tokenId: string;
  readonly bids: readonly OrderBookLevel[];
  readonly asks: readonly OrderBookLevel[];
  readonly minimumOrderSize: string | null;
  readonly tickSize: string | null;
  readonly negRisk: boolean | null;
}

export interface ClobMarketData {
  readonly identity: MarketIdentity;
  readonly event: EventIdentity | null;
  readonly tokenId: string;
  readonly orderBook: ClobOrderBook;
  readonly midpoint: string | null;
  readonly spread: string | null;
  readonly observedAt: string;
}

export type ClobReadClient = Pick<
  PublicClient,
  "fetchOrderBook" | "fetchMidpoint" | "fetchSpread"
>;

export interface CreateClobMarketDataOptions {
  readonly client?: ClobReadClient;
  readonly now?: () => Date;
}

export interface ClobMarketDataAdapter {
  fetchOrderBook(tokenId: string): Promise<ClobOrderBook>;
  fetchMarketData(target: ClobMarketTarget): Promise<ClobMarketData>;
}

export function createClobMarketData(
  options: CreateClobMarketDataOptions = {},
): ClobMarketDataAdapter {
  const client = options.client ?? createGammaPublicClient();
  const now = options.now ?? (() => new Date());

  return {
    async fetchOrderBook(tokenId) {
      assertTokenId(tokenId);
      try {
        const rawBook = await client.fetchOrderBook({ assetId: tokenId });
        return normalizeOrderBook(rawBook, tokenId);
      } catch (error) {
        if (error instanceof MarketDataError) {
          throw error;
        }
        throw wrapMarketDataError(error, "FETCH_ORDER_BOOK_FAILED");
      }
    },

    async fetchMarketData(target) {
      assertTokenId(target.tokenId);
      try {
        const [orderBook, midpoint, spread] = await Promise.all([
          this.fetchOrderBook(target.tokenId),
          client.fetchMidpoint({ assetId: target.tokenId }),
          client.fetchSpread({ assetId: target.tokenId }),
        ]);
        return {
          identity: { ...target.identity },
          event: target.event === null ? null : { ...target.event },
          tokenId: target.tokenId,
          orderBook,
          midpoint: normalizeOptionalDecimal(midpoint),
          spread: normalizeOptionalDecimal(spread),
          observedAt: isoNow(now()),
        };
      } catch (error) {
        if (error instanceof MarketDataError) {
          throw error;
        }
        throw wrapMarketDataError(error, "FETCH_MARKET_DATA_FAILED");
      }
    },
  };
}

function normalizeOrderBook(
  rawBook: unknown,
  tokenId: string,
): ClobOrderBook {
  const record = asRecord(rawBook);
  if (record === null) {
    throw new MarketDataError("CLOB returned a malformed order book.", "CLOB_RESPONSE_INVALID");
  }
  const bids = normalizeLevels(record.bids);
  const asks = normalizeLevels(record.asks);
  if (bids === null || asks === null) {
    throw new MarketDataError("CLOB order book is missing valid bid or ask levels.", "CLOB_RESPONSE_INVALID");
  }
  const responseTokenId = optionalString(record.assetId) ?? optionalString(record.asset_id);
  if (responseTokenId !== null && responseTokenId !== tokenId) {
    throw new MarketDataError("CLOB returned an order book for a different token.", "CLOB_RESPONSE_INVALID");
  }
  return {
    tokenId,
    bids,
    asks,
    minimumOrderSize: normalizeOptionalDecimal(
      record.minimumOrderSize ?? record.minOrderSize ?? record.min_order_size,
    ),
    tickSize: normalizeOptionalDecimal(record.tickSize ?? record.tick_size),
    negRisk: asOptionalBoolean(record.negRisk ?? record.neg_risk),
  };
}

function normalizeLevels(value: unknown): readonly OrderBookLevel[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const levels: OrderBookLevel[] = [];
  for (const level of value) {
    const record = asRecord(level);
    if (record === null) {
      return null;
    }
    const price = normalizeOptionalDecimal(record.price);
    const size = normalizeOptionalDecimal(record.size);
    if (price === null || size === null || !isPositiveDecimal(price) || !isPositiveDecimal(size)) {
      return null;
    }
    levels.push({ price, size });
  }
  return levels;
}

function normalizeOptionalDecimal(value: unknown): string | null {
  const text = optionalString(value);
  return text !== null && isDecimal(text) ? text : null;
}

function isDecimal(value: string): boolean {
  return /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value);
}

function isPositiveDecimal(value: string): boolean {
  return isDecimal(value) && Number(value) > 0;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asOptionalBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function assertTokenId(tokenId: string): void {
  if (tokenId.length === 0) {
    throw new MarketDataError("A CLOB token id is required.", "TOKEN_ID_MISSING");
  }
}

function wrapMarketDataError(error: unknown, code: string): MarketDataError {
  const message = error instanceof Error ? error.message : "Unknown CLOB market-data error";
  return new MarketDataError(message, code, { cause: error });
}
