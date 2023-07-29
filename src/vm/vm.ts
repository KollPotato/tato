import chalk from "chalk";
import { Instruction } from "./bytecode";
import { Operand, operands } from "./operands";
import { Stack } from "./stack";
import { BUILTIN_NAMES } from "./builtins";
import { findClosestMatch } from "../utils";
import { raise } from "../error";
import { nameErrors } from "../errors/name-errors";
import { virtualMachineErrors } from "../errors/virtual-machine-errors";

export class VirtualMachine {
    #instructions: Instruction[]
    #hasExecuted: boolean
    #stack: Stack
    #programCounter: number

    public constructor(options: VirtualMachineOptions) {
        this.#instructions = options.instructions
        this.#hasExecuted = false
        this.#stack = options.stack
        this.#programCounter = 0
    }

    public get stack() {
        return this.#stack
    }

    public get programCounter() {
        return this.#programCounter
    }

    public get hasExecuted() {
        return this.#hasExecuted
    }

    public get instructions() {
        return this.#instructions
    }

    #executeInstruction(instruction: Instruction) {
        const { opcode } = instruction

        if (opcode === "LOAD_CONST") {
            this.#stack.push(instruction.operand)

            return
        }

        else if (opcode === "ADD") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            if (v1.type === "number" && v2.type === "number") {
                this.#stack.push({ type: "number", value: v1.value + v2.value })
            }

            else if (v2.type === "string" && v2.type === "string") {
                this.#stack.push({ type: "string", value: v1.value + v2.value })
            }

            return
        }

        else if (opcode === "SUBTRACT") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            if (v1.type === "number" && v2.type === "number") {
                this.#stack.push({ type: "number", value: v1.value - v2.value })
            }

            return
        }

        else if (opcode === "MULTIPLY") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            if (v1.type === "number" && v2.type === "number") {
                this.#stack.push({ type: "number", value: v1.value * v2.value })
                return
            }

            return
        }

        else if (opcode === "DIVIDE") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            if (v1.type === "number" && v2.type === "number") {
                this.#stack.push({ type: "number", value: v1.value / v2.value })
                return
            }

            return
        }

        else if (opcode === "POWER") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            if (v1.type === "number" && v2.type === "number") {
                this.#stack.push({ type: "number", value: v1.value ** v2.value })
                return
            }

            return
        }

        else if (opcode === "POP") {
            this.#stack.pop()
            return
        }

        else if (opcode === "DUPLICATE") {
            this.stack.push(this.stack.last())

            return
        }

        else if (opcode === "LESS_OR_EQUAL") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            if (v1.type === "number" && v2.type === "number") {
                this.stack.push({ type: "boolean", value: v1.value <= v2.value })
            }

            return
        }

        else if (opcode === "GREATER_OR_EQUAL") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            if (v1.type === "number" && v2.type === "number") {
                this.stack.push({ type: "boolean", value: v1.value >= v2.value })
            }

            return
        }

        else if (opcode === "JUMP_IF_TRUE") {
            const v1 = this.#stack.last()

            if (v1.type === "boolean" && v1.value) {
                this.#programCounter = instruction.operand.value
            }

            return
        }

        else if (opcode === "JUMP_IF_FALSE") {
            const v1 = this.#stack.last()

            if (v1.type === "boolean" && !v1.value) {
                this.#programCounter = instruction.operand.value
            }

            return
        }

        else if (opcode === "ECHO") {
            const v1 = this.#stack.last()
            console.log(`${chalk.greenBright(v1.type)}(${chalk.yellowBright(v1.value)})`)

            return
        }

        else if (opcode === "COPY") {
            const v1 = this.#stack.at(instruction.operand.value)
            this.#stack.push(v1)

            return
        }

        else if (opcode === "MODULO") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            if (v1.type === "number" && v2.type === "number") {
                this.#stack.push({ type: "number", value: v1.value % v2.value })
                return
            }
            
        }

        else if (opcode === "LOAD_NAME") {
            if (instruction.operand.type !== "string") {
                return raise({
                    name: "TypeError",
                    message: `Can not index names by type ${instruction.operand.type}`
                })
            }

            for (const name in BUILTIN_NAMES) {
                if (name === instruction.operand.value) {
                    this.stack.push(BUILTIN_NAMES[name])
                    return
                }
            }

            const closestNameMatch = findClosestMatch(instruction.operand.value, Object.keys(BUILTIN_NAMES), 2)
            nameErrors.throw("UnknownName", instruction.operand.value, closestNameMatch)

            return
        }

        else if (opcode === "EQUAL") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            if (v1.type === "number" && v2.type === "number") {
                this.#stack.push({ type: "boolean", value: v1.value === v2.value })
                return
            }

            else if (v1.type === "string" && v2.type === "string") {
                this.#stack.push({ type: "boolean", value: v1.value === v2.value })
                return
            }

            else if (v1.type === "boolean" && v2.type === "boolean") {
                this.#stack.push({ type: "boolean", value: v1.value === v2.value })
                return
            }
        }

        else if (opcode === "CALL_FUNCTION") {
            const args: Operand[] = []

            for (let i = 0; i < instruction.operand.value; i++) {
                args.push(this.stack.pop())
            }

            const fn = this.stack.pop()

            if (fn.type !== "function") {
                return raise({
                    name: "TypeError",
                    message: `Type ${fn.type} is not callable`
                })
            }

            fn.value(...args)

            return
        }

        else if (opcode === "BINARY_OPERATION") {
            const v1 = this.#stack.pop()
            const v2 = this.#stack.pop()

            const operator = instruction.operand.value

            if (v1.type === "string" && v2.type === "string" && operator === "ADD") {
                this.#stack.push(operands.string(v1.value + v2.value))
            }

            return
        }

        virtualMachineErrors.throw("UnknownOpcode", opcode)
    }

    public execute() {
        if (this.#hasExecuted) {
            throw new Error("Virtual machine has already been executed")
        }

        this.#hasExecuted = true

        while (this.#programCounter < this.#instructions.length) {
            this.#executeInstruction(this.#instructions[this.#programCounter])
            this.#programCounter += 1
        }
    }
}

export interface VirtualMachineOptions {
    instructions: Instruction[]
    stack: Stack
}
