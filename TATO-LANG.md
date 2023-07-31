# Tato Lang

### Keywords
```
if
else
match
fun
var
const
struct
type
enum
for
while
in
break
continue
none
return
true
false
```

### Bytecode

#### Opcodes
|    Name    |          Argument          |
| :--------: | :------------------------: |
| LOAD_CONST |          operand           |
| LOAD_NAME  | [type: Type, name: String] |

#### Operands
|   Name   |      Example       |
| :------: | :----------------: |
|   Int    |    42, 96, 4098    |
|  Float   | 42.59, 37.64, 82.3 |
|  String  | "Hello", "Potato"  |
| Function |   println, Range   |

### Examples

#### Stack
```rs
type Operand = Int32

type Stack = Array<Operand>

fun push(stack: &Stack, operand: Operand) {
    stack.add(operand)
}

fun pop(stack: &Stack): Maybe<Operand> {
    return stack.pop()
}

fun main() {
    const stack = Stack()
    
    push(&stack, 42 as Operand)

    const operand = pop(&stack)
    
    match operand {
        Some(42 as Operand) -> {
            println("The meaning of life the universe and everything")
        },
        Some(other) -> {
            println(other)
        }
        None -> {
            println("Stack is empty")
        }
    }
}

```