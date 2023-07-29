import { Operand } from "$vm"
import { OPERATORS } from "$parser"
import { createNamespace } from "."
import { Location } from "../parser/tokens"

export type SyntaxErrors = {
    UnknownCharacter: [character: string, location: Location]
}

export const syntaxErrors = createNamespace<SyntaxErrors>("SyntaxError", {
    UnknownCharacter: (character, location) => {
        return `unrecognized character ${JSON.stringify(character)} at line ${location.line}, column ${location.column}`
    }
})
