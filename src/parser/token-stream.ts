import { Stream } from "./stream";
import { Token } from "./tokens";
import { InputStream } from "./input-stream";
import { syntaxErrors } from "../errors/syntax-errors";

export const KEYWORDS = [
    "true",
    "false",
    "if",
    "else"
]

export class TokenStream implements Stream<Token | null> {
    public constructor(inputStream: InputStream) {
        this.#inputStream = inputStream
    }

    #inputStream: InputStream
    #currentToken: Token | null = null

    #readPunctuation(): Token {
        const [char, range] = this.#inputStream.readWithRange(() => this.#inputStream.next()!)

        if (char.value === ".") {
            return { type: "DOT", range }
        }

        else if (char.value === ",") {
            return { type: "COMMA", range }
        }

        else if (char.value === ":") {
            return { type: "COLON", range }
        }

        else if (char.value === ";") {
            return { type: "SEMICOLON", range }
        }

        return syntaxErrors.throw("UnknownCharacter", char.value, range[0])
    }

    #readEscaped(end: string): string {
        let isEscaped = false
        let result = ""

        this.#inputStream.next()

        while (this.#inputStream.peek() != null) {
            const character = this.#inputStream.next()

            if (isEscaped) {
                result += character
                isEscaped = false
            }

            else if (character?.value == "\\") {
                isEscaped = true
            }

            else if (character?.value == end) {
                break
            }

            else {
                result += character
            }
        }

        return result
    }

    #readString(): Token {
        const [value, range] = this.#inputStream.readWithRange(() => {
            return this.#readEscaped('"')
        })

        return { type: "STRING", value, range }
    }

    #readNumber(): Token {
        let hasDot = false

        const [value, range] = this.#inputStream.readWhile((char) => {
            if (char.value != ".") {
                return char.isDigit
            }

            else if (hasDot) {
                return false
            }

            hasDot = true
            return true
        });

        return {
            type: "NUMBER",
            value: Number(value),
            range
        }
    }

    #readOperator(): Token {
        const [char, range] = this.#inputStream.readWithRange(() => this.#inputStream.next()!)

        const next = this.#inputStream.peek()

        if (char.value == "!") {
            if (next?.value === "=") {
                this.#inputStream.skip()
                return { type: "NOT_EQUAL", range }
            }

            return { type: "BANG", range }
        }

        else if (char.value == "=") {
            if (next?.value === "=") {
                this.#inputStream.skip()
                return { type: "EQUAL", range }
            }

            return { type: "ASSIGN", range }
        }

        else if (char.value == ">") {
            if (next?.value === "=") {
                this.#inputStream.skip()
                return { type: "GREATER_OR_EQUAL", range }
            }

            return { type: "GREATER", range }
        }

        else if (char.value == "<") {
            if (next?.value === "=") {
                this.#inputStream.skip()
                return { type: "LESS_OR_EQUAL", range }
            }

            return { type: "LESS", range }
        }

        else if (char.value == "+") {
            if (next?.value === "=") {
                this.#inputStream.skip()
                return { type: "ADD_ASSIGNMENT", range }
            }

            return { type: "ADD", range }
        }

        else if (char.value == "-") {
            if (next?.value === "=") {
                this.#inputStream.skip()
                return { type: "SUBTRACT_ASSIGNMENT", range }
            }

            return { type: "SUBTRACT", range }
        }

        else if (char.value == "*") {
            if (next?.value === "*") {
                this.#inputStream.skip()
                const next2 = this.#inputStream.next()
                
                if (next2?.value === "=") {
                    return { type: "POWER_ASSIGNMENT", range }
                }

                return { type: "POWER", range }

            } else if (next?.value === "=") {
                return { type: "MULTIPLY_ASSIGNMENT", range }
            }

            return { type: "MULTIPLY", range }
        }

        else if (char.value == "/") {
            if (next?.value === "=") {
                this.#inputStream.skip()
                return { type: "DIVIDE_ASSIGNMENT", range }
            }

            return { type: "DIVIDE", range }
        }
        
        else if (char.value === "%") {
            return { type: "MODULO", range }
        }

        return syntaxErrors.throw("UnknownCharacter", char.value, range[0])
    }

    #readIdentifier(): Token {
        const [value, range] = this.#inputStream.readWhile(character => character.isIdentifier)

        return {
            type: KEYWORDS.includes(value) ? "KEYWORD" : "IDENTIFIER",
            value,
            range
        }
    }

    #readBracket(): Token {
        const [character, range] = this.#inputStream.readWithRange(() => {
            return this.#inputStream.next()!
        })

        if (character.value === "(") {
            return {
                type: "LEFT_PARENTHESIS",
                range
            }
        }

        else if (character.value === ")") {
            return {
                type: "RIGHT_PARENTHESIS",
                range
            }
        }

        else if (character.value === "{") {
            return {
                type: "LEFT_CURLY_BRACE",
                range
            }
        }

        else if (character.value === "}") {
            return {
                type: "RIGHT_CURLY_BRACE",
                range
            }
        }

        else if (character.value === "[") {
            return {
                type: "LEFT_SQUARED_BRACKET",
                range
            }
        }

        else if (character.value === "]") {
            return {
                type: "RIGHT_SQUARED_BRACKET",
                range
            }
        }

        return syntaxErrors.throw("UnknownCharacter", character.value, range[0])
    }

    #read(): Token | null {
        this.#inputStream.skipWhile(character => character.isWhitespace)

        const [character, range] = this.#inputStream.readWithRange(() => {
            return this.#inputStream.peek()
        })

        if (character == null) {
            return null
        }

        else if (character.isIdentifierStart) {
            return this.#readIdentifier()
        }

        else if (character.isPunctuation) {
            return this.#readPunctuation()
        }

        else if (character.isDigit) {
            return this.#readNumber()
        }

        // TODO: split tokenizing new line in a method
        else if (character.value === "\r") {
            this.#inputStream.skip()
            const next = this.#inputStream.next()

            if (next?.value === "\n") {
                return { type: "NEWLINE", range }
            }

            return { type: "NEWLINE", range }
        }

        else if (character.value === "\n") {
            this.#inputStream.skip()
            return { type: "NEWLINE", range }
        }

        else if (character.isOperatorStart) {
            return this.#readOperator()
        }

        else if (character.isBracket) {
            return this.#readBracket()
        }

        else if (character.value === '"') {
            return this.#readString()
        }

        return syntaxErrors.throw("UnknownCharacter", character.value, range[0])
    }

    public peek() {
        if (this.#currentToken != null) {
            return this.#currentToken
        }

        this.#currentToken = this.#read()
        return this.#currentToken
    }

    public next() {
        const currentToken = this.#currentToken
        this.#currentToken = null

        if (currentToken != null) {
            return currentToken
        }

        return this.#read()
    }
}

