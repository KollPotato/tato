import { throwTypeError } from "$errors"
import { BinaryOperator } from "../shared/operators"

export type OperandsMap = {
    "number": number
    "string": string
    "boolean": boolean
    "function": (...args: Operand[]) => unknown
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

    public binary(operand: Operand, operator: BinaryOperator): Operand<"string" | "number"> {
        if (this.isString() && operand.isString() && operator === "ADD") {
            return new Operand("string", this.#value + operand.value)
        }

        if (!this.isNumber() || !operand.isNumber()) {
            throwTypeError("Operation", this, operand, operator)
            throw new Error("")
        }

        if (operator === "ADD") {
            return new Operand("number", this.#value + operand.value)
        }

        else if (operator === "SUBTRACT") {
            return new Operand("number", this.#value + operand.value)
        }

        else if (operator === "DIVIDE") {
            return new Operand("number", this.#value + operand.value)
        }

        else if (operator === "MODULO") {
            return new Operand("number", this.#value + operand.value)
        }

        else if (operator === "MULTIPLY") {
            return new Operand("number", this.#value + operand.value)
        }

        throw new Error()
    }

    public static fromBoolean(boolean: boolean): Operand<"boolean"> {
        return new Operand("boolean", boolean)
    }

    public static fromString(string: string): Operand<"string"> {
        return new Operand("string", string)
    }

    public static fromNumber(number: number): Operand<"number"> {
        return new Operand("number", number)
    }
    
    public static fromFunction(fn: (...args: Operand[]) => unknown): Operand<"function"> {
        return new Operand("function", fn)
    }

    public toString(): string {
        return `${this.#type} ${this.#value}`
    }

    public [Symbol.toString()](): string {
        return this.toString()
    }
}
