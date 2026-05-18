import { err, ok } from "../src/constructors";
import { ResultError } from "../src/errors";
import {
  unwrap,
  unwrapErr,
  unwrapOr,
  unwrapOrElse,
} from "../src/unwrap";

describe("unwrap", () => {
  test("returns the value on Ok", () => {
    expect(unwrap(ok(42))).toBe(42);
  });

  test("throws ResultError on Err", () => {
    expect(() => unwrap(err("boom"))).toThrow(ResultError);
  });

  test("throw message includes the stringified error", () => {
    expect(() => unwrap(err("boom"))).toThrow(/boom/);
  });

  test("Error.cause carries the original error value", () => {
    try {
      unwrap(err({ code: "FOO" }));
      fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ResultError);
      expect((e as ResultError<{ code: string }>).cause).toEqual({ code: "FOO" });
    }
  });

  test("uses .message when error is itself an Error instance", () => {
    expect(() => unwrap(err(new Error("inner")))).toThrow(/inner/);
  });

  test("falls back to String() for non-Error errors", () => {
    expect(() => unwrap(err(123))).toThrow(/123/);
  });

  test("ResultError unprintable error path", () => {
    // An object whose toString throws can't be stringified — describeError
    // should swallow the throw and return a sentinel.
    const weird = {
      toString() {
        throw new Error("nope");
      },
    };
    try {
      unwrap(err(weird));
      fail("expected throw");
    } catch (e) {
      expect((e as ResultError<unknown>).message).toMatch(/unprintable/);
    }
  });
});

describe("unwrapErr", () => {
  test("returns the error on Err", () => {
    expect(unwrapErr(err("bad"))).toBe("bad");
  });

  test("throws ResultError on Ok", () => {
    expect(() => unwrapErr(ok(1))).toThrow(ResultError);
  });

  test("Error.cause carries the original Ok value", () => {
    try {
      unwrapErr(ok({ id: 1 }));
      fail("expected throw");
    } catch (e) {
      expect((e as ResultError<{ id: number }>).cause).toEqual({ id: 1 });
    }
  });

  test("unwrapErr throw message stringifies the success value", () => {
    expect(() => unwrapErr(ok(99))).toThrow(/99/);
  });
});

describe("unwrapOr", () => {
  test("returns the value on Ok", () => {
    expect(unwrapOr(ok(1), 99)).toBe(1);
  });

  test("returns the fallback on Err", () => {
    expect(unwrapOr(err("x"), 99)).toBe(99);
  });
});

describe("unwrapOrElse", () => {
  test("returns the value on Ok", () => {
    expect(unwrapOrElse(ok(1), () => 99)).toBe(1);
  });

  test("computes a fallback from the error on Err", () => {
    expect(unwrapOrElse(err("hello"), (e) => e.length)).toBe(5);
  });

  test("does not invoke the callback on Ok", () => {
    const fn = jest.fn(() => 0);
    unwrapOrElse(ok(1), fn);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("ResultError", () => {
  test("instanceof works after transpilation", () => {
    const e = new ResultError("msg", "cause");
    expect(e).toBeInstanceOf(ResultError);
    expect(e).toBeInstanceOf(Error);
  });

  test("name is set to ResultError", () => {
    const e = new ResultError("msg", "cause");
    expect(e.name).toBe("ResultError");
  });
});
