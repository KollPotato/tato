import chalk from "chalk"
import { Operand } from "$vm"
import { createErrorThrower } from "."
import { BinaryOperator } from "../shared/operators"

export type TypeErrors = {
    Operation: [operand1: Operand, operand2: Operand, operator: BinaryOperator]
    NotCallable: [type: string]
}

export const throwTypeError = createErrorThrower<TypeErrors>("TypeError", {
    Operation: (operand1, operand2, operator) => {
        return `unsupported operation ${chalk.greenBright(operator)} between ${chalk.greenBright(operand1.type)} and ${chalk.greenBright(operand2.type)}`
    },
    NotCallable: (type) => {
        return `"${type}" is not callable`
    }
})
