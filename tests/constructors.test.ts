import { ok, err, isOk, isErr } from "../src/constructors";

describe("ok / err", () => {
  test("ok wraps a value in the success variant", () => {
    expect(ok(42)).toEqual({ kind: "ok", value: 42 });
  });

  test("err wraps an error in the failure variant", () => {
    expect(err("nope")).toEqual({ kind: "err", error: "nope" });
  });

  test("ok preserves falsy values", () => {
    expect(ok(0).value).toBe(0);
    expect(ok("").value).toBe("");
    expect(ok(false).value).toBe(false);
    expect(ok(null).value).toBeNull();
    expect(ok(undefined).value).toBeUndefined();
  });

  test("err preserves falsy errors", () => {
    expect(err(0).error).toBe(0);
    expect(err("").error).toBe("");
    expect(err(null).error).toBeNull();
  });

  test("ok wraps nested Results without flattening", () => {
    const inner = ok(1);
    const outer = ok(inner);
    expect(outer.value).toBe(inner);
  });
});

describe("isOk / isErr", () => {
  test("isOk discriminates Ok from Err", () => {
    expect(isOk(ok(1))).toBe(true);
    expect(isOk(err("x"))).toBe(false);
  });

  test("isErr discriminates Err from Ok", () => {
    expect(isErr(err("x"))).toBe(true);
    expect(isErr(ok(1))).toBe(false);
  });

  test("isOk narrows the type for the compiler", () => {
    const result = Math.random() > 2 ? ok(1) : err("x");
    if (isOk(result)) {
      // TypeScript should accept this without a cast.
      expect(typeof result.value).toBe("number");
    } else {
      expect(typeof result.error).toBe("string");
    }
  });
});
