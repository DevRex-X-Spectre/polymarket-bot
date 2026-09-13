import { describe, expect, it } from "vitest";
import { createMarketDiscovery, DiscoveryError } from "../src/index.js";
import type { GammaDiscoveryClient } from "../src/discovery.js";
import {
  OBSERVED_AT,
  eventFixture,
  marketFixture,
  paginator,
  tagFixture,
} from "./fixtures.js";

function mockClient(
  overrides: Partial<GammaDiscoveryClient> = {},
): GammaDiscoveryClient {
  return {
    listMarkets: () => paginator({ items: [marketFixture()] }),
    listEvents: () => paginator({ items: [eventFixture()] }),
    fetchMarket: async () => marketFixture(),
    fetchEvent: async () => eventFixture(),
    search: () =>
      paginator({
        items: { events: [eventFixture()], tags: [], profiles: [] },
      }),
    listTags: () => paginator({ items: [tagFixture()] }),
    fetchTag: async () => tagFixture(),
    ...overrides,
  } as GammaDiscoveryClient;
}

describe("createMarketDiscovery", () => {
  const now = () => new Date(OBSERVED_AT);

  it("lists markets through a mocked public client", async () => {
    const discovery = createMarketDiscovery({
      client: mockClient(),
      now,
    });
    const page = await discovery.listMarkets({ closed: false, pageSize: 10 });
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.identity.marketId).toBe("703257");
    expect(page.droppedCount).toBe(0);
    expect(page.observedAt).toBe(OBSERVED_AT);
    expect(page.hasMore).toBe(false);
  });

  it("skips markets that cannot form an identity", async () => {
    const discovery = createMarketDiscovery({
      client: mockClient({
        listMarkets: () =>
          paginator({
            items: [marketFixture({ id: "" as never }), marketFixture()],
          }),
      }),
      now,
    });
    const page = await discovery.listMarkets();
    expect(page.items).toHaveLength(1);
    expect(page.droppedCount).toBe(1);
  });

  it("lists events with nested market identities", async () => {
    const discovery = createMarketDiscovery({
      client: mockClient(),
      now,
    });
    const page = await discovery.listEvents({ closed: false });
    expect(page.items[0]?.identity.eventId).toBe("90177");
    expect(page.items[0]?.markets[0]?.identity.marketId).toBe("703257");
  });

  it("fetches a market by id, slug, or url", async () => {
    const discovery = createMarketDiscovery({
      client: mockClient(),
      now,
    });
    const byId = await discovery.fetchMarket({ id: "703257" });
    const bySlug = await discovery.fetchMarket({
      slug: "will-the-us-confirm-that-aliens-exist-before-2027-789-924-249",
    });
    const byUrl = await discovery.fetchMarket({
      url: "https://polymarket.com/market/will-the-us-confirm-that-aliens-exist-before-2027-789-924-249",
    });
    expect(byId.identity.marketId).toBe("703257");
    expect(bySlug.identity.marketId).toBe("703257");
    expect(byUrl.identity.marketId).toBe("703257");
  });

  it("maps search events without treating them as tradable", async () => {
    const discovery = createMarketDiscovery({
      client: mockClient(),
      now,
    });
    const page = await discovery.search({ q: "bitcoin" });
    expect(page.items[0]?.identity.eventId).toBe("90177");
    expect(page.items[0]?.source).toBe("gamma");
  });

  it("resolves tags by slug for later market filters", async () => {
    const discovery = createMarketDiscovery({
      client: mockClient(),
      now,
    });
    const tag = await discovery.fetchTag({ slug: "nba" });
    expect(tag.id).toBe("745");
    expect(tag.slug).toBe("nba");
  });

  it("wraps SDK failures as discovery errors", async () => {
    const discovery = createMarketDiscovery({
      client: mockClient({
        listMarkets: () => {
          throw new Error("rate limited");
        },
      }),
      now,
    });
    await expect(discovery.listMarkets()).rejects.toMatchObject({
      name: "DiscoveryError",
      code: "LIST_MARKETS_FAILED",
    });
  });

  it("fails closed when a fetched market has no id", async () => {
    const discovery = createMarketDiscovery({
      client: mockClient({
        fetchMarket: async () => marketFixture({ id: "" as never }),
      }),
      now,
    });
    await expect(discovery.fetchMarket({ id: "missing" })).rejects.toBeInstanceOf(
      DiscoveryError,
    );
  });
});
