import { describe, expect, it } from "vitest";
import {
  createClobMarketData,
  MarketDataError,
  type ClobReadClient,
} from "../src/index.js";
import { OBSERVED_AT } from "./fixtures.js";

const tokenId = "123456789";
const identity = {
  marketId: "703257",
  conditionId: "0xcondition",
  slug: "example",
  eventId: "90177",
  yesTokenId: tokenId,
  noTokenId: "987654321",
};

function client(overrides: Partial<ClobReadClient> = {}): ClobReadClient {
  return {
    fetchOrderBook: async () => ({
      assetId: tokenId,
      bids: [{ price: "0.48", size: "10" }, { price: "0.47", size: "20" }],
      asks: [{ price: "0.52", size: "15" }, { price: "0.53", size: "30" }],
      minimumOrderSize: "5",
      tickSize: "0.01",
      negRisk: false,
    }),
    fetchMidpoint: async () => "0.50",
    fetchSpread: async () => "0.04",
    ...overrides,
  } as ClobReadClient;
}

describe("createClobMarketData", () => {
  const now = () => new Date(OBSERVED_AT);

  it("normalizes an order book with multiple price levels", async () => {
    const adapter = createClobMarketData({ client: client(), now });
    await expect(adapter.fetchOrderBook(tokenId)).resolves.toEqual({
      tokenId,
      bids: [{ price: "0.48", size: "10" }, { price: "0.47", size: "20" }],
      asks: [{ price: "0.52", size: "15" }, { price: "0.53", size: "30" }],
      minimumOrderSize: "5",
      tickSize: "0.01",
      negRisk: false,
    });
  });

  it("accepts an empty order book", async () => {
    const adapter = createClobMarketData({
      client: client({ fetchOrderBook: async () => ({ assetId: tokenId, bids: [], asks: [] }) }),
      now,
    });
    await expect(adapter.fetchOrderBook(tokenId)).resolves.toMatchObject({ bids: [], asks: [] });
  });

  it.each([
    { bids: [{ price: "not-a-price", size: "1" }], asks: [] },
    { bids: [], asks: [{ price: "0.5", size: "0" }] },
    { bids: null, asks: [] },
  ])("rejects malformed order book data", async (book) => {
    const adapter = createClobMarketData({
      client: client({ fetchOrderBook: async () => book }),
      now,
    });
    await expect(adapter.fetchOrderBook(tokenId)).rejects.toMatchObject({
      name: "MarketDataError",
      code: "CLOB_RESPONSE_INVALID",
    });
  });

  it("rejects a book returned for a different token", async () => {
    const adapter = createClobMarketData({
      client: client({ fetchOrderBook: async () => ({ assetId: "other", bids: [], asks: [] }) }),
      now,
    });
    await expect(adapter.fetchOrderBook(tokenId)).rejects.toBeInstanceOf(MarketDataError);
  });

  it("wraps API failures in the project error model", async () => {
    const adapter = createClobMarketData({
      client: client({ fetchOrderBook: async () => { throw new Error("not found"); } }),
      now,
    });
    await expect(adapter.fetchOrderBook(tokenId)).rejects.toMatchObject({
      name: "MarketDataError",
      code: "FETCH_ORDER_BOOK_FAILED",
    });
  });

  it("wraps current-price API failures in the project error model", async () => {
    const adapter = createClobMarketData({
      client: client({ fetchMidpoint: async () => { throw new Error("unavailable"); } }),
      now,
    });
    await expect(adapter.fetchMarketData({ identity, event: null, tokenId })).rejects.toMatchObject({
      name: "MarketDataError",
      code: "FETCH_MARKET_DATA_FAILED",
    });
  });

  it("returns supported market data and preserves canonical identity", async () => {
    const adapter = createClobMarketData({ client: client(), now });
    const originalIdentity = { ...identity };
    const data = await adapter.fetchMarketData({
      identity,
      event: { eventId: "90177", slug: "event", title: "Event" },
      tokenId,
    });
    expect(data.identity).toEqual(originalIdentity);
    expect(identity).toEqual(originalIdentity);
    expect(data.event?.eventId).toBe("90177");
    expect(data.midpoint).toBe("0.50");
    expect(data.spread).toBe("0.04");
    expect(data.observedAt).toBe(OBSERVED_AT);
  });

  it("keeps unavailable optional prices unknown", async () => {
    const adapter = createClobMarketData({
      client: client({ fetchMidpoint: async () => null as never, fetchSpread: async () => "" as never }),
      now,
    });
    await expect(adapter.fetchMarketData({ identity, event: null, tokenId })).resolves.toMatchObject({
      midpoint: null,
      spread: null,
    });
  });
});
