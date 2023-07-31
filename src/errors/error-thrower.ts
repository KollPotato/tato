import chalk from "chalk"

export const createErrorThrower = <T extends Record<string, unknown[]>>(name: string, errors: { [TKey in keyof T]: (...args: T[TKey]) => string }) => {
    const errorThrowerName = name

    return function <K extends keyof T>(name: K, ...args: T[K]): never {
        const message = errors[name](...args)
        console.log(`${chalk.redBright(errorThrowerName)}: ${message}`)
        process.exit(1)
    }
}
