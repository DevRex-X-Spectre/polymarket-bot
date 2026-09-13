import type { OperatingMode } from "@polymarket-bot/shared";

export const NODE_ENVS = ["development", "test", "production"] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];

export interface AppConfig {
  readonly mode: OperatingMode;
  readonly liveTradingEnabled: boolean;
  readonly nodeEnv: NodeEnv;
}

export interface PublicConfig {
  readonly mode: OperatingMode;
  readonly liveTradingEnabled: boolean;
  readonly nodeEnv: NodeEnv;
  readonly canSubmitLiveOrders: false;
}

export type EnvSource = Record<string, string | undefined>;
