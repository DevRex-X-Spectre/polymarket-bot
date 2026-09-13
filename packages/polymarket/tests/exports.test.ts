import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as polymarket from "../src/index.js";

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

describe("polymarket package exports", () => {
  it("does not export SecureClient construction", () => {
    expect("createSecureClient" in polymarket).toBe(false);
    expect("createGammaPublicClient" in polymarket).toBe(true);
    expect("createMarketDiscovery" in polymarket).toBe(true);
  });

  it("does not import createSecureClient in source", () => {
    const files = ["client.ts", "discovery.ts", "index.ts", "normalize.ts"];
    for (const file of files) {
      const source = readFileSync(path.join(srcDir, file), "utf8");
      expect(source).not.toMatch(/createSecureClient/);
    }
  });
});
