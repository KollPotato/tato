import { Operand } from "./operands";

function operandsToString(operands: Operand[]): string {
    return operands.map(operands => operands.value).join(" ")
}

export const BUILTIN_NAMES: Record<string, Operand> = {
    print: {
        type: "function",
        value: (...operands) => {
            process.stdout.write(operandsToString(operands))
        }
    },

    println: {
        type: "function",
        value: (...operands) => {
            process.stdout.write(`${operandsToString(operands)}\n`)
        }
    },
} as const
