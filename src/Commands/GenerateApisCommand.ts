import { ApisGenerator } from 'src/github/apis-generator'
import { Command } from '@h3ravel/musket'
import { useCommand } from 'src/hooks'

export class GenerateApisCommand extends Command {
    protected signature = 'generate:apis'

    protected description = 'Generate extended API definitions from the GitHub OpenAPI spec'

    async handle () {
        const [_, setCommand] = useCommand()
        setCommand(this)

        ApisGenerator.run()
    }
}