import chalk from "chalk"

export type CustomErrorOptions = {
    name?: string
    message: string
}

export type CustomErrorFunction = (...args: any[]) => CustomErrorOptions

export const raise = (options: CustomErrorOptions) => {
    console.log(`${chalk.red(options.name ?? "Error")}: ${chalk.whiteBright(options.message)}`)
    process.exit(1)
}