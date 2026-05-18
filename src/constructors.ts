/** Constructors and discriminator predicates for {@link Result}. */

import type { Err, Ok, Result } from "./types";

/** Build an `Ok` variant carrying `value`. */
export function ok<T>(value: T): Ok<T> {
  return { kind: "ok", value };
}

/** Build an `Err` variant carrying `error`. */
export function err<E>(error: E): Err<E> {
  return { kind: "err", error };
}

/** Type guard: narrows `Result<T, E>` to `Ok<T>` when true. */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.kind === "ok";
}

/** Type guard: narrows `Result<T, E>` to `Err<E>` when true. */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.kind === "err";
}
