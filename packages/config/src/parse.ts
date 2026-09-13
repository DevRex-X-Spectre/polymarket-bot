import {
  DEFAULT_OPERATING_MODE,
  isOperatingMode,
  type OperatingMode,
} from "@polymarket-bot/shared";
import { ConfigError } from "./errors.js";
import { NODE_ENVS, type NodeEnv } from "./types.js";

export function parseMode(raw: string | undefined): OperatingMode {
  if (raw === undefined || raw.trim() === "") {
    return DEFAULT_OPERATING_MODE;
  }
  const value = raw.trim().toLowerCase();
  if (!isOperatingMode(value)) {
    throw new ConfigError(
      `Invalid POLYMARKET_BOT_MODE "${raw}". Expected research, paper, or live.`,
    );
  }
  return value;
}

export function parseNodeEnv(raw: string | undefined): NodeEnv {
  if (raw === undefined || raw.trim() === "") {
    return "development";
  }
  const value = raw.trim().toLowerCase();
  if (!(NODE_ENVS as readonly string[]).includes(value)) {
    throw new ConfigError(
      `Invalid NODE_ENV "${raw}". Expected development, test, or production.`,
    );
  }
  return value as NodeEnv;
}

export function parseBoolean(
  raw: string | undefined,
  defaultValue: boolean,
): boolean {
  if (raw === undefined || raw.trim() === "") {
    return defaultValue;
  }
  const value = raw.trim().toLowerCase();
  if (value === "true" || value === "1" || value === "yes") {
    return true;
  }
  if (value === "false" || value === "0" || value === "no") {
    return false;
  }
  throw new ConfigError(
    `Invalid boolean "${raw}". Expected true, false, 1, 0, yes, or no.`,
  );
}
