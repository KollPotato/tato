import { createErrorThrower } from "."
import { Instruction } from "$vm"
import chalk from "chalk"

export type VirtualMachineErrors = {
    StackUnderflow: []
    StackOverflow: [limit: number]
    UnknownOpcode: [opcode: Instruction["opcode"]]
}

export const throwVirtualMachineError = createErrorThrower<VirtualMachineErrors>("VirtualMachineError", {
    StackUnderflow: () => "stack is empty",
    StackOverflow: (limit) => `stack size exceeded the given limit ${limit}`,
    UnknownOpcode: (opcode) => `unknown or unimplemented ${chalk.greenBright(opcode)} opcode`
})
