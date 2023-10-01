# Tato

This is a simple programming language implemented in TypeScript. It is not supposed to be used in real applications, because it has many unexpected bugs and it is really slow.

Language consists of 3 parts:
- **Virtual Machine** - executes the given instructions (like LOAD_CONST, LOAD_NAME, SUBTRACT, etc.).
- **Parser** - parses human readable code into an AST (abstract syntax tree).
- **Compiler** - compiles the AST to bytecode instructions.
