import { FailClosedError } from "@polymarket-bot/shared";

export class ConfigError extends FailClosedError {
  constructor(message: string) {
    super(message, "CONFIG_INVALID");
    this.name = "ConfigError";
  }
}
