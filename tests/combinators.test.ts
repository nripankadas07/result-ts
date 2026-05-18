import {
  map,
  mapErr,
  flatMap,
  andThen,
  orElse,
  match,
} from "../src/combinators";
import { err, ok } from "../src/constructors";

describe("map", () => {
  test("transforms the inner Ok value", () => {
    expect(map(ok(2), (n) => n * 3)).toEqual(ok(6));
  });

  test("leaves Err untouched", () => {
    const r = err<string>("boom");
    expect(map(r, (n: number) => n * 2)).toEqual(err("boom"));
  });

  test("does not invoke the callback on Err", () => {
    const fn = jest.fn((n: number) => n + 1);
    map(err("x"), fn);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("mapErr", () => {
  test("transforms the inner Err error", () => {
    expect(mapErr(err("boom"), (e) => `wrapped: ${e}`)).toEqual(
      err("wrapped: boom"),
    );
  });

  test("leaves Ok untouched", () => {
    expect(mapErr(ok(1), (e: string) => e.length)).toEqual(ok(1));
  });

  test("does not invoke the callback on Ok", () => {
    const fn = jest.fn((e: string) => e.length);
    mapErr(ok(1), fn);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("flatMap / andThen", () => {
  test("chains another Result-producing function on Ok", () => {
    expect(flatMap(ok(2), (n) => ok(n + 1))).toEqual(ok(3));
  });

  test("propagates the original Err", () => {
    expect(flatMap(err("a"), (n: number) => ok(n + 1))).toEqual(err("a"));
  });

  test("propagates an Err produced by the callback", () => {
    expect(flatMap(ok(2), (_n) => err("downstream"))).toEqual(err("downstream"));
  });

  test("andThen is an alias for flatMap", () => {
    expect(andThen(ok(2), (n) => ok(n + 1))).toEqual(ok(3));
  });
});

describe("orElse", () => {
  test("leaves Ok untouched", () => {
    expect(orElse(ok(5), (_e: string) => ok(0))).toEqual(ok(5));
  });

  test("calls the recovery on Err", () => {
    expect(orElse(err("bad"), (e) => ok(e.length))).toEqual(ok(3));
  });

  test("can return another Err with a new error type", () => {
    expect(orElse(err("bad"), (e) => err(e.length))).toEqual(err(3));
  });
});

describe("match", () => {
  test("calls the ok arm on Ok", () => {
    const result = match(ok(2), {
      ok: (n) => `value=${n}`,
      err: (e: string) => `error=${e}`,
    });
    expect(result).toBe("value=2");
  });

  test("calls the err arm on Err", () => {
    const result = match(err("bad"), {
      ok: (n: number) => `value=${n}`,
      err: (e) => `error=${e}`,
    });
    expect(result).toBe("error=bad");
  });

  test("arms may return different types — union is the result", () => {
    const result = match(ok(1), {
      ok: (n) => n,
      err: (_e: string) => "fallback",
    });
    expect(result).toBe(1);
  });
});
