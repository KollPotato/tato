import { throwTypeError } from "$errors"
import chalk from "chalk"
import { BinaryOperator } from "../shared/operators"

export type OperandsMap = {
    "number": number
    "string": string
    "boolean": boolean
    "none": null
    "function": {
        name: string
        fn: (...args: Operand[]) => Operand
    }
}

export class Operand<TType extends keyof OperandsMap = keyof OperandsMap> {
    private constructor(type: TType, value: OperandsMap[TType]) {
        this.#type = type
        this.#value = value
    }

    #type: TType
    #value: OperandsMap[TType]

    public get type(): TType {
        return this.#type
    }

    public get value(): OperandsMap[TType] {
        return this.#value
    }

    public isNumber(): this is Operand<"number"> {
        return this.#type === "number"
    }

    public isString(): this is Operand<"string"> {
        return this.#type === "string"
    }

    public isBoolean(): this is Operand<"boolean"> {
        return this.#type === "boolean"
    }

    public isFunction(): this is Operand<"function"> {
        return this.#type === "function"
    }

    public isNone(): this is Operand<"none"> {
        return this.#type === "none"
    }

    public binary(operand: Operand, operator: BinaryOperator): Operand {
        if (this.isString() && operand.isString() && operator === "ADD") {
            return new Operand("string", this.#value + operand.value)
        }

        else if (this.isString() && operand.isString()) {
            if (operator === "EQUAL") {
                return Operand.fromBoolean(this.#value === operand.value)
            }

            else if (operator === "NOT_EQUAL") {
                return Operand.fromBoolean(this.#value !== operand.value)
            }
        }

        else if (this.isBoolean() && operand.isBoolean()) {
            if (operator === "EQUAL") {
                return Operand.fromBoolean(this.#value === operand.value)
            }

            else if (operator === "NOT_EQUAL") {
                return Operand.fromBoolean(this.#value !== operand.value)
            }
        }

        else if (this.isNumber() && operand.isNumber()) {
            if (operator === "ADD") {
                return Operand.fromNumber(this.#value + operand.value)
            }
    
            else if (operator === "SUBTRACT") {
                return Operand.fromNumber(this.#value - operand.value)
            }
    
            else if (operator === "DIVIDE") {
                return Operand.fromNumber(this.#value / operand.value)
            }
    
            else if (operator === "MODULO") {
                return Operand.fromNumber(this.#value % operand.value)
            }
    
            else if (operator === "MULTIPLY") {
                return Operand.fromNumber(this.#value * operand.value)
            }
    
            else if (operator === "EQUAL") {
                return Operand.fromBoolean(this.#value === operand.value)
            }
    
            else if (operator === "NOT_EQUAL") {
                return Operand.fromBoolean(this.#value !== operand.value)
            }

            else if (operator === "GREATER") {
                return Operand.fromBoolean(this.#value > operand.value)
            }
    
            else if (operator === "LESS") {
                return Operand.fromBoolean(this.#value < operand.value)
            }

            else if (operator === "GREATER_OR_EQUAL") {
                return Operand.fromBoolean(this.#value >= operand.value)
            }
    
            else if (operator === "LESS_OR_EQUAL") {
                return Operand.fromBoolean(this.#value <= operand.value)
            }
        }

        return throwTypeError("Operation", this, operand, operator)
    }

    public static fromBoolean(boolean: OperandsMap["boolean"]): Operand<"boolean"> {
        return new Operand("boolean", boolean)
    }

    public static fromString(string: OperandsMap["string"]): Operand<"string"> {
        return new Operand("string", string)
    }

    public static fromNumber(number: OperandsMap["number"]): Operand<"number"> {
        return new Operand("number", number)
    }
    
    public static fromFunction(fn: OperandsMap["function"]): Operand<"function"> {
        return new Operand("function", fn)
    }

    public static fromNone(): Operand<"none"> {
        return new Operand("none", null)
    }

    public toString(): string {
        if (this.isNumber() || this.isBoolean() || this.isNone()) {
            return chalk.yellowBright(this.#value)
        }

        else if (this.isString()) {
            return chalk.white(this.#value)
        }
        
        else if (this.isFunction()) {
            return `<function ${this.#value.name}>`
        }

        throw new Error("How did we get here?")
    }

    public [Symbol.toString()](): string {
        return this.toString()
    }
}
