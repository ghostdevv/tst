# TST

It's like `.txt` but with scripting! Making this for myself because I wanted a easier way to compute maths and text together whilst playing Satisfactory, and of course it quickly got out of hand 😅. It's a side project but feel free to poke around

# The Language

Text is the main primitive, so this means that unless it's not text it's text. For example a basic tst file might look like this:

```
Hello World
This is just some text
no way of knowing it's a tst file
unless you do
```

There are special ways of defining non-text elements which you can see:

## Variables

Variables are defined with the $ modifier, they have a name and a value.

```
$ variableName = some value
```

You can consume a variable by using mustache tags anywhere

```
{variableName}
```

## Functions

Functions are similar to variables in their definition, you can have as many space seperated arguments as you want.

```
$ functionName = |arg1 arg2 etc| the expression comes after
```

To call a function you put it in a mustache tag and use square brackets

```
$ concat = |wordOne wordTwo| {wordOne} {wordTwo}

{concat[hello world]}
```

## Maths

Maths is done by wrapping the statement in brackets, this can be any statement accepted by [maths-expression-evaluator](https://github.com/bugwheels94/math-expression-evaluator) and it can accept mustache tags like everything else.

```
Something something 6 * 8 = (6 * 8)
```

## Macros

Macros are used with a # followed by it's name, for example:

```
# clear
```

Below is a list of global macros, and there are also some compiler specific ones.

- ### Global Macros

    | Macro Name | Description             |
    |------------|-------------------------|
    | clear      | Clears the console      |
    | exit       | Exits the process early |

- ### JavaScript Compiler Macros

    | Macro Name | Description                                  |
    |------------|----------------------------------------------|
    | export     | Marks the variable/function for export (esm) |

# Compilers

There main part of the language is just a parser and validater, there are many compilers that read from the generated AST-like list of instructions.

- ### Console

    The main compiler just prints to console as it reads from the tree.

- ### JavaScript

    This is a more advanced compiler that will conver tst to javascript which can then be executed in any javascript runtime as it's self contained. Below is an example of what that looks like:

    test.tst
    ```
    $ add = |a b| ({a} + {b})
    $ echo = |word| {word}

    10 + 8 = {add[10 8]}
    6 * 9 = (6 * 9)

    # export
    $ tst = neat

    {echo[test]}
    ```

    test.js
    ```js
    import { _tst_math_ } from './test.lib.js';

    // [function] "$ add = |a b| ({a} + {b})"
    var add = (a, b) => `${_tst_math_(`${a} + ${b}`)}`;

    // [function] "$ echo = |word| {word}"
    var echo = (word) => `${word}`;

    // [blank] ""
    console.log();

    // [line] "10 + 8 = {add[10 8]}"
    console.log(`10 + 8 = ${add(10, 8)}`);

    // [line] "6 * 9 = (6 * 9)"
    console.log(`6 * 9 = ${_tst_math_(`6 * 9`)}`);

    // [blank] ""
    console.log();

    // [macro] "# export"
    export

    // [variable] "$ tst = neat"
    var tst = `neat`;

    // [blank] ""
    console.log();

    // [line] "{echo[test]}"
    console.log(`${echo(test)}`);
    ```
