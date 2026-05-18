/** Extractors that pull the inner value out of a `Result`. */

import { isOk } from "./constructors";
import { ResultError } from "./errors";
import type { Result } from "./types";

/**
 * Return the inner value if `result` is `Ok`. Throws a {@link ResultError}
 * if `result` is `Err` — the original error is preserved at `.cause`.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isOk(result)) {
    return result.value;
  }
  throw new ResultError<E>(
    `unwrap called on Err: ${describeError(result.error)}`,
    result.error,
  );
}

/**
 * Return the inner error if `result` is `Err`. Throws a {@link ResultError}
 * if `result` is `Ok` — the original success value is preserved at `.cause`.
 */
export function unwrapErr<T, E>(result: Result<T, E>): E {
  if (!isOk(result)) {
    return result.error;
  }
  throw new ResultError<T>(
    `unwrapErr called on Ok: ${describeError(result.value)}`,
    result.value,
  );
}

/** Return the inner value or `fallback` if `result` is `Err`. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return isOk(result) ? result.value : fallback;
}

/** Return the inner value or call `fn` to compute a fallback from the error. */
export function unwrapOrElse<T, E>(
  result: Result<T, E>,
  fn: (error: E) => T,
): T {
  return isOk(result) ? result.value : fn(result.error);
}

function describeError(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }
  try {
    return String(value);
  } catch {
    return "<unprintable error>";
  }
}
