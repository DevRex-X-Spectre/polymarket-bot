import { describe, expect, it } from "vitest";
import { createMarketDiscovery } from "../src/index.js";

const enabled = process.env.POLYMARKET_BOT_LIVE_NETWORK_TESTS === "true";

describe.skipIf(!enabled)("gamma live network (opt-in)", () => {
  it("lists one open market through the official public client", async () => {
    const discovery = createMarketDiscovery();
    const page = await discovery.listMarkets({ closed: false, pageSize: 1 });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items[0]?.identity.marketId.length).toBeGreaterThan(0);
    expect(page.items[0]?.source).toBe("gamma");
  }, 30_000);
});
