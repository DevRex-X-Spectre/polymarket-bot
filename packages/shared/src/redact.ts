const SENSITIVE_NAMES = [
  "private_key",
  "api_key",
  "api_secret",
  "secret",
  "password",
  "passphrase",
  "mnemonic",
  "credential",
  "credentials",
  "authorization",
  "cookie",
  "access_token",
  "refresh_token",
  "seed",
] as const;

export function normalizeKeyName(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase();
}

export function isSensitiveKey(key: string): boolean {
  const normalized = normalizeKeyName(key);
  return SENSITIVE_NAMES.some(
    (name) =>
      normalized === name ||
      normalized.endsWith(`_${name}`) ||
      normalized.startsWith(`${name}_`) ||
      normalized.includes(`_${name}_`),
  );
}

export function redactValue(key: string, value: unknown): unknown {
  if (!isSensitiveKey(key)) {
    return value;
  }
  if (value === undefined || value === null || value === "") {
    return value;
  }
  return "[REDACTED]";
}

export function redactFields(
  fields: Record<string, unknown>,
): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      redacted[key] = isSensitiveKey(key)
        ? "[REDACTED]"
        : redactFields(value as Record<string, unknown>);
    } else {
      redacted[key] = redactValue(key, value);
    }
  }
  return redacted;
}
