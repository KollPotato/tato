import { Operand } from "./operands"

export type Instruction =
    InstructionBuilder<"LOAD_CONST", Operand> |
    InstructionBuilder<"STORE_NAME", Operand<"string">> |
    InstructionBuilder<"CALL_FUNCTION", Operand<"number">> |
    InstructionBuilder<"LOAD_NAME", Operand<"string">> |
    InstructionBuilder<"POP"> |

    InstructionBuilder<"BINARY_OPERATION", Operand<"string">> |
    InstructionBuilder<"UNARY_OPERATION", Operand<"string">> |

    InstructionBuilder<"JUMP_FORWARD", Operand<"number">> |
    InstructionBuilder<"POP_JUMP_FORWARD_IF_TRUE", Operand<"number">> |
    InstructionBuilder<"POP_JUMP_FORWARD_IF_FALSE", Operand<"number">>


type InstructionBuilder<TOpcode extends string, TValue extends Operand | undefined = undefined> =
    TValue extends undefined
    ? Readonly<{ opcode: TOpcode }>
    : Readonly<{ opcode: TOpcode, operand: TValue }>
