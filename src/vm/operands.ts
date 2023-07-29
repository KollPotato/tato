export type OperandBuilder<TType extends string, TValue extends unknown> = {
    readonly type: TType
    readonly value: TValue
} 

export type Operand = StringOperand | NumberOperand | FunctionOperand | BooleanOperand

export type NumberOperand = OperandBuilder<"number", number>
export type StringOperand<T extends string = string> = OperandBuilder<"string", T>
export type BooleanOperand = OperandBuilder<"boolean", boolean>
export type FunctionOperand = OperandBuilder<"function", FunctionOperandValue>

export type FunctionOperandValue = (...args: Operand[]) => unknown

export const operands = {
    string: (value: string): StringOperand => {
        return { type: "string", value }
    },
    number: (value: number): NumberOperand => {
        return { type: "number", value }
    },
    boolean: (value: boolean): BooleanOperand => {
        return { type: "boolean", value }
    },
    function: (value: FunctionOperandValue): FunctionOperand => {
        return { type: "function", value }
    },
}
