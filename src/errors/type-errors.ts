import { Operand } from "$vm"
import { OPERATORS } from "$parser"
import { createNamespace } from "."

export type TypeErrors = {
    BinaryOperation: [operand1: Operand, operand2: Operand, operator: typeof OPERATORS[number]]
}

export const typeErrors = createNamespace<TypeErrors>("TypeError", {
    BinaryOperation: (operand1, operand2, operator) => {
        return `unsupported "${operator}" operation between "${operand1.type}" and "${operand2.type}"`
    }
})
