import { Operand } from "./operands";

export const BUILTIN_NAMES: Record<string, Operand> = {
    print: Operand.fromFunction({
        name: "print",
        fn: (...operands) => {
            process.stdout.write(operands.map(String).join(" "))
            return Operand.fromNone()
        }
    }),

    println: Operand.fromFunction({
        name: "println",
        fn: (...operands) => {
            process.stdout.write(operands.map(String).join(" ") + "\n")
            return Operand.fromNone()
        }
    }),
} as const
