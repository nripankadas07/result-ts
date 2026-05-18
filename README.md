# result-ts

Type-safe `Result<T, E>` for TypeScript. Model fallible computations
explicitly as a discriminated union of `Ok<T>` and `Err<E>`, with
combinators for transforming, chaining, recovering, and unwrapping —
plus sync and async exception capture.

## Features

- `Result<T, E>` discriminated union with literal `kind` tags
- Type guards `isOk` / `isErr` narrow inside conditionals
- Combinators — `map`, `mapErr`, `flatMap` (alias `andThen`), `orElse`,
  `match`
- Extractors — `unwrap`, `unwrapErr`, `unwrapOr`, `unwrapOrElse`
- Collection helpers — `all` (fail-fast sequence), `any` (first Ok),
  `partition`
- Exception capture — `tryCatch`, `tryCatchAsync`, `fromPromise`,
  `fromNullable`
- Custom `ResultError` with `.cause` preserving the original value
- Zero runtime dependencies, ships full TypeScript types
- `tsc --strict` clean (`exactOptionalPropertyTypes`,
  `noUnusedLocals`, `noUnusedParameters`)
- 100% line, branch, function, and statement coverage

## Install

```bash
npm install result-ts
```

## Usage

```ts
import { ok, err, flatMap, map, match, unwrapOr } from "result-ts";
import type { Result } from "result-ts";

function parseNumber(raw: string): Result<number, string> {
  const n = Number(raw);
  return Number.isFinite(n) ? ok(n) : err(`bad number: ${raw}`);
}

const doubled = flatMap(parseNumber("4"), (n) => ok(n * 2));
unwrapOr(doubled, 0); // 8

map(parseNumber("oops"), (n) => n * 2); // { kind: 'err', error: '...' }

match(parseNumber("4"), {
  ok: (n) => `value=${n}`,
  err: (e) => `bad: ${e}`,
}); // "value=4"
```

### Capturing exceptions

```ts
import { tryCatch, fromPromise, fromNullable } from "result-ts";

const parsed = tryCatch(() => JSON.parse(input) as User);
// Ok<User> or Err<Error>

const fetched = await fromPromise(fetch(url));
// Ok<Response> or Err<Error>

const found = fromNullable(map.get("k"), "not found");
// Ok<V> or Err<"not found">
```

### Collecting results

```ts
import { all, any, partition } from "result-ts";

all([ok(1), ok(2), ok(3)]);          // Ok<[1, 2, 3]>
all([ok(1), err("nope"), ok(3)]);    // Err<"nope">

any([err("a"), ok(2), ok(3)]);       // Ok<2>
any([err("a"), err("b")]);           // Err<["a", "b"]>

partition([ok(1), err("a"), ok(2)]); // { ok: [1, 2], err: ["a"] }
```

## API reference

| Function                 | Signature                                                                 |
| ------------------------ | ------------------------------------------------------------------------- |
| `ok(value)`              | `<T>(value: T) => Ok<T>`                                                  |
| `err(error)`             | `<E>(error: E) => Err<E>`                                                 |
| `isOk(result)`           | `<T, E>(r: Result<T, E>) => r is Ok<T>`                                   |
| `isErr(result)`          | `<T, E>(r: Result<T, E>) => r is Err<E>`                                  |
| `map(r, fn)`             | `<T, U, E>(r: Result<T, E>, fn: (v: T) => U) => Result<U, E>`             |
| `mapErr(r, fn)`          | `<T, E, F>(r: Result<T, E>, fn: (e: E) => F) => Result<T, F>`             |
| `flatMap(r, fn)`         | `<T, U, E, F>(r: Result<T, E>, fn: (v: T) => Result<U, F>) => Result<U, E\|F>` |
| `andThen`                | alias of `flatMap`                                                        |
| `orElse(r, fn)`          | `<T, E, F>(r: Result<T, E>, fn: (e: E) => Result<T, F>) => Result<T, F>`  |
| `match(r, {ok, err})`    | branch on the result and return the matched arm's value                   |
| `unwrap(r)`              | extract the Ok value, throw `ResultError` on Err                          |
| `unwrapErr(r)`           | extract the Err error, throw `ResultError` on Ok                          |
| `unwrapOr(r, fallback)`  | extract the Ok value or return `fallback`                                 |
| `unwrapOrElse(r, fn)`    | extract the Ok value or compute from the error                            |
| `all(results)`           | fail-fast sequence — `Result<T[], E>`                                     |
| `any(results)`           | first Ok or `Result<T, E[]>` of accumulated errors                        |
| `partition(results)`     | `{ ok: T[]; err: E[] }`                                                   |
| `tryCatch(fn, mapError?)`| sync exception → `Result<T, E>`                                           |
| `tryCatchAsync(fn, mapError?)` | sync/async exception → `Promise<Result<T, E>>`                      |
| `fromPromise(p, mapError?)` | `Promise<T>` → `Promise<Result<T, E>>`                                 |
| `fromNullable(v, errVal)` | `T \| null \| undefined` → `Result<T, E>`                                |

`ResultError<E>` — `Error` subclass thrown by `unwrap` / `unwrapErr`,
with `.cause` carrying the original value.

## Non-goals

- Iterator-style lazy semantics
- A "method" API (`result.map(...)`) — kept as plain functions to stay
  tree-shake-friendly and require no class machinery
- Custom JSON encoders/decoders

## Running tests

```bash
npm install
npm test
```

The test suite is jest + ts-jest, with 78 tests across six files and
100% statement / branch / function / line coverage enforced via
`coverageThreshold`.

## License

MIT — see [LICENSE](LICENSE).
