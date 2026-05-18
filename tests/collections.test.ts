import { all, any, partition } from "../src/collections";
import { err, ok } from "../src/constructors";

describe("all (fail-fast sequence)", () => {
  test("returns Ok of values when every entry is Ok", () => {
    expect(all([ok(1), ok(2), ok(3)])).toEqual(ok([1, 2, 3]));
  });

  test("returns the first Err encountered", () => {
    expect(all([ok(1), err("nope"), ok(3)])).toEqual(err("nope"));
  });

  test("preserves order", () => {
    const result = all([ok("a"), ok("b"), ok("c")]);
    expect(result).toEqual(ok(["a", "b", "c"]));
  });

  test("empty array yields Ok empty array", () => {
    expect(all([])).toEqual(ok([]));
  });
});

describe("any (first Ok)", () => {
  test("returns the first Ok", () => {
    expect(any([err("a"), err("b"), ok(3)])).toEqual(ok(3));
  });

  test("returns the accumulated errors when no Ok exists", () => {
    expect(any([err("a"), err("b")])).toEqual(err(["a", "b"]));
  });

  test("empty array yields Err empty array", () => {
    expect(any([])).toEqual(err([]));
  });

  test("stops at the first Ok and does not accumulate later errors", () => {
    // The third entry's error string must not appear in the result.
    expect(any([err("a"), ok(1), err("c")])).toEqual(ok(1));
  });
});

describe("partition", () => {
  test("splits into parallel ok/err arrays", () => {
    expect(partition([ok(1), err("a"), ok(2), err("b")])).toEqual({
      ok: [1, 2],
      err: ["a", "b"],
    });
  });

  test("returns empty arrays for an empty input", () => {
    expect(partition([])).toEqual({ ok: [], err: [] });
  });

  test("preserves order within each bucket", () => {
    const result = partition([ok("a"), ok("b"), err("e1"), ok("c")]);
    expect(result.ok).toEqual(["a", "b", "c"]);
    expect(result.err).toEqual(["e1"]);
  });
});
