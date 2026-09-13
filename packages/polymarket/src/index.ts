export { createGammaPublicClient } from "./client.js";
export {
  createMarketDiscovery,
  type CreateMarketDiscoveryOptions,
  type GammaDiscoveryClient,
  type MarketDiscovery,
} from "./discovery.js";
export { DiscoveryError } from "./errors.js";
export {
  normalizeEvent,
  normalizeMarket,
  normalizeSdkTag,
  normalizeTag,
} from "./normalize.js";
export type {
  EventRef,
  ListEventsQuery,
  ListMarketsQuery,
  ListTagsQuery,
  MarketRef,
  SearchQuery,
  TagRef,
} from "./queries.js";
