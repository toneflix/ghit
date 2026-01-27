import { ApisGenerator } from 'src/github/apis-generator'
import { Command } from '@h3ravel/musket'
import { useCommand } from 'src/hooks'

export class GenerateApisCommand extends Command {
    protected signature = `#generate:
        {apis : Generate extended API definitions from the GitHub OpenAPI spec.}
        {reset : Remove all generated commands}
    `

    protected description = 'Generate extended API definitions from the GitHub OpenAPI spec'

    async handle () {
        const [_, setCommand] = useCommand()
        setCommand(this)

        const { name: command } = this.dictionary

        if (command === 'apis') {
            ApisGenerator.run()
        } else if (command === 'reset') {
            // Confirm with the user before proceeding
            if (!await this.confirm(
                'Are you sure you want to remove all generated APIs? This action cannot be undone.'
            )) return void this.newLine().info('Operation cancelled.').newLine()

            const { existsSync, unlinkSync } = await import('node:fs')
            const spinner = this.spinner('Removing generated APIs...').start()

            let i = 0
            for (const type of ['local', 'global'] as const) {
                const path = ApisGenerator.getOutputPath(type)

                if (existsSync(path)) {
                    unlinkSync(path)
                    spinner.succeed(`Removed generated ${type} APIs successfully.`)
                    i++
                }
            }

            if (i > 0) {
                spinner.succeed('Removed all generated APIs successfully.')
            } else {
                spinner.fail('No generated APIs found to remove.')
            }
        }
    }
}