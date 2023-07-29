import { raise } from "../error";
import { ValueOperand } from "./operands";

export class Names {
    #names: Record<string, ValueOperand> = {}

    public exists(name: string): boolean {
        return this.#names[name] != null
    }

    public set(name: string, value: ValueOperand): void {
        if (this.exists(name)) {
            raise({
                name: "NameError",
                message: `Can not define name ${name}, because it already exists`
            })
        }

        this.#names[name] = value
    }

    public get(name: string): ValueOperand {
        if (!this.exists(name)) {
            raise({
                name: "NameError",
                message: `Name ${name} does not exist`
            })
        }

        return this.#names[name]
    }
}