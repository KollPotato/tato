export class Char {
    public constructor(value: string | number) {
        value = value.toString()

        if (value.length > 1) {
            throw new Error("Invalid character length")
        }

        this.value = value
        this.isIdentifierStart = /[a-zA-Z_]/.test(this.value)
        this.isIdentifier = /[a-zA-Z0-9_]/.test(this.value)
        this.isWhitespace = this.value === " " || this.value === "\t"
        this.isPunctuation = ".,:;".includes(this.value)
        this.isOperatorStart = "<!=>+-/*%".includes(this.value)
        this.isDigit = "0123456789".includes(this.value)
        this.isBracket = "(){}[]".includes(this.value)
    }

    public readonly value: string
    public readonly isIdentifierStart: boolean
    public readonly isOperatorStart: boolean
    public readonly isIdentifier: boolean
    public readonly isWhitespace: boolean
    public readonly isPunctuation: boolean
    public readonly isDigit: boolean
    public readonly isBracket: boolean

    public toString() {
        return this.value
    }

    public [Symbol.toString()]() {
        return this.toString()
    }
}

export const char = (value: string) => new Char(value)
