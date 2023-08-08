import { BinaryExpressionNode, BlockStatementNode, CallExpressionNode, Expression, ExpressionStatementNode, IfStatementNode, ProgramNode, Statement } from "../parser";
import { Instruction, Operand } from "$vm"
import { throwTypeError } from "$errors";

export class Compiler {
    public constructor(program: ProgramNode) {
        this.#program = program
    }

    #program: ProgramNode

    #compileBinaryExpression(node: BinaryExpressionNode): Instruction[] {
        const left = this.#compileExpression(node.left)
        const right = this.#compileExpression(node.right)

        const operator: Instruction = {
            opcode: "BINARY_OPERATION",
            operand: Operand.fromString(node.operator)
        }

        return [...right, ...left, operator]
    }

    #compileCallExpression(node: CallExpressionNode): Instruction[] {
        if (node.callee.type != "Identifier") {
            return throwTypeError("NotCallable", node.callee.type)
        }

        const instructions: Instruction[] = []

        for (const argument of node.args) {
            instructions.unshift(...this.#compileExpression(argument.expression))
        }

        return [
            { opcode: "LOAD_NAME", operand: Operand.fromString(node.callee.name) },
            ...instructions,
            { opcode: "CALL_FUNCTION", operand: Operand.fromNumber(node.args.length) }
        ]
    }

    #compileExpression(expression: Expression): Instruction[] {
        if (expression.type === "String") {
            return [{
                opcode: "LOAD_CONST",
                operand: Operand.fromString(expression.value)
            }]
        }

        else if (expression.type === "Boolean") {
            return [{
                opcode: "LOAD_CONST",
                operand: Operand.fromBoolean(expression.value)
            }]
        }

        else if (expression.type === "Integer" || expression.type === "Float") {
            return [{
                opcode: "LOAD_CONST",
                operand: Operand.fromNumber(expression.value)
            }]
        }

        else if (expression.type === "CallExpression") {
            return this.#compileCallExpression(expression)
        }

        else if (expression.type === "BinaryExpression") {
            return this.#compileBinaryExpression(expression)
        }

        else if (expression.type === "Identifier") {
            return [
                { opcode: "LOAD_NAME", operand: Operand.fromString(expression.name) }
            ]
        }

        else if (expression.type === "UnaryExpression") {
            return [
                ...this.#compileExpression(expression.expression),
                { opcode: "UNARY_OPERATION", operand: Operand.fromString(expression.operator) }
            ]
        }

        throw new Error("not implemented")
    }

    #compileBlockStatement(statement: BlockStatementNode): Instruction[] {
        return statement.body.map((statement) => this.#compileStatement(statement)).flat()
    }

    #compileIfStatement(statement: IfStatementNode): Instruction[] {
        const then = this.#compileBlockStatement(statement.then)
        const else_ = []

        if (statement.else !== null) {
            if (statement.else.type === "IfStatement") {
                
            } else {
                else_.push(...this.#compileBlockStatement(statement.else))
            }
        }

        return [
            ...this.#compileExpression(statement.test.expression),
            { opcode: "POP_JUMP_FORWARD_IF_FALSE", operand: Operand.fromNumber(then.length + 1) },
            ...then,
            { opcode: "JUMP_FORWARD", operand: Operand.fromNumber(10) },
            ...else_,
        ] satisfies Instruction[]
    }

    #compileStatement(statement: Statement): Instruction[] {
        if (statement.type === "ExpressionStatement") {
            return this.#compileExpression(statement.expression)
        } else if (statement.type === "IfStatement") {
            return this.#compileIfStatement(statement)
        }

        throw new Error(`unknown statement ${statement.type}`)
    }

    public compile(): Instruction[] {
        const instructions: Instruction[] = []

        for (const statement of this.#program.body) {
            instructions.push(...this.#compileStatement(statement))
        }

        return instructions
    }
}