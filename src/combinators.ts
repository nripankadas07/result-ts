/** Functional combinators over `Result`. */

import { isOk } from "./constructors";
import type { Result } from "./types";

/**
 * Apply `fn` to the value inside an `Ok`, leaving an `Err` untouched.
 * The error type is preserved.
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  return isOk(result)
    ? { kind: "ok", value: fn(result.value) }
    : result;
}

/**
 * Apply `fn` to the error inside an `Err`, leaving an `Ok` untouched.
 * The success type is preserved.
 */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> {
  return isOk(result)
    ? result
    : { kind: "err", error: fn(result.error) };
}

/**
 * Chain another fallible computation onto an `Ok`. Returns the input unchanged
 * if it is already an `Err`. Equivalent to monadic bind / "and-then".
 */
export function flatMap<T, U, E, F>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, F>,
): Result<U, E | F> {
  return isOk(result) ? fn(result.value) : result;
}

/** Alias for {@link flatMap}, for code that prefers the Rust-style name. */
export const andThen = flatMap;

/**
 * Provide a fallback when the input is `Err`. The success type is preserved
 * and the new error type is whatever the callback returns.
 */
export function orElse<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => Result<T, F>,
): Result<T, F> {
  return isOk(result) ? result : fn(result.error);
}

/**
 * Branch on `Result` and return the value produced by the matching arm.
 * The two arms may produce different types — the return type is the union.
 */
export function match<T, E, OkR, ErrR>(
  result: Result<T, E>,
  arms: { ok: (value: T) => OkR; err: (error: E) => ErrR },
): OkR | ErrR {
  return isOk(result) ? arms.ok(result.value) : arms.err(result.error);
}
