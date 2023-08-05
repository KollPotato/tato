import chalk from "chalk"
import { Position } from "./position"

export class InputStream {
    public constructor(input: string) {
        this.#input = input
        this.#position = {
            offset: 0,
            line: 1,
            column: 0,
        }
    }

    #input: string
    readonly #position: Position

    public get input(): string {
        return this.#input
    }

    public get previousPosition(): Position {
        const lastCharacter = this.last!
        return this.#devance(this.#position, lastCharacter)
    }

    #devance(position: Position, character: string): Position {
        position.offset -= 1

        if (character === "\n") {
            position.column = 0
            position.line -= 1
            return position
        }

        position.column -= 1

        return position
    }

    #advance(character: string) {
        this.#position.offset += 1

        if (character === "\n") {
            this.#position.column = 0
            this.#position.line += 1
            return
        }

        this.#position.column += 1
    }
    
    public getLine(index: number): string {
        const lines = this.#input.split("\n")
        const line = lines[index - 1]

        if (line === undefined) {
            throw new Error("unknown line")
        }

        return line
    }

    public get position(): Position {
        return JSON.parse(JSON.stringify(this.#position))
    }

    public get last(): string | null {
        const character = this.#input[this.#position.offset]
        
        if (character == null) {
            return null
        }
        
        return character
    }

    public eat(): string | null {
        const character = this.last

        if (character == null) {
            return null
        }

        this.#advance(character)
        return character
    }

    public skip(): void {
        this.#advance(this.last!)
    }

    public debug() {
        const characterStream = new InputStream(this.#input)

        const characterToString = (character: string): string => {
            return chalk.greenBright(JSON.stringify(character))
        }
        
        let index = 1
        
        while (characterStream.last != null) {
            const character = characterStream.eat()!
    
            console.log(chalk.gray(`${index}. `.padStart(6, " ")), characterToString(character))
            index += 1
        }   
    }
}
