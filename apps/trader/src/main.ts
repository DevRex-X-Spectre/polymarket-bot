import { loadConfig, toPublicConfig } from "@polymarket-bot/config";
import { createLogger, type OperatingMode } from "@polymarket-bot/shared";
import { startTrader } from "./app.js";

const logger = createLogger("trader");

export interface TraderRunResult {
  readonly ok: true;
  readonly mode: OperatingMode;
}

export function run(env: NodeJS.ProcessEnv = process.env): TraderRunResult {
  const config = loadConfig(env);
  logger.info("starting trader", { ...toPublicConfig(config) });
  const started = startTrader(config);
  logger.info("trader started", {
    mode: started.mode,
    status: started.status,
    liveOrderSubmission: started.liveOrderSubmission,
  });
  return { ok: true, mode: started.mode };
}

function isDirectExecution(): boolean {
  const invoked = process.argv[1];
  if (!invoked) {
    return false;
  }
  return /main\.(js|ts)$/.test(invoked.replaceAll("\\", "/"));
}

if (isDirectExecution()) {
  try {
    run();
  } catch (error) {
    logger.error("trader failed to start", {
      error: error instanceof Error ? error.message : "unknown",
    });
    process.exitCode = 1;
  }
}
