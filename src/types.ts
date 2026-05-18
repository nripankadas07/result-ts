/**
 * Core types for the `Result<T, E>` discriminated union.
 *
 * Every `Result` has a literal `kind` tag, enabling TypeScript's control-flow
 * narrowing inside `if (r.kind === "ok") { ... }` blocks. The same narrowing
 * works through the {@link isOk} / {@link isErr} predicates.
 */

/** Successful variant carrying a value of type `T`. */
export interface Ok<T> {
  readonly kind: "ok";
  readonly value: T;
}

/** Failure variant carrying an error of type `E`. */
export interface Err<E> {
  readonly kind: "err";
  readonly error: E;
}

/** Discriminated union of {@link Ok} and {@link Err}. */
export type Result<T, E> = Ok<T> | Err<E>;
