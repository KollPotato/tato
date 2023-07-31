import { Operator } from "$shared/operators"

export type ProgramNode = Statement[]

export type Statement = ExpressionNode

export type ExpressionNode = {
    type: "Expression"
    expression: CallExpressionNode | BinaryExpressionNode | IdentifierNode | StringNode | NumberNode | BooleanNode
}

export type CallExpressionNode = {
    type: "CallExpression"
    callee: ExpressionNode["expression"]
    args: ExpressionNode[]
}

export type BinaryExpressionNode = {
    type: "BinaryExpression"
    left: ExpressionNode
    right: ExpressionNode
    operator: Operator
}

export type IdentifierNode = {
    type: "Identifier"
    name: string
}

export type StringNode = {
    type: "String"
    value: string
}

export type NumberNode = {
    type: "Number"
    value: number
}

export type BooleanNode = {
    type: "Boolean"
    value: boolean
}
