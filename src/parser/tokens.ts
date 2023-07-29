import chalk from "chalk"

export type Token =
    TokenBuilder<"STRING", string> |
    TokenBuilder<"IDENTIFIER", string> |
    TokenBuilder<"NUMBER", number> |
    TokenBuilder<"BOOLEAN", boolean> |
    TokenBuilder<"KEYWORD", string> |
    TokenBuilder<"KEYWORD", string> |
    TokenBuilder<"COMMA"> |
    TokenBuilder<"DOT"> |
    TokenBuilder<"COLON"> |
    TokenBuilder<"SEMICOLON"> |
    TokenBuilder<"ADD"> |
    TokenBuilder<"ADD_ASSIGNMENT"> |
    TokenBuilder<"SUBTRACT"> |
    TokenBuilder<"SUBTRACT_ASSIGNMENT"> |
    TokenBuilder<"DIVIDE"> |
    TokenBuilder<"DIVIDE_ASSIGNMENT"> |
    TokenBuilder<"MULTIPLY"> |
    TokenBuilder<"MULTIPLY_ASSIGNMENT"> |
    TokenBuilder<"POWER"> |
    TokenBuilder<"POWER_ASSIGNMENT"> |
    TokenBuilder<"NEWLINE"> |
    TokenBuilder<"ASSIGN"> |
    TokenBuilder<"LESS_OR_EQUAL"> |
    TokenBuilder<"GREATER_OR_EQUAL"> |
    TokenBuilder<"LESS"> |
    TokenBuilder<"GREATER"> |
    TokenBuilder<"NOT_EQUAL"> |
    TokenBuilder<"EQUAL"> |
    TokenBuilder<"BANG"> |
    TokenBuilder<"LEFT_PARENTHESIS"> |
    TokenBuilder<"RIGHT_PARENTHESIS"> |
    TokenBuilder<"LEFT_CURLY_BRACE"> |
    TokenBuilder<"RIGHT_CURLY_BRACE"> |
    TokenBuilder<"LEFT_SQUARED_BRACKET"> |
    TokenBuilder<"RIGHT_SQUARED_BRACKET"> |
    TokenBuilder<"MODULO">


export type TokenBuilder<TType extends string, TValue extends unknown | undefined = undefined> = TValue extends undefined
    ? { type: TType, range: LocationRange }
    : { type: TType, value: TValue, range: LocationRange }


export type Location = {
    offset: number
    line: number
    column: number
}

export type LocationRange = [start: Location, end: Location]

export const locationToString = (location: Location): string => {
    const { line, column } = location

    return `ln ${line}, col ${column}`
}

export const tokenToString = (token: Token, withRange: boolean = false): string => {
    const { range, type } = token
    
    const stringifiedRange = `from ${locationToString(range[0])} to ${locationToString(range[1])}`
    const colorizedType = chalk.magentaBright(type)

    let result = colorizedType
    
    if ("value" in token) {
        result += ` ${chalk.cyanBright(JSON.stringify(token.value))}`
    }

    return withRange
        ? result += ` ${stringifiedRange}`
        : result
}
