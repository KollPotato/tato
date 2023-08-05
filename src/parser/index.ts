import { InputStream } from "./input-stream";
import { Parser } from "./parser";
import { TokenStream } from "./token-stream";


export const parse = (input: string) => {
    const inputStream = new InputStream(input)
    const tokenStream = new TokenStream(inputStream)
    const parser = new Parser(tokenStream)
    
    return parser.parse()
}

export * from "./nodes"