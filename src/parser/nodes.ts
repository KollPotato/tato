export type ProgramNode = {
    readonly type: "Program"
    readonly body: Statement[]
}

/* ----- Statements -----  */

export type Statement =
    | ExpressionStatementNode
    | FunctionDeclarationNode
    | VariableDeclarationNode
    | BlockStatementNode
    | IfStatementNode

export type BlockStatementNode = {
    readonly type: "BlockStatement"
    readonly body: Statement[]
}

export type ExpressionStatementNode = {
    readonly type: "ExpressionStatement"
    readonly expression: Expression
}

export type FunctionDeclarationNode = {
    readonly type: "FunctionDeclaration"
    readonly identifier: IdentifierNode
    readonly params: IdentifierNode[]
    readonly body: BlockStatementNode | ExpressionStatementNode
}

export type VariableDeclarationNode = {
    readonly type: "VariableDeclaration"
    readonly identifier: IdentifierNode
    readonly value: ExpressionStatementNode
    readonly kind: "val" | "mut"
}

export type IfStatementNode = {
    readonly type: "IfStatement"
    readonly test: ExpressionStatementNode
    readonly then: BlockStatementNode
    readonly else: BlockStatementNode | IfStatementNode | null
}

/* ----- Expressions -----  */

export type Expression =
    | IdentifierNode
    | StringNode
    | IntegerNode
    | BooleanNode
    | FloatNode
    | CallExpressionNode
    | BinaryExpressionNode
    | UnaryExpressionNode

export type IdentifierNode = {
    readonly type: "Identifier"
    readonly name: string
}

export type StringNode = {
    readonly type: "String"
    readonly value: string
}

export type IntegerNode = {
    readonly type: "Integer"
    readonly value: number
}

export type FloatNode = {
    readonly type: "Float"
    readonly value: number
}

export type BooleanNode = {
    readonly type: "Boolean"
    readonly value: boolean
}

export type BinaryExpressionNode = {
    readonly type: "BinaryExpression"
    readonly left: Expression
    readonly right: Expression
    readonly operator: string
}

export type CallExpressionNode = {
    readonly type: "CallExpression"
    readonly callee: IdentifierNode
    readonly args: ExpressionStatementNode[]
}

export type UnaryExpressionNode = {
    readonly type: "UnaryExpression"
    readonly operator: string
    readonly expression: Expression
}

/* ----- Type Annotations ----- */

export type TypeAnnotation = 
    | GenericTypeAnnotation
    | ArrayTypeAnnotation

export type GenericTypeAnnotation = {
    type: "GenericTypeAnnotation",
    annotation: IdentifierNode | IntegerNode | FloatNode
}

export type ArrayTypeAnnotation = {
    type: "ArrayTypeAnnotation",
    element: TypeAnnotation
}