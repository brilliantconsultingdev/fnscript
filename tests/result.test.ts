import { Just, Nothing } from "../src/maybe";
import { Result, Ok, Err } from "../src/result";

describe("Result.match()", () => {
  test('runs "Ok" handler if result is Ok(value)', () => {
    const sample: Result<number, string> = Ok(123);
    const result = sample.match({
      Ok: (val) => `the value is ${val}`,
      Err: (error) => `error: ${error}`,
    });

    expect(result).toEqual("the value is 123");
  });

  test('runs "Err" handler if result is Err(error)', () => {
    const sample: Result<number, string> = Err("test error");
    const result = sample.match({
      Ok: (val) => `the value is ${val}`,
      Err: (error) => `error: ${error}`,
    });

    expect(result).toEqual("error: test error");
  });
});

describe("Result.getValue()", () => {
  test("returns value when result is Ok(value)", () => {
    const sample: Result<number, string> = Ok(123);
    expect(sample.getValue()).toEqual(123);
  });

  test("throws when result is Err(error)", () => {
    const sample: Result<number, string> = Err("test error");
    expect(() => sample.getValue()).toThrow(
      "tried to unwrap result value but result is not Ok"
    );
  });
});

describe("Result.getValueOr()", () => {
  test("returns value when result is Ok(value)", () => {
    const sample: Result<number, string> = Ok(123);
    expect(sample.getValueOr(456)).toEqual(123);
  });

  test("rerturns argument when result is Err(error)", () => {
    const sample: Result<number, string> = Err("test error");
    expect(sample.getValueOr(456)).toEqual(456);
  });
});

describe("Result.getError()", () => {
  test("returns value when result is Err(error)", () => {
    const sample: Result<number, string> = Err("test");
    expect(sample.getError()).toEqual("test");
  });

  test("throws when result is Ok(value)", () => {
    const sample: Result<number, string> = Ok(123);
    expect(() => sample.getError()).toThrow(
      "tried to unwrap result error but result is not Err"
    );
  });
});

describe("Result.getErrorOr()", () => {
  test("returns value when result is Ok(value)", () => {
    const sample: Result<number, string> = Err("test");
    expect(sample.getErrorOr("replacement")).toEqual("test");
  });

  test("rerturns argument when result is Err(error)", () => {
    const sample: Result<number, string> = Ok(123);
    expect(sample.getErrorOr("replacement")).toEqual("replacement");
  });
});

describe("Result.ok()", () => {
  test("returns Just(value) if Result is Ok(value)", () => {
    const sample: Result<number, string> = Ok(123);
    expect(sample.ok().isEqualTo(Just(123))).toBeTruthy();
  });

  test("returns Nothing if Result is Err(error)", () => {
    const sample: Result<number, string> = Err("error");
    expect(sample.ok().isEqualTo(Nothing())).toBeTruthy();
  });
});

describe("Result.err()", () => {
  test("returns Just(error) if Result is Err(error)", () => {
    const sample: Result<number, string> = Err("error");
    expect(sample.err().isEqualTo(Just("error"))).toBeTruthy();
  });

  test("returns Nothing if Result is Ok(value)", () => {
    const sample: Result<number, string> = Ok(123);
    expect(sample.err().isEqualTo(Nothing())).toBeTruthy();
  });
});

describe("Result.isOk()", () => {
  test("returns true if Result is Ok(value)", () => {
    const sample = Ok(123);
    expect(sample.isOk()).toBeTruthy();
  });

  test("returns false Result is Err(error)", () => {
    const sample = Err("test");
    expect(sample.isOk()).toBeFalsy();
  });
});

describe("Result.isErr()", () => {
  test("returns true if result is Err(error)", () => {
    const sample = Err("test");
    expect(sample.isErr()).toBeTruthy();
  });

  test("returns false if Result is Ok(value)", () => {
    const sample = Ok(123);
    expect(sample.isErr()).toBeFalsy();
  });
});

describe("Result.isEqualTo()", () => {
  test("returns true for equal values", () => {
    const a: Result<number, string> = Ok(123);
    const b: Result<number, string> = Ok(123);

    expect(a.isEqualTo(b)).toBeTruthy();
  });

  test("returns true for equal errors", () => {
    const a: Result<number, string> = Err("error");
    const b: Result<number, string> = Err("error");

    expect(a.isEqualTo(b)).toBeTruthy();
  });

  test("returns false for different values", () => {
    const a: Result<number, string> = Err("error");
    const b: Result<number, string> = Ok(123);
    const c: Result<number, string> = Err("not equal");
    const d: Result<number, string> = Ok(456);

    expect(a.isEqualTo(b)).toBeFalsy();
    expect(a.isEqualTo(c)).toBeFalsy();
    expect(a.isEqualTo(d)).toBeFalsy();
  });
});

describe("Result.map()", () => {
  test("maps to Ok(newValue) if Result is Ok(value)", () => {
    const sample: Result<number, string> = Ok(321);
    expect(sample.map((val) => `val=${val}`).getValueOr("error")).toEqual(
      "val=321"
    );
  });

  test("does not map if Result is Err(error)", () => {
    const sample: Result<number, string> = Err("test");
    expect(sample.map((val) => `val=${val}`).getErrorOr("error")).toEqual(
      "test"
    );
  });
});

describe("Result.mapErr()", () => {
  test("maps to Err(newError) if Result is Err(error)", () => {
    const sample: Result<number, string> = Err("test error");
    expect(sample.mapErr((msg) => `error is: ${msg}`).getError()).toEqual(
      "error is: test error"
    );
  });

  test("does not map error if Result is Ok(value)", () => {
    const sample: Result<number, string> = Ok(321);
    expect(
      sample.mapErr((msg) => `error is: ${msg}`).getErrorOr("value")
    ).toEqual("value");
  });
});

describe("Result.and()", () => {
  test("returns argument if Result is Ok(value)", () => {
    const sample = Ok(123);
    expect(sample.and(Ok(456)).isEqualTo(Ok(456))).toBeTruthy();
    expect(sample.and(Err("test")).isEqualTo(Err("test"))).toBeTruthy();
  });

  test("returns error if Result is Err(error)", () => {
    const sample = Err("error");
    expect(sample.and(Ok(123)).isEqualTo(Err("error"))).toBeTruthy();
  });
});

describe("Result.andThen()", () => {
  function add5(num: number): Result<number, string> {
    return Ok(num + 5);
  }

  function wrapWithMessage(num: number): Result<string, string> {
    return Ok(`value is ${num}`);
  }

  test("run given handler if Result is Ok(value)", () => {
    const sample: Result<number, string> = Ok(123);
    expect(
      sample.andThen(add5).andThen(wrapWithMessage).getValueOr("error")
    ).toEqual("value is 128");
  });

  test("returns error if Result is Err(error)", () => {
    const sample: Result<number, string> = Err("error");
    expect(
      sample.andThen(add5).andThen(wrapWithMessage).getValueOr("error")
    ).toEqual("error");
  });
});

describe("Ok()", () => {
  test("wraps value", () => {
    expect(Ok(123).isOk()).toBeTruthy();
    expect(Ok("test").isOk()).toBeTruthy();
    expect(Ok(true).isOk()).toBeTruthy();
    expect(Ok(false).isOk()).toBeTruthy();
    expect(Ok([]).isOk()).toBeTruthy();
    expect(Ok({}).isOk()).toBeTruthy();
  });
});

describe("Err()", () => {
  test("wraps error", () => {
    expect(Err(123).isErr()).toBeTruthy();
    expect(Err("test").isErr()).toBeTruthy();
    expect(Err(true).isErr()).toBeTruthy();
    expect(Err(false).isErr()).toBeTruthy();
    expect(Err([]).isErr()).toBeTruthy();
    expect(Err({}).isErr()).toBeTruthy();
  });
});
