import { throwVirtualMachineError } from "$errors"
import type { Operand } from "./operands"

export class Stack {
    #values: Operand[]
    #size: number

    public constructor(limit: number = 1000) {
        if (limit < 0) {
            throw new Error("Invalid stack size")
        }

        this.#values = []
        this.#size = limit
    }

    public get size(): number {
        return this.#values.length
    }

    public get isEmpty(): boolean {
        return this.#values.length <= 0
    }

    public at(index: number): Operand {
        const value = this.#values.at(index)

        if (value === undefined) {
            throw new Error("wrong!!!")
        }

        return value
    }

    public push(operand: Operand): void {
        if (this.#values.length + 1 > this.#size) {
            throwVirtualMachineError("StackOverflow", this.#size)
        }
        
        this.#values.push(operand)
    }
    
    public last(): Operand {
        const value = this.#values.at(-1)
        
        if (value === undefined) {
            return throwVirtualMachineError("StackUnderflow")
        }
        
        return value
    }
    
    public pop(): Operand {
        const value = this.#values.pop()
        
        if (value === undefined) {
            return throwVirtualMachineError("StackUnderflow")
        }

        return value
    }
}
