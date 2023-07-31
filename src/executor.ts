import { Parser, InputStream, TokenStream } from "$parser"
import { Compiler } from "$compiler"
import { Stack, VirtualMachine } from "$vm"

export const execute = (input: string) => {
    const inputStream = new InputStream(input)
    const tokenStream = new TokenStream(inputStream)

    const parser = new Parser(tokenStream)
    const program = parser.parseProgram()

    const compiler = new Compiler(program)
    const instructions = compiler.compileProgram()

    const vm = new VirtualMachine({
        instructions,
        stack: new Stack(1024)
    })

    vm.execute()
}