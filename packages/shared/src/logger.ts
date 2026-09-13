import { redactFields } from "./redact.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

function write(
  level: LogLevel,
  name: string,
  message: string,
  fields?: Record<string, unknown>,
): void {
  const entry: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    logger: name,
    message,
  };
  if (fields) {
    entry.fields = redactFields(fields);
  }
  const line = JSON.stringify(entry);
  if (level === "error") {
    process.stderr.write(`${line}\n`);
    return;
  }
  process.stdout.write(`${line}\n`);
}

export function createLogger(name: string): Logger {
  return {
    debug: (message, fields) => write("debug", name, message, fields),
    info: (message, fields) => write("info", name, message, fields),
    warn: (message, fields) => write("warn", name, message, fields),
    error: (message, fields) => write("error", name, message, fields),
  };
}
