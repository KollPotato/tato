import chalk from "chalk"

export const createNamespace = <T extends Record<string, unknown[]>>(name: string, errors: { [TKey in keyof T]: (...args: T[TKey]) => string }) => {
    const namespaceName = name

    return {
        throw: <K extends keyof T>(name: K, ...args: T[K]): never => {
            const message = errors[name](...args)
            console.log(`${chalk.redBright(namespaceName)}: ${message}`)
            process.exit(1)
        }
    }
}