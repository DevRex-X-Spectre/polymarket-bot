import { MarketDataError } from "./errors.js";
import type { OrderBookLevel } from "./market-data.js";

export const POLYMARKET_MARKET_WS_URL =
  "wss://ws-subscriptions-clob.polymarket.com/ws/market";

export const WS_HEARTBEAT_INTERVAL_MS = 10_000;

export interface MarketWebSocketLike {
  send(data: string): void;
  close(code?: number, reason?: string): void;
  addEventListener(type: "open", listener: (event: unknown) => void): void;
  addEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
  addEventListener(type: "error", listener: (event: unknown) => void): void;
  addEventListener(
    type: "close",
    listener: (event: { code: number; reason: string; wasClean: boolean }) => void,
  ): void;
  removeEventListener(type: string, listener: (...args: any[]) => void): void;
}

export type WebSocketFactory = (url: string) => MarketWebSocketLike;

export interface MarketBookEvent {
  readonly eventType: "book";
  readonly assetId: string;
  readonly market: string;
  readonly bids: readonly OrderBookLevel[];
  readonly asks: readonly OrderBookLevel[];
  readonly timestamp: string | null;
  readonly hash: string | null;
}

export interface MarketPriceChangeItem {
  readonly assetId: string;
  readonly price: string;
  readonly size: string;
  readonly side: string;
  readonly hash: string | null;
  readonly bestBid: string | null;
  readonly bestAsk: string | null;
}

export interface MarketPriceChangeEvent {
  readonly eventType: "price_change";
  readonly market: string;
  readonly priceChanges: readonly MarketPriceChangeItem[];
  readonly timestamp: string | null;
}

export interface MarketLastTradePriceEvent {
  readonly eventType: "last_trade_price";
  readonly assetId: string;
  readonly market: string | null;
  readonly price: string;
  readonly size: string;
  readonly side: string;
  readonly feeRateBps: string | null;
  readonly timestamp: string | null;
}

export interface MarketTickSizeChangeEvent {
  readonly eventType: "tick_size_change";
  readonly assetId: string;
  readonly market: string | null;
  readonly oldTickSize: string;
  readonly newTickSize: string;
  readonly timestamp: string | null;
}

export interface MarketBestBidAskEvent {
  readonly eventType: "best_bid_ask";
  readonly assetId: string;
  readonly market: string | null;
  readonly bestBid: string | null;
  readonly bestAsk: string | null;
  readonly spread: string | null;
  readonly timestamp: string | null;
}

export interface MarketNewMarketEvent {
  readonly eventType: "new_market";
  readonly market: string;
  readonly question: string;
  readonly assetIds: readonly string[];
  readonly outcomes: readonly string[];
  readonly timestamp: string | null;
}

export interface MarketResolvedEvent {
  readonly eventType: "market_resolved";
  readonly market: string;
  readonly winningAssetId: string;
  readonly winningOutcome: string;
  readonly timestamp: string | null;
}

export interface MarketUnknownEvent {
  readonly eventType: "unknown";
  readonly rawType: string | null;
  readonly payload: Record<string, unknown>;
}

export interface MarketMalformedEvent {
  readonly eventType: "malformed";
  readonly reason: string;
  readonly raw: unknown;
}

export type MarketStreamEvent =
  | MarketBookEvent
  | MarketPriceChangeEvent
  | MarketLastTradePriceEvent
  | MarketTickSizeChangeEvent
  | MarketBestBidAskEvent
  | MarketNewMarketEvent
  | MarketResolvedEvent
  | MarketUnknownEvent
  | MarketMalformedEvent;

export interface CloseDetails {
  readonly code: number;
  readonly reason: string;
  readonly wasClean: boolean;
}

export interface MarketWebSocketOptions {
  readonly url?: string;
  readonly createWebSocket?: WebSocketFactory;
  readonly heartbeatIntervalMs?: number;
  readonly customFeaturesEnabled?: boolean;
}

export interface MarketWebSocketAdapter {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(assetIds: readonly string[]): void;
  unsubscribe(assetIds: readonly string[]): void;
  isConnected(): boolean;
  getSubscribedAssets(): readonly string[];
  onEvent(listener: (event: MarketStreamEvent) => void): () => void;
  onError(listener: (error: MarketDataError) => void): () => void;
  onClose(listener: (details: CloseDetails) => void): () => void;
  onOpen(listener: () => void): () => void;
}

export function parseMarketStreamMessage(raw: unknown): MarketStreamEvent | null {
  if (raw === "PONG") {
    return null;
  }
  let payload: unknown;
  if (typeof raw === "string") {
    try {
      payload = JSON.parse(raw);
    } catch {
      return {
        eventType: "malformed",
        reason: "INVALID_JSON",
        raw,
      };
    }
  } else {
    payload = raw;
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return {
      eventType: "malformed",
      reason: "PAYLOAD_NOT_OBJECT",
      raw,
    };
  }

  const record = payload as Record<string, unknown>;
  const eventType =
    typeof record.event_type === "string"
      ? record.event_type
      : typeof record.type === "string"
        ? record.type
        : null;

  if (eventType === null) {
    return {
      eventType: "malformed",
      reason: "MISSING_EVENT_TYPE",
      raw,
    };
  }

  switch (eventType) {
    case "book": {
      const assetId = asNonEmptyString(record.asset_id ?? record.assetId);
      const market = asNonEmptyString(record.market);
      const bids = normalizeLevels(record.bids);
      const asks = normalizeLevels(record.asks);
      if (!assetId || !market || bids === null || asks === null) {
        return {
          eventType: "malformed",
          reason: "INVALID_BOOK_PAYLOAD",
          raw,
        };
      }
      return {
        eventType: "book",
        assetId,
        market,
        bids,
        asks,
        timestamp: normalizeTimestamp(record.timestamp),
        hash: asNonEmptyString(record.hash),
      };
    }

    case "price_change": {
      const market = asNonEmptyString(record.market);
      const rawChanges = record.price_changes ?? record.priceChanges;
      if (!market || !Array.isArray(rawChanges)) {
        return {
          eventType: "malformed",
          reason: "INVALID_PRICE_CHANGE_PAYLOAD",
          raw,
        };
      }
      const priceChanges: MarketPriceChangeItem[] = [];
      for (const item of rawChanges) {
        if (typeof item !== "object" || item === null) {
          return {
            eventType: "malformed",
            reason: "INVALID_PRICE_CHANGE_ITEM",
            raw,
          };
        }
        const pc = item as Record<string, unknown>;
        const assetId = asNonEmptyString(pc.asset_id ?? pc.assetId);
        const price = normalizeDecimalString(pc.price);
        const size = normalizeDecimalString(pc.size);
        const side = asNonEmptyString(pc.side);
        if (!assetId || !price || !size || !side) {
          return {
            eventType: "malformed",
            reason: "INVALID_PRICE_CHANGE_ITEM_FIELDS",
            raw,
          };
        }
        priceChanges.push({
          assetId,
          price,
          size,
          side,
          hash: asNonEmptyString(pc.hash),
          bestBid: normalizeDecimalString(pc.best_bid ?? pc.bestBid),
          bestAsk: normalizeDecimalString(pc.best_ask ?? pc.bestAsk),
        });
      }
      return {
        eventType: "price_change",
        market,
        priceChanges,
        timestamp: normalizeTimestamp(record.timestamp),
      };
    }

    case "last_trade_price": {
      const assetId = asNonEmptyString(record.asset_id ?? record.assetId);
      const price = normalizeDecimalString(record.price);
      const size = normalizeDecimalString(record.size);
      const side = asNonEmptyString(record.side);
      if (!assetId || !price || !size || !side) {
        return {
          eventType: "malformed",
          reason: "INVALID_LAST_TRADE_PRICE_PAYLOAD",
          raw,
        };
      }
      return {
        eventType: "last_trade_price",
        assetId,
        market: asNonEmptyString(record.market),
        price,
        size,
        side,
        feeRateBps: normalizeDecimalString(record.fee_rate_bps ?? record.feeRateBps),
        timestamp: normalizeTimestamp(record.timestamp),
      };
    }

    case "tick_size_change": {
      const assetId = asNonEmptyString(record.asset_id ?? record.assetId);
      const oldTickSize = normalizeDecimalString(
        record.old_tick_size ?? record.oldTickSize,
      );
      const newTickSize = normalizeDecimalString(
        record.new_tick_size ?? record.newTickSize,
      );
      if (!assetId || !oldTickSize || !newTickSize) {
        return {
          eventType: "malformed",
          reason: "INVALID_TICK_SIZE_CHANGE_PAYLOAD",
          raw,
        };
      }
      return {
        eventType: "tick_size_change",
        assetId,
        market: asNonEmptyString(record.market),
        oldTickSize,
        newTickSize,
        timestamp: normalizeTimestamp(record.timestamp),
      };
    }

    case "best_bid_ask": {
      const assetId = asNonEmptyString(record.asset_id ?? record.assetId);
      if (!assetId) {
        return {
          eventType: "malformed",
          reason: "INVALID_BEST_BID_ASK_PAYLOAD",
          raw,
        };
      }
      return {
        eventType: "best_bid_ask",
        assetId,
        market: asNonEmptyString(record.market),
        bestBid: normalizeDecimalString(record.best_bid ?? record.bestBid),
        bestAsk: normalizeDecimalString(record.best_ask ?? record.bestAsk),
        spread: normalizeDecimalString(record.spread),
        timestamp: normalizeTimestamp(record.timestamp),
      };
    }

    case "new_market": {
      const market = asNonEmptyString(record.market);
      const question = asNonEmptyString(record.question);
      const rawAssets = record.assets_ids ?? record.asset_ids ?? record.assetsIds;
      const rawOutcomes = record.outcomes;
      if (
        !market ||
        !question ||
        !Array.isArray(rawAssets) ||
        !Array.isArray(rawOutcomes)
      ) {
        return {
          eventType: "malformed",
          reason: "INVALID_NEW_MARKET_PAYLOAD",
          raw,
        };
      }
      const assetIds = rawAssets.map(String).filter((s) => s.length > 0);
      const outcomes = rawOutcomes.map(String);
      return {
        eventType: "new_market",
        market,
        question,
        assetIds,
        outcomes,
        timestamp: normalizeTimestamp(record.timestamp),
      };
    }

    case "market_resolved": {
      const market = asNonEmptyString(record.market);
      const winningAssetId = asNonEmptyString(
        record.winning_asset_id ?? record.winningAssetId,
      );
      const winningOutcome = asNonEmptyString(
        record.winning_outcome ?? record.winningOutcome,
      );
      if (!market || !winningAssetId || !winningOutcome) {
        return {
          eventType: "malformed",
          reason: "INVALID_MARKET_RESOLVED_PAYLOAD",
          raw,
        };
      }
      return {
        eventType: "market_resolved",
        market,
        winningAssetId,
        winningOutcome,
        timestamp: normalizeTimestamp(record.timestamp),
      };
    }

    default: {
      return {
        eventType: "unknown",
        rawType: eventType,
        payload: record,
      };
    }
  }
}

export function createMarketWebSocketAdapter(
  options: MarketWebSocketOptions = {},
): MarketWebSocketAdapter {
  const url = options.url ?? POLYMARKET_MARKET_WS_URL;
  const heartbeatIntervalMs =
    options.heartbeatIntervalMs ?? WS_HEARTBEAT_INTERVAL_MS;
  const customFeaturesEnabled = options.customFeaturesEnabled ?? true;

  const createWs: WebSocketFactory =
    options.createWebSocket ??
    ((targetUrl: string) => {
      if (typeof globalThis.WebSocket !== "function") {
        throw new MarketDataError(
          "No WebSocket implementation available in current runtime.",
          "WS_UNAVAILABLE",
        );
      }
      return new globalThis.WebSocket(targetUrl) as unknown as MarketWebSocketLike;
    });

  let socket: MarketWebSocketLike | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let connected = false;
  const subscribedAssets = new Set<string>();

  const eventListeners = new Set<(event: MarketStreamEvent) => void>();
  const errorListeners = new Set<(error: MarketDataError) => void>();
  const closeListeners = new Set<(details: CloseDetails) => void>();
  const openListeners = new Set<() => void>();

  function stopHeartbeat(): void {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function startHeartbeat(): void {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket && connected) {
        try {
          socket.send("PING");
        } catch (err) {
          emitError(
            new MarketDataError(
              "Failed to send PING heartbeat",
              "WS_HEARTBEAT_FAILED",
              { cause: err },
            ),
          );
        }
      }
    }, heartbeatIntervalMs);
  }

  function emitError(err: MarketDataError): void {
    for (const listener of errorListeners) {
      try {
        listener(err);
      } catch {
        // preserve error handling boundary
      }
    }
  }

  function emitEvent(event: MarketStreamEvent): void {
    for (const listener of eventListeners) {
      try {
        listener(event);
      } catch {
        // preserve event dispatch boundary
      }
    }
  }

  return {
    async connect(): Promise<void> {
      if (socket !== null && connected) {
        return;
      }

      return new Promise<void>((resolve, reject) => {
        let settled = false;
        try {
          socket = createWs(url);
        } catch (err) {
          const error = new MarketDataError(
            err instanceof Error ? err.message : "Failed to create WebSocket",
            "WS_CONNECTION_FAILED",
            { cause: err },
          );
          emitError(error);
          reject(error);
          return;
        }

        const handleOpen = () => {
          connected = true;
          settled = true;
          startHeartbeat();

          if (subscribedAssets.size > 0) {
            try {
              socket?.send(
                JSON.stringify({
                  type: "market",
                  assets_ids: Array.from(subscribedAssets),
                  custom_feature_enabled: customFeaturesEnabled,
                }),
              );
            } catch (err) {
              emitError(
                new MarketDataError(
                  "Failed to send initial subscription",
                  "WS_SUBSCRIBE_FAILED",
                  { cause: err },
                ),
              );
            }
          }

          for (const listener of openListeners) {
            try {
              listener();
            } catch {
              // preserve listener boundary
            }
          }
          resolve();
        };

        const handleMessage = (event: { data: unknown }) => {
          try {
            const parsed = parseMarketStreamMessage(event.data);
            if (parsed !== null) {
              emitEvent(parsed);
            }
          } catch (err) {
            emitError(
              new MarketDataError(
                "Error processing stream message",
                "WS_MESSAGE_PROCESSING_ERROR",
                { cause: err },
              ),
            );
          }
        };

        const handleError = (event: unknown) => {
          const error = new MarketDataError(
            "WebSocket stream error occurred",
            "WS_STREAM_ERROR",
            { cause: event },
          );
          emitError(error);
          if (!settled) {
            settled = true;
            reject(error);
          }
        };

        const handleClose = (event: {
          code: number;
          reason: string;
          wasClean: boolean;
        }) => {
          connected = false;
          stopHeartbeat();
          for (const listener of closeListeners) {
            try {
              listener({
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean,
              });
            } catch {
              // preserve close boundary
            }
          }
          if (!settled) {
            settled = true;
            reject(
              new MarketDataError(
                `WebSocket closed before connecting (code: ${event.code})`,
                "WS_CONNECTION_CLOSED_EARLY",
              ),
            );
          }
        };

        socket.addEventListener("open", handleOpen);
        socket.addEventListener("message", handleMessage);
        socket.addEventListener("error", handleError);
        socket.addEventListener("close", handleClose);
      });
    },

    disconnect(): void {
      stopHeartbeat();
      connected = false;
      if (socket !== null) {
        try {
          socket.close();
        } catch {
          // ignore close error
        }
        socket = null;
      }
    },

    subscribe(assetIds: readonly string[]): void {
      const validNewIds: string[] = [];
      for (const id of assetIds) {
        if (id.length > 0 && !subscribedAssets.has(id)) {
          subscribedAssets.add(id);
          validNewIds.push(id);
        }
      }

      if (validNewIds.length > 0 && socket !== null && connected) {
        try {
          socket.send(
            JSON.stringify({
              assets_ids: validNewIds,
              operation: "subscribe",
              custom_feature_enabled: customFeaturesEnabled,
            }),
          );
        } catch (err) {
          emitError(
            new MarketDataError(
              "Failed to send dynamic subscription",
              "WS_SUBSCRIBE_FAILED",
              { cause: err },
            ),
          );
        }
      }
    },

    unsubscribe(assetIds: readonly string[]): void {
      const validRemovedIds: string[] = [];
      for (const id of assetIds) {
        if (subscribedAssets.has(id)) {
          subscribedAssets.delete(id);
          validRemovedIds.push(id);
        }
      }

      if (validRemovedIds.length > 0 && socket !== null && connected) {
        try {
          socket.send(
            JSON.stringify({
              assets_ids: validRemovedIds,
              operation: "unsubscribe",
            }),
          );
        } catch (err) {
          emitError(
            new MarketDataError(
              "Failed to send dynamic unsubscription",
              "WS_UNSUBSCRIBE_FAILED",
              { cause: err },
            ),
          );
        }
      }
    },

    isConnected(): boolean {
      return connected;
    },

    getSubscribedAssets(): readonly string[] {
      return Array.from(subscribedAssets);
    },

    onEvent(listener: (event: MarketStreamEvent) => void): () => void {
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },

    onError(listener: (error: MarketDataError) => void): () => void {
      errorListeners.add(listener);
      return () => {
        errorListeners.delete(listener);
      };
    },

    onClose(listener: (details: CloseDetails) => void): () => void {
      closeListeners.add(listener);
      return () => {
        closeListeners.delete(listener);
      };
    },

    onOpen(listener: () => void): () => void {
      openListeners.add(listener);
      return () => {
        openListeners.delete(listener);
      };
    },
  };
}

function normalizeDecimalString(value: unknown): string | null {
  if (value == null) return null;
  let text =
    typeof value === "number"
      ? String(value)
      : typeof value === "string"
        ? value.trim()
        : null;
  if (text === null || text.length === 0) return null;
  if (text.startsWith(".")) {
    text = "0" + text;
  } else if (text.startsWith("-.")) {
    text = "-0" + text.slice(1);
  }
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text)) {
    return text;
  }
  return null;
}

function normalizeTimestamp(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string")
    return value.trim().length > 0 ? value.trim() : null;
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  return null;
}

function normalizeLevels(raw: unknown): OrderBookLevel[] | null {
  if (!Array.isArray(raw)) return null;
  const levels: OrderBookLevel[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const rec = item as Record<string, unknown>;
    const price = normalizeDecimalString(rec.price);
    const size = normalizeDecimalString(rec.size);
    if (
      price === null ||
      size === null ||
      Number(price) <= 0 ||
      Number(size) < 0
    ) {
      return null;
    }
    levels.push({ price, size });
  }
  return levels;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return null;
}
