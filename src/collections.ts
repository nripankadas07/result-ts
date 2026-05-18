/** Collection helpers — `all`, `any`, `partition`. */

import { isOk } from "./constructors";
import type { Result } from "./types";

/**
 * Fail-fast sequence: walk a list of `Result`s and return either an `Ok`
 * containing every value (in order) or the first `Err` encountered.
 */
export function all<T, E>(
  results: ReadonlyArray<Result<T, E>>,
): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (!isOk(result)) {
      return result;
    }
    values.push(result.value);
  }
  return { kind: "ok", value: values };
}

/**
 * Return the first `Ok` in `results`. If every entry is `Err`, return an
 * `Err` carrying the *array* of accumulated errors (in original order).
 * `any([])` is an `Err` with an empty error list.
 */
export function any<T, E>(
  results: ReadonlyArray<Result<T, E>>,
): Result<T, E[]> {
  const errors: E[] = [];
  for (const result of results) {
    if (isOk(result)) {
      return result;
    }
    errors.push(result.error);
  }
  return { kind: "err", error: errors };
}

/**
 * Split a list of `Result`s into two parallel arrays of values and errors.
 * Useful when you want to keep going past the first failure.
 */
export function partition<T, E>(
  results: ReadonlyArray<Result<T, E>>,
): { ok: T[]; err: E[] } {
  const okValues: T[] = [];
  const errValues: E[] = [];
  for (const result of results) {
    if (isOk(result)) {
      okValues.push(result.value);
    } else {
      errValues.push(result.error);
    }
  }
  return { ok: okValues, err: errValues };
}
