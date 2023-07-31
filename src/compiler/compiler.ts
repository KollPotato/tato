import { BinaryExpressionNode, CallExpressionNode, ExpressionStatementNode, IfStatementNode, Node, NodeType, ProgramNode } from "$parser";
import { Instruction, Operand } from "$vm"
import { throwTypeError } from "$errors";

export class Compiler {
    public constructor(program: ProgramNode) {
        this.#program = program
        this.#index = 0
    }

    #program: ProgramNode
    #index: number

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
        if (node.callee.type != NodeType.Identifier) {
            return throwTypeError("NotCallable", node.callee.type)
        }

        const instructions: Instruction[] = []

        for (const argument of node.args) {
            instructions.unshift(...this.#compileExpression(argument))
        }

        this.#index += 2

        return [
            { opcode: "LOAD_NAME", operand: Operand.fromString(node.callee.name) },
            ...instructions,
            { opcode: "CALL_FUNCTION", operand: Operand.fromNumber(node.args.length) }
        ]
    }

    #compileExpression(node: ExpressionStatementNode): Instruction[] {
        const { expression } = node

        if (expression.type === NodeType.String) {
            this.#index += 1
            return [{ opcode: "LOAD_CONST", operand: Operand.fromString(expression.value) }]
        }

        else if (expression.type === NodeType.Boolean) {
            this.#index += 1
            return [{ opcode: "LOAD_CONST", operand: Operand.fromBoolean(expression.value) }]
        }

        else if (expression.type === NodeType.Number) {
            this.#index += 1
            return [{ opcode: "LOAD_CONST", operand: Operand.fromNumber(expression.value) }]
        }

        else if (expression.type === NodeType.CallExpression) {
            return this.#compileCallExpression(expression)
        }

        else if (expression.type === NodeType.BinaryExpression) {
            return this.#compileBinaryExpression(expression)
        }

        else if (expression.type === NodeType.Identifier) {
            return [
                { opcode: "LOAD_NAME", operand: Operand.fromString(expression.name) }
            ]
        }

        throw new Error("Not implemented")
    }

    #compileIfStatement(statement: IfStatementNode): Instruction[] {
        const bodyInstructions: Instruction[] = statement
            .body
            .body
            .map(node => this.#compile(node))
            .flat()

        const instructions: Instruction[] = [
            ...this.#compileExpression(statement.test),
            { opcode: "JUMP_IF_FALSE", operand: Operand.fromNumber(this.#index + bodyInstructions.length) },
            ...bodyInstructions
        ]

        return instructions
    }

    #compile(node: Node): Instruction[] {
        const instructions: Instruction[] = []

        if (node.type === NodeType.ExpressionStatement) {
            instructions.push(...this.#compileExpression(node))
        }

        else if (node.type === NodeType.IfStatement) {
            instructions.push(...this.#compileIfStatement(node))
        }

        return instructions
    }

    public compileProgram(): Instruction[] {
        const instructions: Instruction[] = []
        const nodes = this.#program.body.body

        for (const node of nodes) {
            instructions.push(...this.#compile(node))
        }

        return instructions
    }
}