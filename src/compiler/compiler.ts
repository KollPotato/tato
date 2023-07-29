import { raise } from "../error";
import { ExpressionStatementNode, IfStatementNode, Node, NodeType, ProgramNode } from "$parser";
import { Instruction, operands } from "$vm"
import chalk from "chalk";

export class Compiler {
    public constructor(program: ProgramNode) {
        this.#program = program
        this.#index = 0
    }

    #program: ProgramNode
    #index: number

    #compileExpression(node: ExpressionStatementNode): Instruction[] {
        const { expression } = node

        if (expression.type === NodeType.String) {
            this.#index += 1
            return [{ opcode: "LOAD_CONST", operand: operands.string(expression.value) }]
        }

        else if (expression.type === NodeType.Boolean) {
            this.#index += 1
            return [{ opcode: "LOAD_CONST", operand: operands.boolean(expression.value) }]
        }

        else if (expression.type === NodeType.Number) {
            this.#index += 1
            return [{ opcode: "LOAD_CONST", operand: operands.number(expression.value) }]
        }

        else if (expression.type === NodeType.CallExpression) {
            if (expression.callee.type != NodeType.Identifier) {
                return raise({
                    message: `Type ${expression.callee.type} is not callable`
                })
            }

            const instructions: Instruction[] = []

            for (const argument of expression.args) {
                instructions.unshift(...this.#compileExpression(argument))
            }

            this.#index += 2

            return [
                { opcode: "LOAD_NAME", operand: operands.string(expression.callee.name) },
                ...instructions,
                { opcode: "CALL_FUNCTION", operand: operands.number(expression.args.length) }
            ]
        }

        else if (expression.type === NodeType.BinaryExpression) {
            const left = this.#compileExpression(expression.left)
            const right = this.#compileExpression(expression.right)
            const operator: Instruction = { opcode: expression.operator }

            return [
                ...right,
                ...left,
                operator,
            ]
        }

        else if (expression.type === NodeType.Identifier) {
            return [
                { opcode: "LOAD_NAME", operand: operands.string(expression.name) }
            ]
        }

        return raise({
            "name": "CompilerError",
            "message": `Could not compile expression of type "${expression["type"]}"`
        })
    }

    #compileIfStatement(statement: IfStatementNode): Instruction[] {
        const bodyInstructions: Instruction[] = statement
            .body
            .body
            .map(node => this.#compile(node))
            .flat()

        const instructions: Instruction[] = [
            ...this.#compileExpression(statement.test),
            { opcode: "JUMP_IF_FALSE", operand: operands.number(this.#index + bodyInstructions.length) },
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