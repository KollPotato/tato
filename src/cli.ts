import { program } from "commander"
import { readFile, exists } from "fs/promises"
import { execute } from "./executor"

program
    .name("Potato Lang")
    .description("Simple language written in TypeScript")

program
    .command("run")
    .argument("<input-file>", "File to run")
    .action(async (file) => {
        if (!await exists(file)) {
            program.error("File not found")
        }

        const input = await readFile(file, { encoding: "utf-8" })
        execute(input)
    })


program.parse()