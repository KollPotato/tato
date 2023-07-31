import chalk from "chalk";
import { ProgramNode, ExpressionNode } from "./nodes";

export function prettyPrintAST(program: ProgramNode): void {
    function printExpression(expression: ExpressionNode | ExpressionNode["expression"]): string {
        switch(expression.type) {
            case "Expression":
                return printExpression(expression.expression)
            case "BinaryExpression":
                return `${chalk.greenBright(expression.type)}(${printExpression(expression.left)} ${expression.operator} ${printExpression(expression.right)})`;
            case "CallExpression":
                return `${chalk.greenBright(expression.type)}(${printExpression(expression.callee)}, ${expression.args.map(printExpression).join(", ")})`;
            case "Identifier":
                return `${chalk.greenBright(expression.type)}(${chalk.magentaBright(expression.name)})`;
            case "Number":
                return `${chalk.greenBright(expression.type)}(${chalk.magentaBright(expression.value)})`;
            case "String":
                return `${chalk.greenBright(expression.type)}(${chalk.magentaBright('"' + expression.value + '"')})`;
            case "Boolean":
                return `${chalk.greenBright(expression.type)}(${chalk.magentaBright(expression.value)})`;
            default:
                return "Unknown Expression";
        }
    }

    if (program.length <= 0) {
        console.log("Empty AST")
        return
    }

    for (const statement of program) {
        console.log(printExpression(statement))
    }
}
