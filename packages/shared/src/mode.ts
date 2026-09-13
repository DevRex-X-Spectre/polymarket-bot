export const OPERATING_MODES = ["research", "paper", "live"] as const;

export type OperatingMode = (typeof OPERATING_MODES)[number];

export const DEFAULT_OPERATING_MODE: OperatingMode = "research";

export function isOperatingMode(value: string): value is OperatingMode {
  return (OPERATING_MODES as readonly string[]).includes(value);
}
