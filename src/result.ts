import { Maybe, Just, Nothing } from "./maybe";

/**
 * Result<V, E> is a type used for returning and propagating errors.
 * It has two possible states:
 * - Ok(V), representing success and containing a value;
 * - Err(E), representing error and containing an error value.
 */
export class Result<V, E> {
  private value: V;
  private error: E;

  /**
   * Evaluates `Result` and runs:
   * - "Ok" handler if result is `Ok(value)`
   * - "Err" handler if result is `Err(error)`
   *
   * @param match object with handler functions
   */
  match<R>(match: { Ok: (val: V) => R; Err: (err: E) => R }): R {
    if (this.isOk()) {
      return match.Ok(this.value);
    }

    return match.Err(this.error);
  }

  /**
   * *Note*: the usage of this function is discouraged. Instead, prefer to use
   * `match` and handle the `Err` case expicitly or use `getValueOr()`.
   *
   * Returns value if `Result` is `Ok(value)`, throws otherwise.
   */
  getValue(): V | never {
    if (!this.isOk()) {
      throw new Error("tried to unwrap result value but result is not Ok");
    }

    return this.value;
  }

  /**
   * Returns value if `Result` is `Ok(value)`, otherwise returns `defaultValue`.
   *
   * @param defaultValue default value
   */
  getValueOr(defaultValue: V): V {
    if (!this.isOk()) {
      return defaultValue;
    }

    return this.value;
  }

  /**
   * *Note*: the usage of this function is discouraged. Instead, prefer to use
   * `match` or use `getErrorOr()`.
   *
   * Returns error value if `Result` is `Err(error)`, throws otherwise.
   */
  getError(): E | never {
    if (!this.isErr()) {
      throw new Error("tried to unwrap result error but result is not Err");
    }

    return this.error;
  }

  /**
   * Returns error if `Result` is `Err(error)`, otherwise returns `defaultError`.
   *
   * @param defaultError default error
   */
  getErrorOr(defaultError: E): E {
    if (!this.isErr()) {
      return defaultError;
    }

    return this.error;
  }

  /**
   * Returns Just(value) if result is Ok(value).
   * Returns Nothing() if result is Err(error).
   */
  ok(): Maybe<V> {
    if (this.isOk()) {
      return Just(this.value);
    }

    return Nothing();
  }

  /**
   * Returns Just(error) if result is Err(error).
   * Returns Nothing() if result is Ok(value).
   */
  err(): Maybe<E> {
    if (this.isErr()) {
      return Just(this.error);
    }

    return Nothing();
  }

  /**
   * Returns true if result is a value.
   */
  isOk(): boolean {
    return this.value !== undefined;
  }

  /**
   * Returns true if result is an error.
   */
  isErr(): boolean {
    return !this.isOk();
  }

  /**
   * Checks if self is equal to given result.
   *
   * @param other result to compare self to
   */
  isEqualTo(other: Result<V, E>): boolean {
    if (this.isErr() && other.isErr()) {
      return this.error === other.error;
    }

    if (this.isOk() && other.isOk()) {
      return this.value === other.value;
    }

    return false;
  }

  /**
   * Maps self to new `Result` keeping `error` value.
   *
   * @param mapper mapper function
   */
  map<T>(mapper: (value: V) => T): Result<T, E> {
    if (this.isOk()) {
      return Result.Ok(mapper(this.value));
    }

    return Result.Err(this.error);
  }

  /**
   * Maps self to new `Result` keeping `value` and modifying `error`.
   *
   * @param mapper mapper function
   */
  mapErr<T>(mapper: (error: E) => T): Result<V, T> {
    if (this.isErr()) {
      return Result.Err(mapper(this.error));
    }

    return Result.Ok(this.value);
  }

  /**
   * Returns argument if self is `Ok(value)`. Otherwise returns `Err(error)`.
   *
   * @param result value to return
   */
  and<T>(result: Result<T, E>): Result<T, E> {
    if (this.isOk()) {
      return result;
    }

    return Result.Err(this.error);
  }

  /**
   * Runs predicate function if self is `Ok(value)`, otherwise returns `Err(error)`.
   *
   * @param op function to run
   */
  andThen<T>(op: (value: V) => Result<T, E>): Result<T, E> {
    if (this.isOk()) {
      return op(this.value);
    }

    return Result.Err(this.error);
  }

  /**
   * Constructs `Ok(value)` instance of `Result`.
   *
   * @param value value to wrap
   */
  static Ok<V, E>(value: V): Result<V, E> {
    const result = new Result<V, E>();
    result.value = value;
    return result;
  }

  /**
   * Constructs `Err(error)` instance of `Result`.
   *
   * @param error error value
   */
  static Err<V, E>(error: E): Result<V, E> {
    const result = new Result<V, E>();
    result.error = error;
    return result;
  }
}

export const Ok = Result.Ok;
export const Err = Result.Err;
