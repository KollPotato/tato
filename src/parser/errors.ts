import chalk from "chalk"
import { PositionRange } from "./position"
import { InputStream } from "./input-stream"

export const raise = (options: RaiseOptions): never => {
    const { filename, error, help, range, inputStream } = options

    const [start] = range

    const line = inputStream.getLine(start.line)

    console.log(`file "${filename}"`)
    console.log(`${chalk.gray(` ${start.line} |`)} ${line}`)
    console.log(`${" ".repeat(start.column + 5)}${chalk.bold(`^ line ${start.line}, column ${start.column}`)}`)

    console.log(`${chalk.redBright("error:")}${chalk.whiteBright(` ${error}`)}`)

    if (help != null) {
        console.log(`${chalk.greenBright("help:")}${chalk.whiteBright(` ${help}`)}`)
    }

    process.exit(1)
}

export interface RaiseOptions {
    filename: string
    error: string
    help?: string
    range: PositionRange
    inputStream: InputStream
}


/*

errors.raise({
    group: "SyntaxError",
    range: [72, 73],
    error: "string was never closed.",
    help: "this error occurs when string was not closed with the double quote character «"» at the end."
})


*/