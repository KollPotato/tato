export type Position = {
    offset: number
    column: number
    line: number
}

export type PositionRange = readonly [start: Position, end: Position]
