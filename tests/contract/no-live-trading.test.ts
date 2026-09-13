import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LIVE_ORDER_SUBMISSION_IMPLEMENTED } from "@polymarket-bot/shared";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const FORBIDDEN_SOURCE_PATTERNS = [
  /\bplaceOrder\s*\(/,
  /\bpostOrder\s*\(/,
  /\bcreateAndPostOrder\s*\(/,
  /\bsubmitOrder\s*\(/,
  /\bcreateOrder\s*\(/,
  /\bcreateSecureClient\s*\(/,
  /\bplaceLimitOrder\s*\(/,
  /\bplaceMarketOrder\s*\(/,
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === ".git") {
      continue;
    }
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, acc);
    } else if (full.endsWith(".ts") && !full.endsWith(".test.ts")) {
      acc.push(full);
    }
  }
  return acc;
}

describe("no live trading capability", () => {
  it("keeps the live-order flag false", () => {
    expect(LIVE_ORDER_SUBMISSION_IMPLEMENTED).toBe(false);
  });

  it("does not contain order-submission call sites in application source", () => {
    const files = [
      ...walk(path.join(root, "apps")),
      ...walk(path.join(root, "packages")),
    ];
    const violations: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_SOURCE_PATTERNS) {
        if (pattern.test(source)) {
          violations.push(`${path.relative(root, file)} matches ${pattern}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("allows the official public client but not a root-level trading SDK", () => {
    const rootPkg = JSON.parse(
      readFileSync(path.join(root, "package.json"), "utf8"),
    ) as { dependencies?: Record<string, string> };
    expect(Object.keys(rootPkg.dependencies ?? {})).not.toContain(
      "@polymarket/client",
    );

    const adapterPkg = JSON.parse(
      readFileSync(
        path.join(root, "packages/polymarket/package.json"),
        "utf8",
      ),
    ) as { dependencies?: Record<string, string> };
    expect(adapterPkg.dependencies?.["@polymarket/client"]).toBeDefined();
  });
});
