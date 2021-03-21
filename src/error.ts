import { Maybe, Just, Nothing } from "./maybe";
import { Printable } from "./printable";

export class Error {
  private message: string;

  private nestedError: Maybe<Error>;

  static new(value: Printable): Error {
    return new Error(value.toString());
  }

  constructor(message: string) {
    this.message = message;
    this.nestedError = Nothing();
  }

  static flatten(error: Error): Error[] {
    const thisError = new Error(error.getMessage());
    const rest: Error[] = error.getNestedError().match({
      Just: (err) => Error.flatten(err),
      Nothing: () => [],
    });

    return [thisError, ...rest];
  }

  text(): string {
    const errors = Error.flatten(this);
    const messages = errors.map((err: Error) => err.getMessage());
    return messages.join(": ");
  }

  wrap(error: Error): Error {
    this.nestedError = Just(error);
    return this;
  }

  getNestedError(): Maybe<Error> {
    return this.nestedError;
  }

  getMessage(): string {
    return this.message;
  }

  toString(): string {
    return this.message;
  }
}
