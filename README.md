[![CI](https://github.com/brilliantconsultingdev/fnscript/workflows/CI/badge.svg?branch=master)](https://github.com/brilliantconsultingdev/fnscript/actions?query=branch%3Amaster+workflow%3ACI)
[![npm version](https://badge.fury.io/js/fnscript.svg)](https://badge.fury.io/js/fnscript)

**fnscript** is a small library to assist in writing functional TypeScript code.

## Installation

Using yarn:

```sh
yarn install fnscript
```

Using npm:

```sh
npm install fnscript
```

## Examples

### Maybe

```ts
import { Just, Maybe, Nothing } from "fnscript";

// Usage in variable declaration
const numberExample = Just(1); // Maybe<number>
const stringExample = Just("test"); // Maybe<string>
const nothing1: Maybe<number> = Nothing(); // Type annotation required, otherwise type is Maybe<unknown>
const nothing2 = Nothing<number>(); // Alternative option

// Check if Just or Nothing
console.log("number is value", numberExample.isValue()); // true
console.log("string is nothing", stringExample.isNothing()); // false

// Extract value from container
console.log("string is ", stringExample.getValue()); // "string is test"
console.log("number is ", numberExample.withDefault(0)); // "number is 1"
console.log("number is ", nothing1.withDefault(0)); // "number is 0"

// getValue() will raise if Nothing, using withDefault() or match()
// over getValue() is recommended
// nothing1.getValue(); => throw new Error("tried to unwrap Just(value) but got Nothing")

// Just(null) and Just(undefined) considered as Nothing()
Just(null); // Nothing()
Just(undefined); // Nothing()

// Alternative way to wrap value in Maybe container
Maybe.from(null); // Nothing()
Maybe.from(undefined); // Nothing()
Maybe.from(5); // Just(5)

// Usage in function declaration
function oneToString(num: number): Maybe<string> {
  if (num === 1) {
    return Just("one");
  }

  return Nothing();
}

const maybeOne = oneToString(1); // Just('one')

// `len` type is inferred as `number`
const len = maybeOne.match({
  Just: (str) => str.length,
  Nothing: () => 0,
});

// Map will only execute if it is Just(value), returns Nothing() otherwise
maybeOne
  .map((str) => `The value is ${str}`) // Just("The value is ONE") => Maybe<string>
  .map((str) => str.length) // Just(16) => Maybe<number>
  .map((len) => console.log(`length is ${len}`)); // logs "length is 16" => Maybe<void>
```

See [tests/maybe.test.ts](tests/maybe.test.ts) for more examples.

### Result

```ts
import { Result, Ok, Err } from "fnscript";

// Usage in function declaration
function length(str: string): Result<number, string> {
  if (str === null || str === undefined) {
    return Err("invalid argument");
  }

  return Ok(str.length);
}

// Access container content
console.log(length(null).isOk()); // false
console.log(length(null).isErr()); // true
console.log(length(null).getValueOr(0)); // 0
console.log(length("val").getValue()); // 3
console.log(length(null).getError()); // "invalid argument"

// Using match to unpack result
length("test").match({
  Ok: (len) => console.log("length is ", len),
  Err: (err) => console.log("error: ", err),
}); // outputs length is 4

// Chain over successful result
length("test")
  .andThen((len) => Ok(`the length is ${len}`))
  .andThen((str) => {
    console.log(str);
    return Ok(str);
  }); // logs "the length is 4"

length(null)
  .andThen((len) => Ok(`the length is ${len}`))
  .andThen((str) => {
    console.log(str);
    return Ok(str);
  }); // nothing is logged

// Convert Result to Maybe
console.log(length("test").ok()); // Just(test)
console.log(length(null).ok()); // Nothing()
console.log(length("test").err()); // Nothing()
console.log(length(null).err()); // Just("invalid argument")
```

See [tests/result.test.ts](tests/result.test.ts) for more examples.

### Error

```ts
import { Error } from "fnscript";
// Use alias to keep access to Error class from standart library
// import { Error as Errorw } from "fnscript"
// Note: "Errorw" for "Error (w)rapper"

console.log(Error.new("invalid argument").text()); // "invalid argument"
console.log(Error.new(123).text()); // "123"
console.log(Error.new([1, 2, 3]).text()); // 1,2,3

const fileNotFound = Error.new("file not found");
const fileReadError = Error.new("failed to read file").wrap(fileNotFound);
const configReadError = Error.new("failed to read config").wrap(fileReadError);

console.log(configReadError.text()); // "failed to read config: failed to read file: file not found"
console.log(Error.flatten(configReadError));
// [
//   Error{message:'failed to read config'},
//   Error{message:'failed to read file'},
//   Error{message:'file not found'},
// ]
```
