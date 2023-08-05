import chalk from "chalk";
import { raise } from "./errors";
import { InputStream } from "./input-stream";
import { PositionRange } from "./position";
import { Token } from "./tokens";
import { KEYWORDS } from "./constants";

export class TokenStream {
    public constructor(inputStream: InputStream) {
        this.#inputStream = inputStream;
        this.#last = null;
    }

    #inputStream: InputStream;
    #last: Token | null;

    public get inputStream(): InputStream {
        return this.#inputStream
    }

    #isIdentifierStart(character: string): boolean {
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_".includes(
            character
        );
    }

    #isIdentifier(character: string): boolean {
        return (
            this.#isIdentifierStart(character) ||
            "0123456789".includes(character)
        )
    }

    #isEndOfLineStart(character: string): boolean {
        return character === "\r" || character === "\n"
    }

    #isPunctuation(character: string): boolean {
        return ".,:;".includes(character)
    }

    #isOperatorStart(character: string): boolean {
        return "!=<>+-/*%".includes(character)
    }

    #isDigit(character: string): boolean {
        return "0123456789".includes(character);
    }

    #isBracket(character: string): boolean {
        return "()[]{}".includes(character)
    }

    #captureRange<T>(fn: () => T): [result: T, range: PositionRange] {
        const start = this.#inputStream.position;
        const result = fn();
        const end = this.#inputStream.position;

        return [result, [start, end]];
    }

    #readWhile(
        predicate: (character: string) => boolean
    ): [result: string, range: PositionRange] {
        return this.#captureRange(() => {
            let result = "";

            while (true) {
                const character = this.#inputStream.last;

                if (character === null || !predicate(character)) {
                    break;
                }

                result += this.#inputStream.eat()!;
            }

            return result;
        });
    }

    #skipWhile(predicate: (character: string) => boolean): void {
        while (true) {
            const character = this.#inputStream.last;

            if (character === null || !predicate(character)) {
                break;
            }

            this.#inputStream.skip();
        }
    }

    #readBracket(): Token {
        const [value, range] = this.#captureRange(() => this.#inputStream.eat()!)

        if (value === "(") {
            return { type: "LEFT_PARENTHESIS", range }
        } else if (value === ")") {
            return { type: "RIGHT_PARENTHESIS", range }
        } else if (value === "{") {
            return { type: "LEFT_CURLY_BRACKET", range }
        } else if (value === "}") {
            return { type: "RIGHT_CURLY_BRACKET", range }
        } else if (value === "[") {
            return { type: "LEFT_SQUARE_BRACKET", range }
        } else if (value === "]") {
            return { type: "RIGHT_SQUARE_BRACKET", range }
        }

        throw new Error(`${JSON.stringify(value)} was unexpected`)
    }

    #readOperator(): Token {
        const [character, range] = this.#captureRange(() => this.#inputStream.eat()!)

        const next = this.#inputStream.last

        if (character == "!") {
            if (next === "=") {
                this.#inputStream.skip()
                return { type: "NOT_EQUAL", range }
            }

            return { type: "BANG", range }
        }

        else if (character == "=") {
            if (next === "=") {
                this.#inputStream.skip()
                return { type: "EQUAL", range }
            }

            return { type: "ASSIGN", range }
        }

        else if (character == ">") {
            if (next === "=") {
                this.#inputStream.skip()
                return { type: "GREATER_OR_EQUAL", range }
            }

            return { type: "GREATER", range }
        }

        else if (character == "<") {
            if (next === "=") {
                this.#inputStream.skip()
                return { type: "LESS_OR_EQUAL", range }
            }

            return { type: "LESS", range }
        }

        else if (character == "+") {
            if (next === "=") {
                this.#inputStream.skip()
                return { type: "ADD_ASSIGNMENT", range }
            }

            return { type: "ADD", range }
        }

        else if (character == "-") {
            if (next === "=") {
                this.#inputStream.skip()
                return { type: "SUBTRACT_ASSIGNMENT", range }
            }

            else if (next === ">") {
                this.#inputStream.skip()
                return { type: "ARROW", range }
            }

            return { type: "SUBTRACT", range }
        }

        else if (character == "*") {
            if (next === "*") {
                this.#inputStream.skip()
                const next2 = this.#inputStream.eat()

                if (next2 === "=") {
                    return { type: "POWER_ASSIGNMENT", range }
                }

                return { type: "POWER", range }

            } else if (next === "=") {
                return { type: "MULTIPLY_ASSIGNMENT", range }
            }

            return { type: "MULTIPLY", range }
        }

        else if (character == "/") {
            if (next === "=") {
                this.#inputStream.skip()
                return { type: "DIVIDE_ASSIGNMENT", range }
            }

            return { type: "DIVIDE", range }
        }

        else if (character === "%") {
            return { type: "MODULO", range }
        }

        throw new Error(`${JSON.stringify(character)} was unexpected`)
    }

    #readPunctuation(): Token {
        const [value, range] = this.#captureRange(() => this.#inputStream.eat()!)

        if (value === ".") {
            return { type: "DOT", range }
        } else if (value === ":") {
            return { type: "COLON", range }
        } else if (value === ";") {
            return { type: "SEMICOLON", range }
        } else if (value === ",") {
            return { type: "COMMA", range }
        }

        throw new Error(`${JSON.stringify(value)} was unexpected`)
    }

    #readIdentifier(): Token {
        const [identifier, range] = this.#readWhile((character) =>
            this.#isIdentifier(character)
        );

        return {
            type: KEYWORDS.includes(identifier as typeof KEYWORDS[number]) ? "KEYWORD" : "IDENTIFIER",
            value: identifier,
            range,
        };
    }

    #readEndOfLine(): Token {
        const [character, [start]] = this.#captureRange(
            () => this.#inputStream.last
        );

        if (character === "\r") {
            this.#inputStream.skip();

            if (this.#inputStream.last === "\n") {
                this.#inputStream.skip();
                return {
                    type: "END_OF_LINE",
                    value: "\r\n",
                    range: [start, this.#inputStream.position],
                }
            }

            return {
                type: "END_OF_LINE",
                value: "\r",
                range: [start, this.#inputStream.position],
            }
        }

        else if (character === "\n") {
            this.#inputStream.skip();
            return {
                type: "END_OF_LINE",
                value: "\n",
                range: [start, this.#inputStream.position]
            };
        }

        return raise({
            filename: "<input>",
            error: `unexpected character ${JSON.stringify(character)}`,
            inputStream: this.#inputStream,
            range: [start, start]
        })
    }

    #readEscaped(end: string): [result: string, hasEnded: boolean, range: PositionRange] {
        const [[result, hasEnded], range] = this.#captureRange(() => {
            let isEscaped = false
            let hasEnded = false

            let result = ""

            this.#inputStream.skip()

            while (this.#inputStream.last != null) {
                const character = this.#inputStream.eat()

                if (isEscaped) {
                    result += character
                    isEscaped = false
                }

                else if (character == "\\") {
                    isEscaped = true
                }

                else if (character == end) {
                    hasEnded = true
                    break
                }

                else {
                    result += character
                }
            }

            return [result, hasEnded]
        })

        return [result, hasEnded, range]
    }

    #readString(): Token {
        const [value, hasEnded, range] = this.#readEscaped('"')

        if (hasEnded) {
            return { type: "STRING", value, range };
        }

        return raise({
            filename: "<input>",
            error: `string was never closed. Perhaps you forgot the double quotation mark?`,
            range: [range[0], range[0]],
            inputStream: this.#inputStream,
        })
    }

    #readNumber(): Token {
        let hasDot = false;

        const [value, range] = this.#readWhile((character) => {
            if (character === ".") {
                hasDot = true;
                return true;
            }

            return this.#isDigit(character);
        });

        return hasDot
            ? { type: "FLOAT", value: parseFloat(value), range }
            : { type: "INTEGER", value: parseInt(value), range }
    }

    #read(): Token | null {
        this.#skipWhile((character) => character === " " || character === "\t");

        const [character, range] = this.#captureRange(() => this.#inputStream.last)

        if (character === null) {
            return null
        }

        else if (this.#isEndOfLineStart(character)) {
            return this.#readEndOfLine()
        }

        else if (this.#isIdentifierStart(character)) {
            return this.#readIdentifier()
        }

        else if (this.#isDigit(character)) {
            return this.#readNumber()
        }

        else if (this.#isPunctuation(character)) {
            return this.#readPunctuation()
        }

        else if (this.#isBracket(character)) {
            return this.#readBracket()
        }

        else if (this.#isOperatorStart(character)) {
            return this.#readOperator()
        }

        else if (character === '"') {
            return this.#readString()
        }

        return raise({
            filename: "<input>",
            error: `unexpected character ${JSON.stringify(character)}`,
            inputStream: this.#inputStream,
            range
        })
    }

    public get last(): Token | null {
        if (this.#last != null) {
            return this.#last;
        }

        this.#last = this.#read();
        return this.#last;
    }

    public eat(): Token | null {
        const lastToken = this.#last;
        this.#last = null;

        if (lastToken != null) {
            return lastToken;
        }

        return this.#read();
    }

    public debug() {
        const tokenStream = new TokenStream(new InputStream(this.#inputStream.input))

        const tokenToString = (token: Token): string => {
            return `${chalk.magentaBright(token.type.padEnd(24, " "))} ${"value" in token ? chalk.greenBright(JSON.stringify(token.value)) : ""}`
        }

        let index = 1

        while (tokenStream.last != null) {
            const token = tokenStream.eat()!

            console.log(chalk.gray(`${index}.`.padStart(6, " ")), tokenToString(token))
            index += 1
        }
    }
}
