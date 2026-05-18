import {
  tryCatch,
  tryCatchAsync,
  fromPromise,
  fromNullable,
} from "../src/capture";
import { isErr, isOk } from "../src/constructors";

describe("tryCatch (sync)", () => {
  test("captures a return value as Ok", () => {
    const result = tryCatch(() => 42);
    expect(result).toEqual({ kind: "ok", value: 42 });
  });

  test("captures a thrown Error as Err with the Error itself", () => {
    const result = tryCatch(() => {
      throw new Error("boom");
    });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe("boom");
    }
  });

  test("wraps a thrown non-Error in a default Error", () => {
    const result = tryCatch(() => {
      throw "string-throw";
    });
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe("string-throw");
    } else {
      fail("expected err");
    }
  });

  test("custom mapError replaces the default mapping", () => {
    const result = tryCatch(
      () => {
        throw new Error("boom");
      },
      (raw) => ({ code: "WRAPPED", raw }),
    );
    if (isErr(result)) {
      expect(result.error.code).toBe("WRAPPED");
      expect((result.error.raw as Error).message).toBe("boom");
    } else {
      fail("expected err");
    }
  });
});

describe("tryCatchAsync", () => {
  test("captures a resolved Promise as Ok", async () => {
    const result = await tryCatchAsync(async () => 7);
    expect(result).toEqual({ kind: "ok", value: 7 });
  });

  test("captures a sync return as Ok", async () => {
    const result = await tryCatchAsync(() => 7);
    expect(result).toEqual({ kind: "ok", value: 7 });
  });

  test("captures a rejected Promise as Err", async () => {
    const result = await tryCatchAsync(async () => {
      throw new Error("async-boom");
    });
    if (isErr(result)) {
      expect((result.error as Error).message).toBe("async-boom");
    } else {
      fail("expected err");
    }
  });

  test("captures a sync throw inside the callback as Err", async () => {
    const result = await tryCatchAsync(() => {
      throw new Error("sync-boom");
    });
    if (isErr(result)) {
      expect((result.error as Error).message).toBe("sync-boom");
    } else {
      fail("expected err");
    }
  });

  test("custom mapError applies on async rejection", async () => {
    const result = await tryCatchAsync(
      async () => {
        throw new Error("async-boom");
      },
      (raw) => `wrapped: ${(raw as Error).message}`,
    );
    if (isErr(result)) {
      expect(result.error).toBe("wrapped: async-boom");
    } else {
      fail("expected err");
    }
  });
});

describe("fromPromise", () => {
  test("resolved promise becomes Ok", async () => {
    const result = await fromPromise(Promise.resolve(99));
    expect(result).toEqual({ kind: "ok", value: 99 });
  });

  test("rejected promise becomes Err with default Error", async () => {
    const result = await fromPromise(Promise.reject(new Error("rej")));
    if (isErr(result)) {
      expect((result.error as Error).message).toBe("rej");
    } else {
      fail("expected err");
    }
  });

  test("custom mapError on rejection", async () => {
    const result = await fromPromise(
      Promise.reject(new Error("rej")),
      (raw) => (raw as Error).message,
    );
    if (isErr(result)) {
      expect(result.error).toBe("rej");
    } else {
      fail("expected err");
    }
  });
});

describe("fromNullable", () => {
  test("non-null value becomes Ok", () => {
    expect(fromNullable(7, "missing")).toEqual({ kind: "ok", value: 7 });
  });

  test("null becomes Err", () => {
    expect(fromNullable(null, "missing")).toEqual({
      kind: "err",
      error: "missing",
    });
  });

  test("undefined becomes Err", () => {
    expect(fromNullable(undefined, "missing")).toEqual({
      kind: "err",
      error: "missing",
    });
  });

  test("falsy-but-defined values remain Ok", () => {
    expect(isOk(fromNullable(0, "missing"))).toBe(true);
    expect(isOk(fromNullable("", "missing"))).toBe(true);
    expect(isOk(fromNullable(false, "missing"))).toBe(true);
  });
});
