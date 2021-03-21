import { Maybe, Just, Nothing } from "../src/maybe";

describe("Maybe.isValue()", () => {
  test("returns true for Just value", () => {
    const sample = Just(123);
    expect(sample.isValue()).toBeTruthy();
  });

  test("returns false for Nothing", () => {
    const sample = Nothing();
    expect(sample.isValue()).toBeFalsy();
  });
});

describe("Maybe.isNothing()", () => {
  test("returns true for Just value", () => {
    const sample = Just(123);
    expect(sample.isNothing()).toBeFalsy();
  });

  test("returns false for Nothing", () => {
    const sample = Nothing();
    expect(sample.isNothing()).toBeTruthy();
  });
});

describe("Maybe.withDefault()", () => {
  test("returns value for Just value", () => {
    const sample = Just(123);
    expect(sample.withDefault(456)).toEqual(123);
  });

  test("returns argument for Nothing", () => {
    const sample: Maybe<number> = Nothing();
    expect(sample.withDefault(456)).toEqual(456);
  });
});

describe("Maybe.match()", () => {
  test('runs "Just" handler when it is Just value', () => {
    const sample = Just(123);
    const result = sample.match({
      Just: (val) => val,
      Nothing: () => 0,
    });

    expect(result).toEqual(123);
  });

  test('runs "Nothing" handler when it is Nothing', () => {
    const sample: Maybe<number> = Nothing();
    const result = sample.match({
      Just: (val) => val,
      Nothing: () => 0,
    });

    expect(result).toEqual(0);
  });
});

describe("Maybe.from()", () => {
  test("returns Just value when it's not null or undefined", () => {
    expect(Maybe.from(123).isValue()).toBeTruthy();
    expect(Maybe.from("test").isValue()).toBeTruthy();
  });

  test('runs "Nothing" handler when it is Nothing', () => {
    expect(Maybe.from(null).isNothing()).toBeTruthy();
    expect(Maybe.from(undefined).isNothing()).toBeTruthy();
    expect(Maybe.from(123).isNothing()).toBeFalsy();
    expect(Maybe.from("test").isNothing()).toBeFalsy();
  });
});

describe("Maybe.match2()", () => {
  function combine(x1: Maybe<number>, x2: Maybe<string>): string {
    return Maybe.match2(x1, x2, {
      Values: (num, str) => `x1=${num} x2=${str}`,
      Missing: (missing) => `error: ${missing.getMessage(["x1", "x2"])}`,
    });
  }

  test('runs "Values" handler when all values are present', () => {
    const x1 = Just(3);
    const x2 = Just("test");
    const result = combine(x1, x2);

    expect(result).toEqual("x1=3 x2=test");
  });

  test('runs "Missing" handler when some values are absent', () => {
    const x1 = Just(3);
    const x2: Maybe<string> = Nothing();
    const result = combine(x1, x2);

    expect(result).toEqual("error: x2 value is missing");
  });

  test('runs "Missing" handler when all values are absent', () => {
    const x1: Maybe<number> = Nothing();
    const x2: Maybe<string> = Nothing();
    const result = combine(x1, x2);

    expect(result).toEqual("error: x1 and x2 values are missing");
  });
});

describe("Maybe.match3()", () => {
  function combine(
    x1: Maybe<number>,
    x2: Maybe<string>,
    x3: Maybe<boolean>
  ): string {
    return Maybe.match3(x1, x2, x3, {
      Values: (num, str, flag) => `x1=${num} x2=${str} x3=${flag}`,
      Missing: (missing) => `error: ${missing.getMessage(["x1", "x2", "x3"])}`,
    });
  }

  test('runs "Values" handler when all values are present', () => {
    const x1 = Just(3);
    const x2 = Just("test");
    const x3 = Just(true);
    const result = combine(x1, x2, x3);

    expect(result).toEqual("x1=3 x2=test x3=true");
  });

  test('runs "Missing" handler when some values are absent', () => {
    const x1 = Just(3);
    const x2: Maybe<string> = Nothing();
    const x3 = Just(false);
    const result = combine(x1, x2, x3);

    expect(result).toEqual("error: x2 value is missing");
  });

  test('runs "Missing" handler when all values are absent', () => {
    const x1: Maybe<number> = Nothing();
    const x2: Maybe<string> = Nothing();
    const x3: Maybe<boolean> = Nothing();
    const result = combine(x1, x2, x3);

    expect(result).toEqual("error: x1 and x2 and x3 values are missing");
  });
});

describe("Maybe.match4()", () => {
  function combine(
    x1: Maybe<number>,
    x2: Maybe<string>,
    x3: Maybe<boolean>,
    x4: Maybe<string>
  ): string {
    return Maybe.match4(x1, x2, x3, x4, {
      Values: (num, str, flag, str2) =>
        `x1=${num} x2=${str} x3=${flag} x4=${str2}`,
      Missing: (missing) =>
        `error: ${missing.getMessage(["x1", "x2", "x3", "x4"])}`,
    });
  }

  test('runs "Values" handler when all values are present', () => {
    const x1 = Just(3);
    const x2 = Just("test");
    const x3 = Just(true);
    const x4 = Just("abc");
    const result = combine(x1, x2, x3, x4);

    expect(result).toEqual("x1=3 x2=test x3=true x4=abc");
  });

  test('runs "Missing" handler when some values are absent', () => {
    const x1 = Just(3);
    const x2 = Just("test");
    const x3 = Just(false);
    const x4: Maybe<string> = Nothing();
    const result = combine(x1, x2, x3, x4);

    expect(result).toEqual("error: x4 value is missing");
  });

  test('runs "Missing" handler when all values are absent', () => {
    const x1: Maybe<number> = Nothing();
    const x2: Maybe<string> = Nothing();
    const x3: Maybe<boolean> = Nothing();
    const x4: Maybe<string> = Nothing();
    const result = combine(x1, x2, x3, x4);

    expect(result).toEqual("error: x1 and x2 and x3 and x4 values are missing");
  });
});

describe("Maybe.match5()", () => {
  function combine(
    x1: Maybe<number>,
    x2: Maybe<string>,
    x3: Maybe<boolean>,
    x4: Maybe<string>,
    x5: Maybe<number>
  ): string {
    return Maybe.match5(x1, x2, x3, x4, x5, {
      Values: (num, str, flag, str2, num2) =>
        `x1=${num} x2=${str} x3=${flag} x4=${str2} x5=${num2}`,
      Missing: (missing) =>
        `error: ${missing.getMessage(["x1", "x2", "x3", "x4", "x5"])}`,
    });
  }

  test('runs "Values" handler when all values are present', () => {
    const x1 = Just(3);
    const x2 = Just("test");
    const x3 = Just(true);
    const x4 = Just("abc");
    const x5 = Just(123);
    const result = combine(x1, x2, x3, x4, x5);

    expect(result).toEqual("x1=3 x2=test x3=true x4=abc x5=123");
  });

  test('runs "Missing" handler when some values are absent', () => {
    const x1 = Just(3);
    const x2 = Just("test");
    const x3 = Just(false);
    const x4: Maybe<string> = Nothing();
    const x5: Maybe<number> = Nothing();
    const result = combine(x1, x2, x3, x4, x5);

    expect(result).toEqual("error: x4 and x5 values are missing");
  });

  test('runs "Missing" handler when all values are absent', () => {
    const x1: Maybe<number> = Nothing();
    const x2: Maybe<string> = Nothing();
    const x3: Maybe<boolean> = Nothing();
    const x4: Maybe<string> = Nothing();
    const x5: Maybe<number> = Nothing();
    const result = combine(x1, x2, x3, x4, x5);

    expect(result).toEqual(
      "error: x1 and x2 and x3 and x4 and x5 values are missing"
    );
  });
});

describe("isEqualTo()", () => {
  test("is true when both values are Nothing", () => {
    const a: Maybe<string> = Nothing();
    const b: Maybe<string> = Nothing();

    expect(a.isEqualTo(b)).toBeTruthy();
  });

  test("is true when contained values are equal", () => {
    const a: Maybe<string> = Just("test");
    const b: Maybe<string> = Just("test");

    expect(a.isEqualTo(b)).toBeTruthy();
  });

  test("is false when contained values are different", () => {
    const a: Maybe<string> = Just("test");
    const b: Maybe<string> = Just("random");

    expect(a.isEqualTo(b)).toBeFalsy();
  });

  test("is false when comparing Just(value) to Nothing", () => {
    const a: Maybe<string> = Just("test");
    const b: Maybe<string> = Nothing();

    expect(a.isEqualTo(b)).toBeFalsy();
  });
});

describe("Maybe.map()", () => {
  test("maps Just(value) to Just(newValue)", () => {
    const sample = Just(42);
    const mapped = sample.map((val) => `val is ${val}`);
    expect(mapped.withDefault("error")).toEqual("val is 42");
  });

  test("does not map anything if it is Nothing", () => {
    const sample: Maybe<number> = Nothing();
    const mapped = sample.map((val) => `val is ${val}`);
    expect(mapped.isEqualTo(Nothing())).toBeTruthy();
  });
});

describe("Just()", () => {
  test("wraps value", () => {
    expect(Just(123).isValue()).toBeTruthy();
    expect(Just("test").isValue()).toBeTruthy();
    expect(Just(true).isValue()).toBeTruthy();
    expect(Just(false).isValue()).toBeTruthy();
    expect(Just([]).isValue()).toBeTruthy();
    expect(Just({}).isValue()).toBeTruthy();
  });

  test("is equal to Nothing when value is null or undefined", () => {
    expect(Just(null).isEqualTo(Nothing())).toBeTruthy();
    expect(Just(undefined).isEqualTo(Nothing())).toBeTruthy();
  });
});

describe("Nothing()", () => {
  test("creates empty value object", () => {
    expect(Nothing().isNothing()).toBeTruthy();
  });
});
