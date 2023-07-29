import { OPERATORS } from "../parser/parser"
import { Operand, NumberOperand, StringOperand } from "./operands"

export type Instruction =
    InstructionBuilder<"LOAD_CONST", Operand> |
    InstructionBuilder<"POP"> |
    InstructionBuilder<"COPY", NumberOperand> |
    InstructionBuilder<"DUPLICATE"> |

    InstructionBuilder<"STORE_NAME", StringOperand> |
    InstructionBuilder<"LOAD_NAME", StringOperand> |

    InstructionBuilder<"BINARY_OPERATION", StringOperand<typeof OPERATORS[number]>> |
    InstructionBuilder<"COMPARE_OPERATION", StringOperand> |

    InstructionBuilder<"ADD"> |
    InstructionBuilder<"SUBTRACT"> |
    InstructionBuilder<"MULTIPLY"> |
    InstructionBuilder<"DIVIDE"> |
    InstructionBuilder<"POWER"> |
    InstructionBuilder<"MODULO"> |

    InstructionBuilder<"ASSIGN"> |
    InstructionBuilder<"LESS"> |
    InstructionBuilder<"GREATER"> |
    InstructionBuilder<"EQUAL"> |
    InstructionBuilder<"NOT_EQUAL"> |
    InstructionBuilder<"LESS_OR_EQUAL"> |
    InstructionBuilder<"GREATER_OR_EQUAL"> |

    InstructionBuilder<"JUMP_IF_TRUE", NumberOperand> |
    InstructionBuilder<"JUMP_IF_FALSE", NumberOperand> |

    InstructionBuilder<"ECHO"> |

    InstructionBuilder<"CALL_FUNCTION", NumberOperand>


type InstructionBuilder<TOpcode extends string, TValue extends Operand | undefined = undefined> =
    TValue extends undefined
    ? Readonly<{ opcode: TOpcode }>
    : Readonly<{ opcode: TOpcode, operand: TValue }>

