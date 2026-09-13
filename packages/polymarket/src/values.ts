export function asOptionalString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const text = String(value);
  return text.length > 0 ? text : null;
}

export function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function isoNow(date: Date): string {
  return date.toISOString();
}
