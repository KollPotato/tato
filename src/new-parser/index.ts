import { char, choice, many, recursiveParser, regex, sequenceOf, optionalWhitespace, between, anythingExcept, str, anyOfString, Parser, many1, digits } from "arcsecond";
import { BinaryExpressionNode, CallExpressionNode, ExpressionNode, IdentifierNode, NumberNode, Statement, StringNode } from "./nodes";
import { sepByTrailing } from "./parsers";

export const BetweenParenthesis = between(char("("))(char(")"))
export const BetweenWhitespace = between(optionalWhitespace)(optionalWhitespace)

export const CommaSeparated = sepByTrailing(char(","))

export const BinaryExpressionParser = (operator: Parser<string>) => (parser: Parser<unknown>) =>
    sequenceOf([
        BetweenWhitespace(parser),
        many1(sequenceOf([BetweenWhitespace(operator), BetweenWhitespace(parser)]))
    ]).map(([initialTerm, expressions]) => {
        return [initialTerm, ...expressions].reduce((accumulator, current) => {
            if (Array.isArray(current)) {
                const left = accumulator
                const right = current[1]
                const operator = current[0]

                return {
                    type: "BinaryExpression",
                    left,
                    right,
                    operator
                } as BinaryExpressionNode
            }

            return current
        })
    })

const Add = char("+")
const Subtract = char("-")
const Multiply = char("*")
const Divide = char("/")
const Power = str("**")

// @ts-ignore
export const Expression = recursiveParser(() => choice([
    SecondPrecedence,
    Term,
    CallExpressionParser,
    IdentifierParser,
    NumberParser,
    StringParser,
])).map((expression) => {
    return {
        type: "Expression",
        expression,
    } as ExpressionNode
})

// @ts-ignore
const Term = recursiveParser(() => choice([FirstPrecedence, Factor]))
// @ts-ignore
const Factor = recursiveParser(() => choice([CallExpressionParser, IdentifierParser, NumberParser, StringParser, BetweenParenthesis(Expression)]))

const SecondPrecedence = BinaryExpressionParser(choice([Add, Subtract]))(Term)
const FirstPrecedence = BinaryExpressionParser(choice([Power, Multiply, Divide]))(Factor)

export const NumberParser = regex(/^([0-9]*\.[0-9]*|[0-9]+)/).map((number) => {
    return {
        type: "Number",
        value: Number(number)
    } as NumberNode
})

export const IdentifierParser = regex(/^[a-zA-Z_]+[a-zA-Z_0-9]*/).map(name => {
    return {
        type: "Identifier",
        name
    } as IdentifierNode
})

const escapedQuote = sequenceOf([str("\\"), anyOfString(`""`)]).map(x => x.join(""));


export const StringParser = sequenceOf([
    char('"'),
    many(choice([escapedQuote, anythingExcept(char('"'))])).map((array) => array.map((value) => String.fromCharCode(Number(value))).join("")),
    char('"')
]).map(([_, value, _1]) => {
    return {
        type: "String",
        value
    } as StringNode
});

export const ArgumentsParser = CommaSeparated(BetweenWhitespace(Expression))

export const CallExpressionParser = sequenceOf([BetweenWhitespace(IdentifierParser), BetweenParenthesis(ArgumentsParser)])
    .map(([callee, args]) => {
        return {
            type: "CallExpression",
            callee,
            args
        } as CallExpressionNode
    })

export const Terminator = choice([char(";"), char("\n")])

export const StatementParser = sequenceOf([Expression, many(Terminator)]).map(([expression]) => expression as Statement)

export const ProgramParser = sequenceOf([(many(Terminator)), many(StatementParser)]).map(([_, nodes]) => nodes)

export const parse = (input: string) => ProgramParser.run(input)