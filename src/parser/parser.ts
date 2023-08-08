import { raise } from "./errors";
import { BlockStatementNode, BooleanNode, CallExpressionNode, Expression, ExpressionStatementNode, FloatNode, FunctionDeclarationNode, IdentifierNode, IfStatementNode, IntegerNode, ProgramNode, Statement, StringNode, UnaryExpressionNode, VariableDeclarationNode } from "./nodes";
import { OPERATOR_PRECEDENCE, isBinaryOperator } from "./operators";
import { TokenStream } from "./token-stream";
import { Token } from "./tokens";

export class Parser {
    public constructor(tokenStream: TokenStream) {
        this.#tokenStream = tokenStream
    }

    #tokenStream: TokenStream

    #skip(type: Token["type"], required: boolean = true): boolean {
        const token = this.#tokenStream.last

        if (token == null) {
            return false
        }

        if (token.type === type) {
            this.#tokenStream.eat()
            return true
        }

        if (!required) {
            return false
        }

        return raise({
            filename: "<input>",
            error: `expected ${type}, but got ${this.#tokenStream.last?.type}`,
            inputStream: this.#tokenStream.inputStream,
            range: [token.range[0], token.range[0]]
        })
    }

    #skipMany(types: Token["type"][], once: boolean = true) {
        let success = false

        loop1: for (const type of types) {
            while (this.#tokenStream.last?.type === type) {
                this.#tokenStream.eat()
                success = true

                if (once) {
                    break loop1
                }
            }
        }   

        if (!success && this.#tokenStream.last != null) {
            raise({
                filename: "<input>",
                error: `expected ${types.join(" or ")}, but got ${this.#tokenStream.last?.type}`,
                inputStream: this.#tokenStream.inputStream,
                range: [this.#tokenStream.last.range[0], this.#tokenStream.last.range[0]]
            })
        }
    }

    #parseIfStatement(): IfStatementNode {
        this.#skip("KEYWORD")

        const test = this.#parseExpressionStatement()
        const body = this.#parseBlockStatement()

        const maybeElse = this.#tokenStream.last

        if (maybeElse?.type === "KEYWORD" && maybeElse.value === "else") {
            this.#tokenStream.eat()

            const else_ = this.#parseBlockStatement()

            return {
                type: "IfStatement",
                test,
                then: body,
                else: else_
            }
        }

        return {
            type: "IfStatement",
            test,
            then: body,
            else: null,
        }
    }

    #parseExpression(): Expression {
        return this.#maybeCallExpression(() => {
            
            const token = this.#tokenStream.eat()
            
            if (token == null) {
                const position = this.#tokenStream.inputStream.position

                raise({
                    filename: "<input>",
                    error: "expression was expected",
                    inputStream: this.#tokenStream.inputStream,
                    range: [position, position]
                })
                throw new Error(`expression was expected`)
            }

            else if (token.type === "BANG") {
                return this.#parseUnaryExpression(token)
            }

            else if (token.type === "IDENTIFIER") {
                return {
                    type: "Identifier",
                    name: token.value
                } satisfies IdentifierNode
            }

            else if (token.type == "INTEGER") {
                return {
                    type: "Integer",
                    value: token.value
                } satisfies IntegerNode
            }

            else if (token.type == "FLOAT") {
                return {
                    type: "Float",
                    value: token.value
                } satisfies FloatNode
            }

            else if (token.type == "STRING") {
                return {
                    type: "String",
                    value: token.value
                } satisfies StringNode
            }

            else if (token.type === "KEYWORD" && (token.value === "true" || token.value === "false")) {
                return {
                    type: "Boolean",
                    value: token.value === "true"
                } satisfies BooleanNode
            }

            else if (token.type === "LEFT_PARENTHESIS") {
                this.#skip("LEFT_PARENTHESIS")
                const expression = this.#parseExpression()
                this.#skip("RIGHT_PARENTHESIS")
                return expression
            }

            return raise({
                filename: "<input>",
                error: `unexpected ${token.type}`,
                inputStream: this.#tokenStream.inputStream,
                range: [token.range[0], token.range[0]]
            })
        })
    }

    #parseVariableDeclaration(kind: "val" | "mut"): VariableDeclarationNode {
        this.#tokenStream.eat()

        const identifier = this.#parseIdentifier()

        this.#skip("ASSIGN")
    
        const value = this.#parseExpressionStatement()

        if (!this.#skip("END_OF_LINE", false)) {
            this.#skip("SEMICOLON")
        }

        return {
            type: "VariableDeclaration",
            kind,
            identifier,
            value
        }
    }

    #parseDelimited<T>(
        start: Token["type"],
        end: Token["type"],
        separators: Array<Token["type"]>,
        parser: () => T
    ): T[] {
        const result: T[] = []
        let isFirst = true

        this.#skip(start)

        while (this.#tokenStream.last != null) {
            if (this.#tokenStream.last.type === end) {
                break
            }

            if (isFirst) {
                isFirst = false
            }

            else {
                this.#skipMany(separators)
            }

            if (this.#tokenStream.last.type === end) {
                break
            }

            result.push(parser())
        }

        this.#skip(end)

        return result
    }

    #parseCallExpression(callee: Expression): CallExpressionNode {
        if (callee.type !== "Identifier") {
            throw new Error("Callee must be an identifier")
        }

        return {
            type: "CallExpression",
            callee,
            args: this.#parseDelimited(
                "LEFT_PARENTHESIS",
                "RIGHT_PARENTHESIS",
                ["COMMA"],
                () => {
                    return this.#parseExpressionStatement()
                }
            )
        }
    }

    #maybeCallExpression(fn: () => Expression): Expression {
        const expression = fn()

        if (this.#tokenStream.last?.type === "LEFT_PARENTHESIS") {
            return this.#parseCallExpression(expression)
        }

        return expression
    }

    #maybeBinaryExpression(left: Expression, precedence: number): Expression {
        const token = this.#tokenStream.last
        
        if (token == null || !isBinaryOperator(token.type)) {
            return left
        }

        const tokenPrecedence = OPERATOR_PRECEDENCE[token.type]

        
        if (tokenPrecedence > precedence) {
            this.#tokenStream.eat()
            
            while (this.#tokenStream.last?.type === "END_OF_LINE") {
                this.#tokenStream.eat()
            }

            const maybeLeft = this.#parseExpression()
            
            const right = this.#maybeBinaryExpression(maybeLeft, tokenPrecedence)
            
            return this.#maybeBinaryExpression({
                type: "BinaryExpression",
                left,
                right,
                operator: token.type
            }, precedence);
        }
        
        return left
    }

    #parseUnaryExpression(operator: Token): UnaryExpressionNode {
        if (operator.type === "BANG") {
            const expression = this.#parseExpression()

            return {
                type: "UnaryExpression",
                operator: "BANG",
                expression
            }
        }

        throw new Error("wuu")
    }

    #parseExpressionStatement(): ExpressionStatementNode {
        return {
            type: "ExpressionStatement",
            expression: this.#maybeBinaryExpression(this.#maybeCallExpression(() => this.#parseExpression()), 0)
        }
    }

    #parseIdentifier(): IdentifierNode {
        const token = this.#tokenStream.eat()

        if (token?.type !== "IDENTIFIER") {
            throw new Error("identifier was expected")
        }

        return {
            type: "Identifier",
            name: token.value
        }
    }

    #parseBlockStatement(): BlockStatementNode {
        return {
            type: "BlockStatement",
            body: this.#parseDelimited(
                "LEFT_CURLY_BRACKET",
                "RIGHT_CURLY_BRACKET",
                ["END_OF_LINE", "SEMICOLON"],
                () => this.#parseStatement()
            ).filter(Boolean)
        }
    }

    #parseFunctionDeclaration(): FunctionDeclarationNode {
        this.#skip("KEYWORD")
        const identifier = this.#parseIdentifier()
        const params = this.#parseDelimited("LEFT_PARENTHESIS", "RIGHT_PARENTHESIS", ["COMMA"], () => this.#parseIdentifier())

        if (this.#tokenStream.last?.type === "ARROW") {
            this.#tokenStream.eat()

            const body = this.#parseExpressionStatement()

            return {
                type: "FunctionDeclaration",
                identifier,
                params,
                body
            }
        }

        const body = this.#parseBlockStatement()

        return {
            type: "FunctionDeclaration",
            identifier,
            params,
            body
        }
    }

    #parseStatement(): Statement | null {
        const token = this.#tokenStream.last

        if (token == null) {
            return null
        }

        else if (
            token.type === "IDENTIFIER" ||
            token.type === "INTEGER" ||
            token.type === "FLOAT" ||
            token.type === "BANG" ||
            (token.type === "KEYWORD" && (token.value === "true" || token.value === "false"))
        ) {
            return this.#parseExpressionStatement()
        }

        else if (
            token.type === "KEYWORD" &&
            token.value === "fun"
        ) {
            return this.#parseFunctionDeclaration()
        }

        else if (
            token.type === "KEYWORD" &&
            (token.value === "val" || token.value === "mut")
        ) {
            return this.#parseVariableDeclaration(token.value)
        }

        else if (
            token.type === "KEYWORD" &&
            token.value === "if"
        ) {
            return this.#parseIfStatement()
        }

        return null
    }

    public parse(): ProgramNode {
        const body: Statement[] = []

        while (true) {
            if (this.#skip("END_OF_LINE", false)) {
                continue
            }

            const statement = this.#parseStatement()

            if (statement == null) {
                break
            }

            body.push(statement)
        }

        return {
            type: "Program",
            body
        }
    }
}