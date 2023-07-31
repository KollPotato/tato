import { createErrorThrower } from "."
import { Location } from "../parser/tokens"

export type SyntaxErrors = {
    UnknownCharacter: [character: string, location: Location]
    Expected: [type: string]
    NotExpected: [type: string]
}

export const throwSyntaxError = createErrorThrower<SyntaxErrors>("SyntaxError", {
    UnknownCharacter: (character, location) => {
        return `unrecognized character ${JSON.stringify(character)} at line ${location.line}, column ${location.column}`
    },
    Expected: (type) => {
        return `"${type}" was expected`
    },
    NotExpected: (type) => {
        return `"${type}" was not expected`
    }
})
