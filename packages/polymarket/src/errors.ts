export class DiscoveryError extends Error {
  readonly code: string;

  constructor(message: string, code: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DiscoveryError";
    this.code = code;
  }
}
