/**
 * Error thrown by {@link unwrap} (and the `expect`-style helpers) when called
 * on an `Err`. The original error value is preserved at `.cause` so callers
 * can recover it without parsing the message.
 */
export class ResultError<E = unknown> extends Error {
  public readonly cause: E;

  constructor(message: string, cause: E) {
    super(message);
    this.name = "ResultError";
    this.cause = cause;
    // Restore prototype for `instanceof` to work when transpiled to ES5.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
