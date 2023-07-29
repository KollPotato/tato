import { raise } from "../error";
import { CallExpressionNode, ExpressionStatementNode, IfStatementNode, Node, NodeType, ProgramNode } from "./nodes";
import { TokenStream } from "./token-stream";
import { Token } from "./tokens";

import "@total-typescript/ts-reset"

export const OPERATOR_PRECEDENCE = {
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
    "POWER": 20,
    "NONE": 0
} as const satisfies Record<Extract<Token["type"], typeof OPERATORS[number]> | "NONE", number>

export const OPERATORS = [
    "ASSIGN",
    "LESS",
    "GREATER",
    "LESS_OR_EQUAL",
    "GREATER_OR_EQUAL",
    "EQUAL",
    "NOT_EQUAL",
    "DIVIDE",
    "SUBTRACT",
    "ADD",
    "MULTIPLY",
    "DIVIDE",
    "MODULO",
    "POWER"
] as const

export class Parser {
    public constructor(tokenStream: TokenStream) {
        this.#tokenStream = tokenStream
    }

    #tokenStream: TokenStream

    #is(type: Token["type"]): boolean {
        const token = this.#tokenStream.peek()

        return token != null
            ? token.type === type
            : false
    }

    #eat<T extends Token>(type: T["type"], required: boolean = true): T | null {
        const token = this.#tokenStream.peek()

        if (token?.type === type && !required) {
            return this.#tokenStream.next() as T | null
        }

        return raise({
            name: "ParserError",
            message: `Token type ${type} was expected`
        })
    }

    #skip(type: Token["type"], required: boolean = true): void {
        const token = this.#tokenStream.peek()

        if (token == null) {
            return
        }

        if (token.type === type) {
            this.#tokenStream.next()
            return
        }

        if (!required) {
            return
        }

        raise({
            name: "ParserError",
            message: `Token type ${type} was expected`
        })
    }

    #parseDelimited<T>(start: Token["type"], stop: Token["type"], separator: Token["type"], parser: () => T): T[] {
        const result: T[] = []
        let isFirst = true

        this.#skip(start)

        while (this.#tokenStream.peek() != null) {
            if (this.#is(stop)) {
                break
            }

            if (isFirst) {
                isFirst = false
            }

            else {
                this.#skip(separator)
            }

            if (this.#is(stop)) {
                break
            }

            result.push(parser())
        }

        this.#skip(stop)

        return result
    }

    #maybeBinary(left: ExpressionStatementNode, operator: keyof typeof OPERATOR_PRECEDENCE): ExpressionStatementNode {
        const token = this.#tokenStream.peek()
        
        if (token == null || !OPERATORS.includes(token.type)) {
            return left
        }

        const tokenPrecedence = OPERATOR_PRECEDENCE[token.type as keyof typeof OPERATOR_PRECEDENCE]

        if (tokenPrecedence > OPERATOR_PRECEDENCE[operator]) {
            this.#tokenStream.next()

            const right = this.#maybeBinary(this.#parseAtom()!, token.type as keyof typeof OPERATOR_PRECEDENCE)

            return this.#maybeBinary({
                type: NodeType.ExpressionStatement,
                expression: {
                    type: NodeType.BinaryExpression,
                    left,
                    right,
                    operator: token.type as typeof OPERATORS[number]
                }
            }, operator);
        }

        return left
    }

    #parseIfStatement(): IfStatementNode {
        const test = this.#parseAny()

        if (test == null) {
            throw new Error("no test")
        }

        return {
            type: NodeType.IfStatement,
            test,
            body: {
                type: NodeType.BlockStatement,
                body: this.#parseDelimited("LEFT_CURLY_BRACE", "RIGHT_CURLY_BRACE", "NEWLINE", () => this.#parseAtom()).filter(Boolean)
            },
            else: null
        }
    }

    #parseAtom(): ExpressionStatementNode | IfStatementNode | null {
        return this.#maybeCallExpression(() => {
            const token = this.#tokenStream.peek()

            if (token == null) {
                return null
            }

            else if (this.#is("LEFT_PARENTHESIS")) {
                this.#skip("LEFT_PARENTHESIS")
                const expression = this.#parseAny()
                this.#skip("RIGHT_PARENTHESIS")
                return expression
            }

            else if (token.type === "IDENTIFIER") {
                this.#tokenStream.next()

                return {
                    type: NodeType.ExpressionStatement,
                    expression: {
                        type: NodeType.Identifier,
                        name: token.value
                    }
                }
            }

            else if (token.type === "STRING") {
                this.#tokenStream.next()

                return {
                    type: NodeType.ExpressionStatement,
                    expression: {
                        type: NodeType.String,
                        value: token.value
                    }
                }
            }

            else if (token.type === "NUMBER") {
                this.#tokenStream.next()

                return {
                    type: NodeType.ExpressionStatement,
                    expression: {
                        type: NodeType.Number,
                        value: token.value
                    }
                }
            }

            else if (token.type === "KEYWORD") {
                this.#tokenStream.next()

                if (token.value === "true" || token.value === "false") {
                    return {
                        type: NodeType.ExpressionStatement,
                        expression: {
                            type: NodeType.Boolean,
                            value: token.value === "true"
                        }
                    }
                }

                else if (token.value === "if") {
                    return this.#parseIfStatement()
                }
            }
            
            return raise({
                name: "ParserError",
                message: `Token type "${token.type}" was not expected lol`
            })
        })
    }

    #parseCallExpression(callee: ExpressionStatementNode): CallExpressionNode {
        return {
            type: NodeType.CallExpression,
            callee: callee.expression,
            args: this.#parseDelimited(
                "LEFT_PARENTHESIS",
                "RIGHT_PARENTHESIS",
                "COMMA",
                () => this.#parseAny()
            ).filter(Boolean)
        };
    }

    #maybeCallExpression(fn: () => ExpressionStatementNode | IfStatementNode | null): ExpressionStatementNode | IfStatementNode | null {
        const expression = fn()

        if (expression == null) {
            return null
        }

        if (expression.type != NodeType.ExpressionStatement) {
            return expression
        }

        if (this.#is("LEFT_PARENTHESIS")) {
            return {
                type: NodeType.ExpressionStatement,
                expression: this.#parseCallExpression(expression)
            }
        }

        return expression
    }

    #parseAny(): ExpressionStatementNode | IfStatementNode | null {
        while (this.#tokenStream.peek()?.type === "NEWLINE") {
            this.#tokenStream.next()
        }

        return this.#maybeCallExpression(() => {
            const atom = this.#parseAtom()

            if (atom == null) {
                return null
            }

            if (atom.type != NodeType.ExpressionStatement) {
                return atom
            }

            return this.#maybeBinary(atom, "NONE")
        })
    }

    public parseProgram(): ProgramNode {
        const statements: Node[] = []

        while (true) {
            const statement = this.#parseAny()

            if (statement == null) {
                break
            }

            statements.push(statement)
        }

        return {
            type: NodeType.Program,
            body: {
                type: NodeType.BlockStatement,
                body: statements
            }
        }
    }
}