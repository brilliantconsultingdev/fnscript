/**
 * Container for missing values information when working with `Maybe.match2` or
 * higher order analogs.
 */
class MissingValues {
  private POSITIONS_NAMES = ["first", "second", "third", "fourth", "fifth"];
  private positions: number[];

  constructor(positions: number[]) {
    this.positions = positions;
  }

  /**
   * Returns position at which values are missing, starting from 0.
   */
  getPositions(): number[] {
    return this.positions;
  }

  /**
   * Returns human readable message describing which values are missing.
   * If `names` list is passed, values from this list will be matched to
   * corresponding positions from missing values. Otherwise human readable form
   * will be put in place.
   *
   * Should serve to improve readability of error messages.
   *
   * Example:
   * ```
   * const missing = new MissingValues([0, 2])
   * missing.getPositions() // [0, 2]
   * missing.getMessage() // "first and third values are missing"
   * missing.getMessage(['a', 'b']) // "a and b values are missing"
   * missing.getMessage(['a']) // "a and second values are missing"
   * ```
   *
   * @param names list of value names
   */
  getMessage(names?: string[]): string {
    return this.composeMissingValuesMessage(this.positions, names || []);
  }

  private composeMissingValuesMessage(
    positions: number[],
    names: string[]
  ): string {
    if (positions.length === 0) {
      return "some values are missing";
    }

    if (positions.length === 1) {
      const value = this.mapPositionToHumanReadable(positions[0], names);
      return `${value} value is missing`;
    }

    const values = positions
      .map((i) => this.mapPositionToHumanReadable(i, names))
      .join(" and ");
    return `${values} values are missing`;
  }

  private mapPositionToHumanReadable(
    position: number,
    names: string[]
  ): string {
    return (
      names[position] || this.POSITIONS_NAMES[position] || "<unspecified value>"
    );
  }
}

/**
 * The `Maybe` monad represents computations which might "go wrong" by not returning a value.
 */
export class Maybe<V> {
  private value: V;

  /**
   * Evaluates `Maybe` object and runs corresponding match function.
   *
   * Example:
   * ```
   * function numberToString(maybeNumber: Maybe<number>): string {
   *   return maybeNumber.match({
   *     Just: value => `${value}`,
   *     Nothing: () => 'invalid number',
   *   })
   * }
   *
   * numberToString(Just(5)) // "5"
   * numberToString(Nothing()) // "invalid number"
   * ```
   *
   * @param match an object with handler functions
   */
  match<R>(match: { Just: (value: V) => R; Nothing: () => R }): R {
    if (this.isValue()) {
      return match.Just(this.value);
    }

    return match.Nothing();
  }

  /**
   * Returns value if it's `Just(value)`.
   *
   * Returns `defaultValue` if it's `Nothing()`.
   *
   * @param defaultValue default value to be returned
   */
  withDefault(defaultValue: V): V {
    if (this.isValue()) {
      return this.value;
    }

    return defaultValue;
  }

  /**
   * Returns `true` if it's `Just(value)`.
   */
  isValue(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  /**
   * Returns `true` if it's `Nothing()`.
   */
  isNothing(): boolean {
    return !this.isValue();
  }

  /**
   * Compares to Maybe object containing value of the same type.
   *
   * @param other value to compare to
   */
  isEqualTo(other: Maybe<V>): boolean {
    if (this.isNothing() && other.isNothing()) {
      return true;
    }

    if (this.isValue() && other.isValue()) {
      return this.value === other.value;
    }

    return false;
  }

  /**
   * *Note*: the usage of this function is discouraged. Instead, prefer to use
   * `match` and handle the `Nothing` case expicitly or use `withDefault()`.
   *
   * Returns value if `Maybe` is `Just(value)`, throws otherwise.
   */
  getValue(): V | never {
    if (this.isNothing()) {
      throw new Error("tried to unwrap Just(value) but got Nothing");
    }

    return this.value;
  }

  /**
   * Returns new `Maybe` object with modified value if
   * it is Just(value). Returns `Nothing` otherwise.
   *
   * @param mapper mapper function
   */
  map<T>(mapper: (value: V) => T): Maybe<T> {
    if (this.isValue()) {
      return Maybe.Just(mapper(this.value));
    }

    return Maybe.Nothing();
  }

  /**
   * Wraps value in `Maybe` (value) object.
   *
   * @param value value to wrap
   */
  static Just<V>(value: V): Maybe<V> {
    const result = new Maybe<V>();
    result.value = value;
    return result;
  }

  /**
   * Wraps value in `Maybe` (nothing) object.
   *
   * @param value value to wrap
   */
  static Nothing<V>(): Maybe<V> {
    return new Maybe<V>();
  }

  /**
   * Creates `Maybe` object from value.
   *
   * If `value` is `null` or `undefined`, will create `Nothing()`.
   * Otherwise will generate `Just(value)`.
   *
   * Example:
   * ```
   * Maybe.from(5)      // Just(5)
   * Maybe.from('test') // Just('test')
   * Maybe.from(null)   // Nothing()
   * ```
   *
   * @param value value to create `Maybe` from
   */
  static from<V>(value: V | undefined | null): Maybe<V> {
    if (value === null || value === undefined) {
      return Maybe.Nothing<V>();
    }

    return Maybe.Just<V>(value);
  }

  /**
   * Combines two `Maybe` objects in a single match, ensuring that all
   * given values are present.
   *
   * Example:
   * ```
   * function combine(x1: Maybe<number>, x2: Maybe<string>): string {
   *   return Maybe.match2(x1, x2, {
   *     Values: (num, str) => `x1=${num} x2=${str}`,
   *     Missing: missing => `error: ${missing.getMessage(['x1', 'x2'])}`,
   *   })
   * }
   *
   * combine(Just(123), Just('test')) // "x1=123 x2=test"
   * combine(Just(123), Nothing()) // "error: x2 value is missing"
   * combine(Nothing(), Nothing()) // "error: x1 and x2 values are missing"
   * ```
   *
   * @param {Maybe} m1 first value
   * @param {Maybe} m2 second value
   * @param {Object} match object with match functions
   */
  static match2<R, V1, V2>(
    m1: Maybe<V1>,
    m2: Maybe<V2>,
    match: {
      Values: (v1: V1, v2: V2) => R;
      Missing: (missing: MissingValues) => R;
    }
  ): R {
    if (m1.isValue() && m2.isValue()) {
      return match.Values(m1.value, m2.value);
    }

    const indices = getMissingValuesIndices([m1, m2]);

    return match.Missing(new MissingValues(indices));
  }

  /**
   * Same as `match2` but accepts 3 values.
   *
   * @param {Maybe} m1 first value
   * @param {Maybe} m2 second value
   * @param {Maybe} m3 third value
   * @param {Object} match object with match functions
   */
  static match3<R, V1, V2, V3>(
    m1: Maybe<V1>,
    m2: Maybe<V2>,
    m3: Maybe<V3>,
    match: {
      Values: (v1: V1, v2: V2, v3: V3) => R;
      Missing: (missing: MissingValues) => R;
    }
  ): R {
    if (m1.isValue() && m2.isValue() && m3.isValue()) {
      return match.Values(m1.value, m2.value, m3.value);
    }

    const indices = getMissingValuesIndices([m1, m2, m3]);

    return match.Missing(new MissingValues(indices));
  }

  /**
   * Same as `match2` but accepts 4 values.
   *
   * @param {Maybe} m1 first value
   * @param {Maybe} m2 second value
   * @param {Maybe} m3 third value
   * @param {Maybe} m4 fourth value
   * @param {Object} match object with match functions
   */
  static match4<R, V1, V2, V3, V4>(
    m1: Maybe<V1>,
    m2: Maybe<V2>,
    m3: Maybe<V3>,
    m4: Maybe<V4>,
    match: {
      Values: (v1: V1, v2: V2, v3: V3, v4: V4) => R;
      Missing: (missing: MissingValues) => R;
    }
  ): R {
    if (m1.isValue() && m2.isValue() && m3.isValue() && m4.isValue()) {
      return match.Values(m1.value, m2.value, m3.value, m4.value);
    }

    const indices = getMissingValuesIndices([m1, m2, m3, m4]);

    return match.Missing(new MissingValues(indices));
  }

  /**
   * Same as `match5` but accepts 5 values.
   *
   * @param {Maybe} m1 first value
   * @param {Maybe} m2 second value
   * @param {Maybe} m3 third value
   * @param {Maybe} m4 fourth value
   * @param {Maybe} m5 fifth value
   * @param {Object} match object with match functions
   */
  static match5<R, V1, V2, V3, V4, V5>(
    m1: Maybe<V1>,
    m2: Maybe<V2>,
    m3: Maybe<V3>,
    m4: Maybe<V4>,
    m5: Maybe<V5>,
    match: {
      Values: (v1: V1, v2: V2, v3: V3, v4: V4, v5: V5) => R;
      Missing: (missing: MissingValues) => R;
    }
  ): R {
    if (
      m1.isValue() &&
      m2.isValue() &&
      m3.isValue() &&
      m4.isValue() &&
      m5.isValue()
    ) {
      return match.Values(m1.value, m2.value, m3.value, m4.value, m5.value);
    }

    const indices = getMissingValuesIndices([m1, m2, m3, m4, m5]);

    return match.Missing(new MissingValues(indices));
  }
}

export const Just = Maybe.Just;
export const Nothing = Maybe.Nothing;

function getMissingValuesIndices(items: Maybe<any>[]): number[] {
  const indices: number[] = [];
  items.forEach((item, index) => item.isNothing() && indices.push(index));
  return indices;
}
