import { describe, expect, it } from "vitest";
import { isSensitiveKey, redactFields, redactValue } from "../src/redact.js";

describe("redact", () => {
  it("detects credential-like keys", () => {
    expect(isSensitiveKey("privateKey")).toBe(true);
    expect(isSensitiveKey("POLYMARKET_API_SECRET")).toBe(true);
    expect(isSensitiveKey("password")).toBe(true);
    expect(isSensitiveKey("mode")).toBe(false);
    expect(isSensitiveKey("nodeEnv")).toBe(false);
    expect(isSensitiveKey("tokenId")).toBe(false);
  });

  it("redacts sensitive values but leaves empty values unchanged", () => {
    expect(redactValue("apiKey", "abc123")).toBe("[REDACTED]");
    expect(redactValue("apiKey", "")).toBe("");
    expect(redactValue("mode", "research")).toBe("research");
  });

  it("redacts nested sensitive fields", () => {
    const redacted = redactFields({
      mode: "research",
      wallet: {
        privateKey: "0xabc",
        passphrase: "hidden",
        address: "0x123",
      },
    });
    expect(redacted.mode).toBe("research");
    expect(redacted.wallet).toEqual({
      privateKey: "[REDACTED]",
      passphrase: "[REDACTED]",
      address: "0x123",
    });
  });

  it("redacts an entire object when the parent key is sensitive", () => {
    const redacted = redactFields({
      credentials: { privateKey: "0xabc", passphrase: "hidden" },
    });
    expect(redacted.credentials).toBe("[REDACTED]");
  });
});
