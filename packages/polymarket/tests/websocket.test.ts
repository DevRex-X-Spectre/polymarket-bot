import { describe, expect, it, vi } from "vitest";
import {
  createMarketWebSocketAdapter,
  parseMarketStreamMessage,
  POLYMARKET_MARKET_WS_URL,
  type CloseDetails,
  type MarketStreamEvent,
  type MarketWebSocketLike,
} from "../src/index.js";

class MockWebSocket implements MarketWebSocketLike {
  readonly sent: string[] = [];
  closed = false;
  closeCode = 1000;
  closeReason = "";

  private listeners: Record<string, ((event: any) => void)[]> = {
    open: [],
    message: [],
    error: [],
    close: [],
  };

  constructor(public readonly url: string) {}

  send(data: string): void {
    this.sent.push(data);
  }

  close(code = 1000, reason = ""): void {
    this.closed = true;
    this.closeCode = code;
    this.closeReason = reason;
    this.emit("close", { code, reason, wasClean: code === 1000 });
  }

  addEventListener(type: string, listener: (event: any) => void): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void): void {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
    }
  }

  emit(type: "open", event?: unknown): void;
  emit(type: "message", event: { data: unknown }): void;
  emit(type: "error", event: unknown): void;
  emit(type: "close", event: { code: number; reason: string; wasClean: boolean }): void;
  emit(type: string, event: unknown = {}): void {
    for (const listener of this.listeners[type] ?? []) {
      listener(event);
    }
  }
}

describe("parseMarketStreamMessage", () => {
  it("ignores PONG heartbeat response", () => {
    expect(parseMarketStreamMessage("PONG")).toBeNull();
  });

  it("parses valid book event with decimal normalization", () => {
    const raw = JSON.stringify({
      event_type: "book",
      asset_id: "token-1",
      market: "0xcond1",
      bids: [{ price: ".48", size: "100" }],
      asks: [{ price: "0.52", size: "250" }],
      timestamp: 1710000000,
      hash: "0xhash1",
    });
    const parsed = parseMarketStreamMessage(raw);
    expect(parsed).toEqual({
      eventType: "book",
      assetId: "token-1",
      market: "0xcond1",
      bids: [{ price: "0.48", size: "100" }],
      asks: [{ price: "0.52", size: "250" }],
      timestamp: "1710000000",
      hash: "0xhash1",
    });
  });

  it("parses valid price_change event including level removal (size: '0')", () => {
    const raw = JSON.stringify({
      event_type: "price_change",
      market: "0xcond1",
      price_changes: [
        {
          asset_id: "token-1",
          price: "0.50",
          size: "0",
          side: "BUY",
          hash: "0xabc",
          best_bid: "0.49",
          best_ask: "0.51",
        },
      ],
      timestamp: "1710000005",
    });
    const parsed = parseMarketStreamMessage(raw);
    expect(parsed).toEqual({
      eventType: "price_change",
      market: "0xcond1",
      priceChanges: [
        {
          assetId: "token-1",
          price: "0.50",
          size: "0",
          side: "BUY",
          hash: "0xabc",
          bestBid: "0.49",
          bestAsk: "0.51",
        },
      ],
      timestamp: "1710000005",
    });
  });

  it("parses last_trade_price event", () => {
    const raw = JSON.stringify({
      event_type: "last_trade_price",
      asset_id: "token-1",
      market: "0xcond1",
      price: "0.55",
      size: "20",
      side: "BUY",
      fee_rate_bps: "0",
      timestamp: "1710000010",
    });
    const parsed = parseMarketStreamMessage(raw);
    expect(parsed).toEqual({
      eventType: "last_trade_price",
      assetId: "token-1",
      market: "0xcond1",
      price: "0.55",
      size: "20",
      side: "BUY",
      feeRateBps: "0",
      timestamp: "1710000010",
    });
  });

  it("parses tick_size_change event", () => {
    const raw = JSON.stringify({
      event_type: "tick_size_change",
      asset_id: "token-1",
      market: "0xcond1",
      old_tick_size: "0.01",
      new_tick_size: "0.001",
      timestamp: "1710000020",
    });
    const parsed = parseMarketStreamMessage(raw);
    expect(parsed).toEqual({
      eventType: "tick_size_change",
      assetId: "token-1",
      market: "0xcond1",
      oldTickSize: "0.01",
      newTickSize: "0.001",
      timestamp: "1710000020",
    });
  });

  it("parses best_bid_ask event", () => {
    const raw = JSON.stringify({
      event_type: "best_bid_ask",
      asset_id: "token-1",
      market: "0xcond1",
      best_bid: ".49",
      best_ask: ".51",
      spread: ".02",
      timestamp: "1710000030",
    });
    const parsed = parseMarketStreamMessage(raw);
    expect(parsed).toEqual({
      eventType: "best_bid_ask",
      assetId: "token-1",
      market: "0xcond1",
      bestBid: "0.49",
      bestAsk: "0.51",
      spread: "0.02",
      timestamp: "1710000030",
    });
  });

  it("parses new_market event", () => {
    const raw = JSON.stringify({
      event_type: "new_market",
      market: "0xcond2",
      question: "Will BTC hit 100k?",
      assets_ids: ["token-a", "token-b"],
      outcomes: ["Yes", "No"],
      timestamp: "1710000040",
    });
    const parsed = parseMarketStreamMessage(raw);
    expect(parsed).toEqual({
      eventType: "new_market",
      market: "0xcond2",
      question: "Will BTC hit 100k?",
      assetIds: ["token-a", "token-b"],
      outcomes: ["Yes", "No"],
      timestamp: "1710000040",
    });
  });

  it("parses market_resolved event", () => {
    const raw = JSON.stringify({
      event_type: "market_resolved",
      market: "0xcond2",
      winning_asset_id: "token-a",
      winning_outcome: "Yes",
      timestamp: "1710000050",
    });
    const parsed = parseMarketStreamMessage(raw);
    expect(parsed).toEqual({
      eventType: "market_resolved",
      market: "0xcond2",
      winningAssetId: "token-a",
      winningOutcome: "Yes",
      timestamp: "1710000050",
    });
  });

  it("safely handles unknown event types", () => {
    const raw = JSON.stringify({
      event_type: "some_future_event",
      custom_field: 123,
    });
    const parsed = parseMarketStreamMessage(raw);
    expect(parsed).toEqual({
      eventType: "unknown",
      rawType: "some_future_event",
      payload: {
        event_type: "some_future_event",
        custom_field: 123,
      },
    });
  });

  it("safely handles malformed non-JSON strings", () => {
    const parsed = parseMarketStreamMessage("not-json");
    expect(parsed).toEqual({
      eventType: "malformed",
      reason: "INVALID_JSON",
      raw: "not-json",
    });
  });

  it("safely handles missing event type", () => {
    const parsed = parseMarketStreamMessage(JSON.stringify({ some: "data" }));
    expect(parsed).toMatchObject({
      eventType: "malformed",
      reason: "MISSING_EVENT_TYPE",
    });
  });

  it("safely handles malformed book with invalid prices", () => {
    const raw = JSON.stringify({
      event_type: "book",
      asset_id: "token-1",
      market: "0xcond1",
      bids: [{ price: "not-a-number", size: "100" }],
      asks: [],
    });
    const parsed = parseMarketStreamMessage(raw);
    expect(parsed).toMatchObject({
      eventType: "malformed",
      reason: "INVALID_BOOK_PAYLOAD",
    });
  });
});

describe("createMarketWebSocketAdapter", () => {
  it("connects and sends initial subscription on open", async () => {
    let mockWs!: MockWebSocket;
    const adapter = createMarketWebSocketAdapter({
      createWebSocket: (url) => {
        mockWs = new MockWebSocket(url);
        return mockWs;
      },
      heartbeatIntervalMs: 10_000,
    });

    adapter.subscribe(["token-1", "token-2"]);
    const connectPromise = adapter.connect();

    expect(mockWs.url).toBe(POLYMARKET_MARKET_WS_URL);
    expect(adapter.isConnected()).toBe(false);

    // Simulate open
    mockWs.emit("open");
    await connectPromise;

    expect(adapter.isConnected()).toBe(true);
    expect(mockWs.sent).toContain(
      JSON.stringify({
        type: "market",
        assets_ids: ["token-1", "token-2"],
        custom_feature_enabled: true,
      }),
    );
  });

  it("sends dynamic subscribe and unsubscribe operations while connected", async () => {
    let mockWs!: MockWebSocket;
    const adapter = createMarketWebSocketAdapter({
      createWebSocket: (url) => {
        mockWs = new MockWebSocket(url);
        return mockWs;
      },
    });

    const connectPromise = adapter.connect();
    mockWs.emit("open");
    await connectPromise;

    adapter.subscribe(["token-dynamic"]);
    expect(mockWs.sent).toContain(
      JSON.stringify({
        assets_ids: ["token-dynamic"],
        operation: "subscribe",
        custom_feature_enabled: true,
      }),
    );
    expect(adapter.getSubscribedAssets()).toEqual(["token-dynamic"]);

    adapter.unsubscribe(["token-dynamic"]);
    expect(mockWs.sent).toContain(
      JSON.stringify({
        assets_ids: ["token-dynamic"],
        operation: "unsubscribe",
      }),
    );
    expect(adapter.getSubscribedAssets()).toEqual([]);
  });

  it("dispatches parsed events to registered onEvent listeners", async () => {
    let mockWs!: MockWebSocket;
    const adapter = createMarketWebSocketAdapter({
      createWebSocket: (url) => {
        mockWs = new MockWebSocket(url);
        return mockWs;
      },
    });

    const events: MarketStreamEvent[] = [];
    const unsubscribe = adapter.onEvent((event) => events.push(event));

    const connectPromise = adapter.connect();
    mockWs.emit("open");
    await connectPromise;

    mockWs.emit("message", {
      data: JSON.stringify({
        event_type: "last_trade_price",
        asset_id: "token-1",
        price: "0.55",
        size: "10",
        side: "BUY",
      }),
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      eventType: "last_trade_price",
      assetId: "token-1",
      price: "0.55",
    });

    unsubscribe();
    mockWs.emit("message", {
      data: JSON.stringify({
        event_type: "last_trade_price",
        asset_id: "token-1",
        price: "0.56",
        size: "5",
        side: "SELL",
      }),
    });
    // Should not receive second event after unsubscribe
    expect(events).toHaveLength(1);
  });

  it("sends PING heartbeat at configured interval", async () => {
    vi.useFakeTimers();
    try {
      let mockWs!: MockWebSocket;
      const adapter = createMarketWebSocketAdapter({
        createWebSocket: (url) => {
          mockWs = new MockWebSocket(url);
          return mockWs;
        },
        heartbeatIntervalMs: 5000,
      });

      const connectPromise = adapter.connect();
      mockWs.emit("open");
      await connectPromise;

      expect(mockWs.sent).not.toContain("PING");

      vi.advanceTimersByTime(5000);
      expect(mockWs.sent).toContain("PING");

      adapter.disconnect();
    } finally {
      vi.useRealTimers();
    }
  });

  it("handles connection failure cleanly", async () => {
    const adapter = createMarketWebSocketAdapter({
      createWebSocket: () => {
        throw new Error("Network unreachable");
      },
    });

    const errors: Error[] = [];
    adapter.onError((err) => errors.push(err));

    await expect(adapter.connect()).rejects.toThrow("Network unreachable");
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toBe("Network unreachable");
    expect(adapter.isConnected()).toBe(false);
  });

  it("handles clean disconnect and stops heartbeat", async () => {
    let mockWs!: MockWebSocket;
    const adapter = createMarketWebSocketAdapter({
      createWebSocket: (url) => {
        mockWs = new MockWebSocket(url);
        return mockWs;
      },
    });

    const closeEvents: CloseDetails[] = [];
    adapter.onClose((details) => closeEvents.push(details));

    const connectPromise = adapter.connect();
    mockWs.emit("open");
    await connectPromise;

    adapter.disconnect();
    expect(adapter.isConnected()).toBe(false);
  });

  it("handles remote close event", async () => {
    let mockWs!: MockWebSocket;
    const adapter = createMarketWebSocketAdapter({
      createWebSocket: (url) => {
        mockWs = new MockWebSocket(url);
        return mockWs;
      },
    });

    const closeEvents: CloseDetails[] = [];
    adapter.onClose((details) => closeEvents.push(details));

    const connectPromise = adapter.connect();
    mockWs.emit("open");
    await connectPromise;

    mockWs.emit("close", { code: 1006, reason: "Abnormal Closure", wasClean: false });
    expect(adapter.isConnected()).toBe(false);
    expect(closeEvents).toEqual([
      { code: 1006, reason: "Abnormal Closure", wasClean: false },
    ]);
  });

  it("preserves read-only safety boundary: no trade/order methods exist", () => {
    const adapter = createMarketWebSocketAdapter();
    expect("createOrder" in adapter).toBe(false);
    expect("cancelOrder" in adapter).toBe(false);
    expect("signOrder" in adapter).toBe(false);
    expect("placeOrder" in adapter).toBe(false);
  });
});
