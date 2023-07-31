export const OPERATOR_PRECEDENCE: Record<Operator, number> = {
    "ASSIGN": 1,
    "LESS": 7,
    "GREATER": 7,
    "LESS_OR_EQUAL": 7,
    "GREATER_OR_EQUAL": 7,
    "EQUAL": 7,
    "NOT_EQUAL": 7,
    "ADD": 10,
    "SUBTRACT": 10,
    "MULTIPLY": 20,
    "DIVIDE": 20,
    "MODULO": 20,
    "POWER": 20
} as const

export const BINARY_OPERATORS = [
    "ADD",
    "SUBTRACT",
    "MULTIPLY",
    "DIVIDE",
    "MODULO",
    "POWER",
    "LESS",
    "GREATER",
    "LESS_OR_EQUAL",
    "GREATER_OR_EQUAL",
    "EQUAL",
    "NOT_EQUAL",
] as const

export const LOGICAL_OPERATORS = [
    "AND",
    "OR",
    "XOR"
]

export const OPERATORS = [
    ...BINARY_OPERATORS,
    ...LOGICAL_OPERATORS,
] as const

export const isBinaryOperator = (operator: string): operator is BinaryOperator => {
    return BINARY_OPERATORS.includes(operator)
}

export const isLogicalOperator = (operator: string): operator is LogicalOperator => {
    return LOGICAL_OPERATORS.includes(operator)
}

export type BinaryOperator = typeof BINARY_OPERATORS[number]
export type LogicalOperator = typeof LOGICAL_OPERATORS[number]

export type Operator = BinaryOperator | LogicalOperator