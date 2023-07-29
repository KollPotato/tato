import { createNamespace } from "."

export type NameErrors = {
    UnknownName: [givenName: string, closestMatch: string | null]
}

export const nameErrors = createNamespace<NameErrors>("NameError", {
    UnknownName: (givenName, closestMatch) => {
        let message = `name "${givenName}" is not defined.`

        if (closestMatch != null) {
            message += ` Did you mean: ${closestMatch}`
        }
        
        return message;
    }
})
