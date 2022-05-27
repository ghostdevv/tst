TST Example/Test file

- How to run:
    You can use the default console compiler by running: "tsm src/cli/cli.ts run example.tst"

- Variables
    Variables are defined like this:

    $ hello = world

    since text is the primitive in tst quotes around values are not required, you can use a variable like so

    Hello {hello}!

    This will compile to "Hello world!" when you run it

- Maths
    Maths is an important part of tst, you can write maths statements in ().

    4 + 8 = (4 + 8)

    This will compile to "4 + 8 = 12"

    The maths strings can be as compilcated as you like and can include variables or functions

    $ someVariable = 10

    ({someVariable} * 2)

    This will compile to "20"

- Functions
    In tst you can write functions, they can support multiple args, for example

    $ add = |a b| ({a} + {b})

    {add[10 20]}

    This will compile to "30"