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
