export class FailClosedError extends Error {
  readonly code: string;

  constructor(message: string, code = "FAIL_CLOSED") {
    super(message);
    this.name = "FailClosedError";
    this.code = code;
  }
}
