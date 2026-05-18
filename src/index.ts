/**
 * result-ts — type-safe `Result<T, E>` for TypeScript.
 *
 * `Result` is a discriminated union of `Ok<T>` and `Err<E>`. Use it to
 * model fallible computations explicitly, without throwing.
 *
 * @example
 * ```ts
 * import { ok, err, map, flatMap, unwrapOr } from "result-ts";
 *
 * const parseNumber = (raw: string) => {
 *   const n = Number(raw);
 *   return Number.isFinite(n) ? ok(n) : err(`bad number: ${raw}`);
 * };
 *
 * const doubled = flatMap(parseNumber("4"), (n) => ok(n * 2));
 * unwrapOr(doubled, 0); // 8
 *
 * map(parseNumber("oops"), (n) => n * 2); // { kind: 'err', error: ... }
 * ```
 */

export { ok, err, isOk, isErr } from "./constructors";
export {
  map,
  mapErr,
  flatMap,
  andThen,
  orElse,
  match,
} from "./combinators";
export {
  unwrap,
  unwrapErr,
  unwrapOr,
  unwrapOrElse,
} from "./unwrap";
export { all, any, partition } from "./collections";
export {
  tryCatch,
  tryCatchAsync,
  fromPromise,
  fromNullable,
} from "./capture";
export { ResultError } from "./errors";
export type { Ok, Err, Result } from "./types";
