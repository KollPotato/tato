import chalk from "chalk";
import { Instruction } from "./bytecode";
import { Operand } from "./operands";
import { Stack } from "./stack";
import { BUILTIN_NAMES } from "./builtins";
import { findClosestMatch } from "../utils";
import { throwNameError } from "$errors";
import { throwVirtualMachineError } from "$errors";
import { isBinaryOperator } from "../shared/operators";
import { throwTypeError } from "$errors";

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

    #loadConst(operand: Operand) {
        this.#stack.push(operand)
    }

    #binaryOperation(operator: Operand<"string">) {
        if (!operator.isString() || !isBinaryOperator(operator.value)) {
            throw new Error("")
        }

        const v1 = this.#stack.pop()
        const v2 = this.#stack.pop()

        return v1.binary(v2, operator.value)
    }

    #loadName(operand: Operand<"string">): void {
        for (const name in BUILTIN_NAMES) {
            if (name === operand.value) {
                this.stack.push(BUILTIN_NAMES[name])
                return
            }
        }

        const closestNameMatch = findClosestMatch(operand.value, Object.keys(BUILTIN_NAMES), 2)
        throwNameError("UnknownName", operand.value, closestNameMatch)
    }

    #executeInstruction(instruction: Instruction) {
        const { opcode } = instruction

        if (opcode === "LOAD_CONST") {
            this.#loadConst(instruction.operand)
            return
        }

        else if (opcode === "POP") {
            this.#stack.pop()
            return
        }

        else if (opcode === "JUMP_IF_TRUE") {
            const v1 = this.#stack.last()

            if (v1.isBoolean() && v1.value) {
                this.#programCounter = instruction.operand.value
            }

            return
        }

        else if (opcode === "JUMP_IF_FALSE") {
            const v1 = this.#stack.last()

            if (v1.isBoolean() && !v1.value) {
                this.#programCounter = instruction.operand.value
            }

            return
        }

        else if (opcode === "ECHO") {
            const v1 = this.#stack.last()
            console.log(`${chalk.greenBright(v1.type)}(${chalk.yellowBright(v1.value)})`)

            return
        }

        else if (opcode === "LOAD_NAME") {
            this.#loadName(instruction.operand)
            return
        }

        else if (opcode === "CALL_FUNCTION") {
            const args: Operand[] = []

            for (let i = 0; i < instruction.operand.value; i++) {
                args.push(this.stack.pop())
            }

            const fn = this.stack.pop()

            if (!fn.isFunction()) {
                return throwTypeError("NotCallable", fn.type)
            }

            fn.value(...args)

            return
        }

        else if (opcode === "BINARY_OPERATION") {
            if (!instruction.operand.isString()) {
                throw new Error()
            }
            
            this.#binaryOperation(instruction.operand)
            return
        }

        throwVirtualMachineError("UnknownOpcode", opcode)
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
