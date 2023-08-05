import { PositionRange } from "./position"

export type Token =
    | TokenBuilder<"IDENTIFIER", string>
    | TokenBuilder<"KEYWORD", string>
    | TokenBuilder<"INTEGER", number>
    | TokenBuilder<"FLOAT", number>
    | TokenBuilder<"END_OF_LINE", string>
    | TokenBuilder<"STRING", string>
    | TokenBuilder<"DOT">
    | TokenBuilder<"COMMA">
    | TokenBuilder<"COLON">
    | TokenBuilder<"SEMICOLON">
    | TokenBuilder<"ADD">
    | TokenBuilder<"ADD_ASSIGNMENT">
    | TokenBuilder<"SUBTRACT">
    | TokenBuilder<"SUBTRACT_ASSIGNMENT">
    | TokenBuilder<"MULTIPLY">
    | TokenBuilder<"MULTIPLY_ASSIGNMENT">
    | TokenBuilder<"DIVIDE">
    | TokenBuilder<"DIVIDE_ASSIGNMENT">
    | TokenBuilder<"POWER">
    | TokenBuilder<"POWER_ASSIGNMENT">
    | TokenBuilder<"MODULO">
    | TokenBuilder<"MODULO_ASSIGNMENT">
    | TokenBuilder<"BANG">
    | TokenBuilder<"EQUAL">
    | TokenBuilder<"ASSIGN">
    | TokenBuilder<"NOT_EQUAL">
    | TokenBuilder<"GREATER">
    | TokenBuilder<"LESS">
    | TokenBuilder<"GREATER_OR_EQUAL">
    | TokenBuilder<"LESS_OR_EQUAL">
    | TokenBuilder<"ARROW">
    | TokenBuilder<"LEFT_PARENTHESIS">
    | TokenBuilder<"RIGHT_PARENTHESIS">
    | TokenBuilder<"LEFT_CURLY_BRACKET">
    | TokenBuilder<"RIGHT_CURLY_BRACKET">
    | TokenBuilder<"LEFT_SQUARE_BRACKET">
    | TokenBuilder<"RIGHT_SQUARE_BRACKET">

export type TokenBuilder<TType extends string, TValue extends unknown = undefined> = TValue extends undefined
    ? Readonly<{ type: TType, range: PositionRange }>
    : Readonly<{ type: TType, value: TValue, range: PositionRange }>
