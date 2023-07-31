import { Parser, ParserState, ResultType, coroutine, either, lookAhead, possibly, sequenceOf, updateResult } from "arcsecond"

export function sepByTrailing<S, T, E, D>(sepParser: Parser<S, E, D>): (valueParser: Parser<T, E, D>) => Parser<T[]> {
    return (valueParser) => new Parser<T[]>((state) => {
        if (state.isError) return state

        let nextState: ParserState<S | T, E, D> = state
        let error = null
        const results: T[] = []

        while (true) {
            const valState = valueParser.p(nextState)
            const sepState = sepParser.p(valState)

            if (valState.isError) {
                error = valState
                break
            } else {
                results.push(valState.result)
            }

            if (sepState.isError) {
                nextState = valState
                break
            }

            nextState = sepState
        }

        if (error) {
            if (results.length === 0) {
                return updateResult(state, results) as ParserState<T[], E, D>
            }

            if (nextState.isError) {
                return error
            }
        }

        return updateResult(nextState, results)
    })
}
