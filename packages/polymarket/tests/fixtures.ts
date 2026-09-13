import type { Event, Market, Tag } from "@polymarket/client";

export const OBSERVED_AT = "2026-09-13T12:00:00.000Z";

export function marketFixture(overrides: Partial<Market> = {}): Market {
  return {
    id: "703257",
    conditionId:
      "0x747dc809fb79e1b05be09c42d6179459a58de2ef3e40f02484a4e1260f741f75",
    slug: "will-the-us-confirm-that-aliens-exist-before-2027-789-924-249",
    question: "Will the US confirm that aliens exist before 2027?",
    description: "Resolves based on official confirmation.",
    category: "Science",
    state: {
      active: true,
      closed: false,
      archived: false,
      acceptingOrders: true,
      enableOrderBook: true,
      negRisk: false,
      startDate: "2024-03-15T00:00:00Z",
      endDate: "2027-01-01T00:00:00Z",
      closedTime: null,
    },
    outcomes: {
      yes: {
        label: "Yes",
        tokenId:
          "107505882767731489358349912513945399560393482969656700824895970500493757150417",
        positionId: null,
        price: "0.085",
      },
      no: {
        label: "No",
        tokenId:
          "7305630249804085635496399869905769372294302716159034447326228509068694952392",
        positionId: null,
        price: "0.915",
      },
    },
    metrics: {},
    prices: {},
    trading: {},
    resolution: {
      questionId: null,
      negRiskRequestId: null,
      umaResolutionStatus: null,
      source: "Official confirmation",
      resolvedBy: null,
    },
    rewards: {},
    sports: {},
    events: [
      {
        id: "90177",
        slug: "will-the-us-confirm-that-aliens-exist-before-2027",
        title: "Will the US confirm that aliens exist by...?",
      },
    ],
    tags: [{ id: "100", slug: "science", label: "Science" }],
    positionIds: [],
    ...overrides,
  } as Market;
}

export function eventFixture(overrides: Partial<Event> = {}): Event {
  const market = marketFixture();
  return {
    id: "90177",
    slug: "will-the-us-confirm-that-aliens-exist-before-2027",
    title: "Will the US confirm that aliens exist by...?",
    state: {},
    schedule: {},
    metrics: {},
    display: {},
    trading: {},
    resolution: { source: "Official confirmation" },
    estimation: {},
    sports: {},
    partners: [],
    metadata: null,
    markets: [market],
    series: [],
    tags: [{ id: "100", slug: "science", label: "Science" }],
    creators: [],
    ...overrides,
  } as Event;
}

export function tagFixture(overrides: Partial<Tag> = {}): Tag {
  return {
    id: "745",
    slug: "nba",
    label: "NBA",
    ...overrides,
  } as Tag;
}

export function paginator<T>(page: {
  items: T;
  hasMore?: boolean;
  nextCursor?: string;
}) {
  const firstPage = {
    items: page.items,
    hasMore: page.hasMore ?? false,
    nextCursor: page.nextCursor,
  };
  const result = {
    firstPage: async () => firstPage,
    from() {
      return result;
    },
    async *[Symbol.asyncIterator]() {
      yield firstPage;
    },
  };
  return result;
}
