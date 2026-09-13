import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const SECRET_ASSIGNMENT =
  /(privateKey|apiSecret|passphrase|mnemonic)\s*=\s*["'][^"']+["']/i;

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (
      entry === "node_modules" ||
      entry === "dist" ||
      entry === ".git" ||
      entry === ".venv"
    ) {
      continue;
    }
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, acc);
    } else if (
      full.endsWith(".ts") ||
      full.endsWith(".py") ||
      full.endsWith(".json") ||
      full.endsWith(".md")
    ) {
      acc.push(full);
    }
  }
  return acc;
}

describe("secret hygiene", () => {
  it("does not embed credential literals in source, tests, or docs", () => {
    const files = walk(root).filter((file) => {
      const relative = path.relative(root, file);
      return !relative.startsWith("docs\\project-state\\CHANGELOG");
    });
    const violations: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      if (SECRET_ASSIGNMENT.test(source)) {
        violations.push(path.relative(root, file));
      }
    }
    expect(violations).toEqual([]);
  });
});
