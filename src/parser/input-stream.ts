import { Stream } from "./stream"
import { Char } from "./character"
import { Location, LocationRange } from "./tokens"
import { copyObject } from "../utils"

export class InputStream implements Stream<Char | null> {
    public constructor(input: string) {
        this.#input = input

        this.#location = {
            line: 1,
            column: 0,
            offset: 0
        }

        this.#cachedChars = { }
    }

    readonly #location: Location
    readonly #input: string
    readonly #cachedChars: Record<string, Char>

    public get location(): Location {
        return this.#location
    }

    #advanceLocation(char: string) {
        this.#location.offset += 1

        if (char === "\n") {
            this.#location.line += 1
            this.#location.column = 0
        } else {
            this.#location.column += 1
        }
    }

    public peek() {
        const maybeChar = this.#input[this.#location.offset]

        if (maybeChar == null) {
            return null
        }

        const cachedChar = this.#cachedChars[maybeChar]

        if (cachedChar != null) {
            return cachedChar
        }

        const char = new Char(maybeChar)
        this.#cachedChars[maybeChar] = char
        return char
    }

    public skip() {
        this.#advanceLocation(this.peek()!.value)
    }

    public next() {
        const char = this.peek()

        if (char == null) {
            return null
        }

        this.#advanceLocation(char.value)
        return char
    }

    public readWithRange<T>(fn: () => T): [result: T, range: LocationRange] {
        const start = copyObject(this.#location)
        const result = fn()
        const end = copyObject(this.#location)

        return [result, [start, end]]
    }

    public readWhile(fn: (char: Char) => boolean): [result: string, location: LocationRange] {
        return this.readWithRange(() => {
            let result = ""

            while (true) {
                const character = this.peek()

                if (character == null || !fn(character)) {
                    break
                }
                
                this.skip()
                result += character.value
            }

            return result
        })
    }

    public skipWhile(fn: (char: Char) => boolean): void {
        while (true) {
            const character = this.peek()

            if (character == null || !fn(character)) {
                break
            }
            
            this.next()
        }
    }
}
