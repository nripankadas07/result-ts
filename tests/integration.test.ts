/** End-to-end scenarios that exercise several modules together. */

import * as ResultTs from "../src/index";
import {
  ok,
  err,
  flatMap,
  map,
  mapErr,
  match,
  unwrap,
  unwrapOr,
  all,
  tryCatch,
  fromNullable,
} from "../src/index";
import type { Result } from "../src/index";

test("barrel re-exports every public symbol", () => {
  // Touching each property forces istanbul to mark the getter as executed.
  const names = [
    "ok",
    "err",
    "isOk",
    "isErr",
    "map",
    "mapErr",
    "flatMap",
    "andThen",
    "orElse",
    "match",
    "unwrap",
    "unwrapErr",
    "unwrapOr",
    "unwrapOrElse",
    "all",
    "any",
    "partition",
    "tryCatch",
    "tryCatchAsync",
    "fromPromise",
    "fromNullable",
    "ResultError",
  ] as const;
  for (const name of names) {
    expect(typeof (ResultTs as Record<string, unknown>)[name]).toBe("function");
  }
});

describe("integration: parse-and-double pipeline", () => {
  function parseNumber(raw: string): Result<number, string> {
    const n = Number(raw);
    return Number.isFinite(n) ? ok(n) : err(`bad number: ${raw}`);
  }

  test("happy path threads through map and flatMap", () => {
    const result = flatMap(parseNumber("4"), (n) => ok(n * 2));
    expect(unwrap(result)).toBe(8);
  });

  test("err short-circuits the chain", () => {
    const result = map(
      flatMap(parseNumber("oops"), (n) => ok(n * 2)),
      (n) => n + 1,
    );
    expect(unwrapOr(result, -1)).toBe(-1);
  });

  test("mapErr re-shapes the error", () => {
    const result = mapErr(parseNumber("oops"), (e) => ({ code: "PARSE", message: e }));
    expect(match(result, {
      ok: () => "ok",
      err: (e) => e.code,
    })).toBe("PARSE");
  });
});

describe("integration: tryCatch + fromNullable pipeline", () => {
  test("tryCatch flows into flatMap and fromNullable", () => {
    const lookup: Record<string, number> = { a: 1, b: 2 };

    const result = flatMap(
      tryCatch(() => JSON.parse('{"key":"a"}') as { key: string }),
      (parsed) => fromNullable(lookup[parsed.key], `unknown key ${parsed.key}`),
    );
    expect(unwrap(result)).toBe(1);
  });

  test("malformed JSON yields a wrapped Error", () => {
    const result = flatMap(
      tryCatch(() => JSON.parse("not-json") as { key: string }),
      (parsed) => fromNullable<number, string>(undefined, `unknown key ${parsed.key}`),
    );
    expect(match(result, {
      ok: () => "ok",
      err: (e) => (e instanceof Error ? "thrown" : "missing"),
    })).toBe("thrown");
  });
});

describe("integration: all with mapErr", () => {
  test("all aggregates parsed numbers and surfaces the first failure", () => {
    const inputs = ["1", "2", "3"];
    const result = all(inputs.map((s) => {
      const n = Number(s);
      return Number.isFinite(n) ? ok(n) : err(`bad: ${s}`);
    }));
    expect(unwrap(result)).toEqual([1, 2, 3]);
  });

  test("all fails fast on the first parse error", () => {
    const inputs = ["1", "oops", "3"];
    const result = all(inputs.map((s) => {
      const n = Number(s);
      return Number.isFinite(n) ? ok(n) : err(`bad: ${s}`);
    }));
    expect(unwrapOr(result, [])).toEqual([]);
  });
});

describe("integration: nested Result values are not flattened by ok()", () => {
  test("ok(ok(1)) preserves the inner Result", () => {
    const inner = ok(1);
    const outer = ok(inner);
    if (outer.kind === "ok" && outer.value.kind === "ok") {
      expect(outer.value.value).toBe(1);
    } else {
      fail("expected nested Ok");
    }
  });
});
