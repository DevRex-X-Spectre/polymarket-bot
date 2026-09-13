export { createGammaPublicClient } from "./client.js";
export {
  createMarketDiscovery,
  type CreateMarketDiscoveryOptions,
  type GammaDiscoveryClient,
  type MarketDiscovery,
} from "./discovery.js";
export { DiscoveryError } from "./errors.js";
export { MarketDataError } from "./errors.js";
export {
  createClobMarketData,
  type ClobMarketData,
  type ClobMarketDataAdapter,
  type ClobMarketTarget,
  type ClobOrderBook,
  type ClobReadClient,
  type CreateClobMarketDataOptions,
  type OrderBookLevel,
} from "./market-data.js";
export {
  normalizeEvent,
  normalizeMarket,
  normalizeSdkTag,
  normalizeTag,
} from "./normalize.js";
export {
  extractMarketResolution,
  isResolutionValidated,
} from "@polymarket-bot/market-models";
export type {
  EventRef,
  ListEventsQuery,
  ListMarketsQuery,
  ListTagsQuery,
  MarketRef,
  SearchQuery,
  TagRef,
} from "./queries.js";
export {
  POLYMARKET_MARKET_WS_URL,
  WS_HEARTBEAT_INTERVAL_MS,
  createMarketWebSocketAdapter,
  parseMarketStreamMessage,
  type CloseDetails,
  type MarketBestBidAskEvent,
  type MarketBookEvent,
  type MarketLastTradePriceEvent,
  type MarketMalformedEvent,
  type MarketNewMarketEvent,
  type MarketPriceChangeEvent,
  type MarketPriceChangeItem,
  type MarketResolvedEvent,
  type MarketStreamEvent,
  type MarketTickSizeChangeEvent,
  type MarketUnknownEvent,
  type MarketWebSocketAdapter,
  type MarketWebSocketLike,
  type MarketWebSocketOptions,
  type WebSocketFactory,
} from "./websocket.js";

