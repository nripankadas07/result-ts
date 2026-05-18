/** `tryCatch`-style adapters that capture exceptions as `Result` values. */

import type { Result } from "./types";

/** Default mapper used by `tryCatch` / `fromPromise` when none is supplied. */
function defaultMapper(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Run `fn` and return its result wrapped in an `Ok`. Any thrown value is
 * caught and passed through `mapError` (defaulting to a wrap into `Error`),
 * then returned as an `Err`.
 */
export function tryCatch<T, E = Error>(
  fn: () => T,
  mapError?: (error: unknown) => E,
): Result<T, E> {
  try {
    return { kind: "ok", value: fn() };
  } catch (raw) {
    return { kind: "err", error: applyMapper<E>(raw, mapError) };
  }
}

/**
 * Run `fn` (sync *or* async) and capture the resulting Promise. A resolved
 * value becomes `Ok`; a thrown / rejected value becomes `Err` after going
 * through `mapError`.
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T> | T,
  mapError?: (error: unknown) => E,
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return { kind: "ok", value };
  } catch (raw) {
    return { kind: "err", error: applyMapper<E>(raw, mapError) };
  }
}

/** Convert a Promise into a `Result`, mapping rejection to `Error` by default. */
export async function fromPromise<T, E = Error>(
  promise: Promise<T>,
  mapError?: (error: unknown) => E,
): Promise<Result<T, E>> {
  return tryCatchAsync(() => promise, mapError);
}

/**
 * Lift a possibly-null/undefined value into a `Result`. `null` and
 * `undefined` become an `Err` carrying `errorValue`.
 */
export function fromNullable<T, E>(
  value: T | null | undefined,
  errorValue: E,
): Result<T, E> {
  return value === null || value === undefined
    ? { kind: "err", error: errorValue }
    : { kind: "ok", value };
}

function applyMapper<E>(raw: unknown, mapError?: (error: unknown) => E): E {
  if (mapError !== undefined) {
    return mapError(raw);
  }
  return defaultMapper(raw) as unknown as E;
}
