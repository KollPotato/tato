# Tato

This is a simple programming language implemented in TypeScript. It is not supposed to be used in real applications, because it has many unexpected bugs and it is really slow.

Language consists of 3 parts:
- **Virtual Machine** - executes the given instructions (like LOAD_CONST, LOAD_NAME, SUBTART, etc.).
- **Parser** - parses human readable code into the AST (abstract syntax tree).
- **Compiler** - compiles the AST to instructions, which are then executed by the virtual machine.
