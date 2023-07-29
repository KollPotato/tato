import { OPERATORS } from "./parser"

export const enum NodeType {
    ExpressionStatement = "ExpressionStatement",
    CallExpression = "CallExpression",
    BinaryExpression = "BinaryExpression",
    String = "String",
    Number = "Number",
    Identifier = "Identifier",
    Boolean = "Boolean",
    Program = "Program",
    IfStatement = "IfStatement",
    BlockStatement = "BlockStatement"
}

export type Node = ExpressionStatementNode | IfStatementNode

export type ExpressionStatementNode = {
    type: NodeType.ExpressionStatement
    expression: CallExpressionNode | BinaryExpressionNode | IdentiferNode | StringNode | NumberNode | BooleanNode
}

export type CallExpressionNode = {
    type: NodeType.CallExpression
    callee: ExpressionStatementNode["expression"]
    args: ExpressionStatementNode[]
}

export type IdentiferNode = {
    type: NodeType.Identifier
    name: string
}

export type BinaryExpressionNode = {
    type: NodeType.BinaryExpression
    left: ExpressionStatementNode
    right: ExpressionStatementNode
    operator: typeof OPERATORS[number]
}

export type StringNode = {
    type: NodeType.String
    value: string
}

export type NumberNode = {
    type: NodeType.Number
    value: number
}

export type BooleanNode = {
    type: NodeType.Boolean
    value: boolean
}

export type ProgramNode = {
    type: NodeType.Program
    body: BlockStatementNode
}

export type BlockStatementNode = {
    type: NodeType.BlockStatement
    body: Node[]
}

export type IfStatementNode = {
    type: NodeType.IfStatement
    test: ExpressionStatementNode
    body: BlockStatementNode
    else: BlockStatementNode | null
}