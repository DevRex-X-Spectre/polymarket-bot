import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@polymarket-bot/shared": path.join(root, "packages/shared/src/index.ts"),
      "@polymarket-bot/config": path.join(root, "packages/config/src/index.ts"),
      "@polymarket-bot/market-models": path.join(
        root,
        "packages/market-models/src/index.ts",
      ),
      "@polymarket-bot/polymarket": path.join(
        root,
        "packages/polymarket/src/index.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: [
      "packages/*/tests/**/*.test.ts",
      "apps/*/tests/**/*.test.ts",
      "tests/**/*.test.ts",
    ],
    env: {
      POLYMARKET_BOT_MODE: "research",
      POLYMARKET_BOT_LIVE_TRADING_ENABLED: "false",
    },
  },
});
