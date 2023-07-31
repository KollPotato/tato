import { Operand } from "./operands";


export const BUILTIN_NAMES: Record<string, Operand> = {
    print: Operand.fromFunction((...operands) => {
        process.stdout.write(operands.map(String).join(" "))
    }),

    println: Operand.fromFunction((...operands) => {
        process.stdout.write(operands.map(String).join(" ") + "\n")
    }),
} as const
