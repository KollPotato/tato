import { Stack, VirtualMachine } from "$vm"
import { Compiler } from "$compiler"
import { InputStream, TokenStream, Parser } from "$parser"

const input = `
println(true == false)
println(5)
println(5 == 5)
println(5 / (5 + 2))
println(50 % 9)
`

const inputStream = new InputStream(input)
const tokenStream = new TokenStream(inputStream)

const parser = new Parser(tokenStream)
const program = parser.parseProgram()

const compiler = new Compiler(program)
const instructions = compiler.compileProgram()

const vm = new VirtualMachine({
    instructions,
    stack: new Stack(12)
})

vm.execute()
