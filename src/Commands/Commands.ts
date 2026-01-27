import { XCommand, XSchema } from '../Contracts/Generic'
import { executeSchema, promiseWrapper } from 'src/helpers'

import APIs from '../github/apis'
import { Command } from '@h3ravel/musket'
import { IRepoEntry } from 'src/Contracts/Interfaces'
import { buildSignature } from 'src/utils/argument'
import { createRequire } from 'node:module'
import { dataRenderer } from '../utils/renderer'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { read } from '../db'
import { useCommand } from '../hooks'

export default () => {
    const require = createRequire(import.meta.url)
    const commands: typeof Command[] = []
    let GeneratedAPIs = APIs

    const isGeneratingApis = process.argv.includes('generate:apis')

    if (!isGeneratingApis &&
        existsSync(path.join(process.cwd(), '.grithub/apis.generated.js'))
    ) {
        ({ APIs: GeneratedAPIs } = require(
            path.join(process.cwd(), '.grithub/apis.generated.js')
        ))
    }

    /**
     * We should map through the APIs and reduce all apis to a single key value pair
     * where key is the API key and the schema array entry api propety separated by a 
     * semicolon and the value is schema array entry.
     */
    const entries = Object.entries(GeneratedAPIs).reduce((acc, [key, schemas]) => {
        schemas.forEach((schema) => {
            const commandKey = key === schema.api ? key : `${key}:${(schema.alias ?? schema.api).toKebabCase()}`
            acc[commandKey] = schema
        })

        return acc
    }, {} as Record<string, XSchema<any>>)

    for (const [key, schema] of Object.entries(entries)) {
        const args = schema.params.map(param => buildSignature(param, key)).join('\n')

        const command = class extends Command {

            protected signature = `${key} \n${args}`
            protected description = schema.description || 'No description available.'

            handle = async () => {
                const root = key.split(':').shift() as XCommand | undefined
                const $args = { ...(this.arguments() ?? {}), ...(this.options() ?? {}) }
                const [_, setCommand] = useCommand()
                setCommand(this)

                if (!root) return void this.error('Unknown command entry.').newLine()

                for (const param of schema.params)
                    if (param.required && !this.argument(param.parameter))
                        return void this.newLine().error(`Missing required argument: ${param.parameter}`).newLine()


                const repo = read<IRepoEntry>('default_repo')
                const token = read<string | undefined>('token')
                const repoSign = [$args.owner, $args.repo,].filter(Boolean).join('/')
                const repository = ((repoSign || repo.full_name).split('/') ?? ['', '']) as [string, string]
                const requiresRepo = schema.params.some(param => ['repo', 'user'].includes(param.parameter))

                if (requiresRepo && (!repository[0] || !repository[1]))
                    return void this.error(
                        'ERROR: No repository set. Please set a default repository using the [set-repo] command or provide one using the --repo option.'
                    ).newLine()

                if (!token)
                    return void this.error(
                        'ERROR: You\'re not signed in, please run the [login] command before you begin'
                    ).newLine()

                this.newLine()

                const spinner = this.spinner('Loading...\n').start()

                if (requiresRepo) {
                    $args['owner'] = repository[0]
                    $args['repo'] = repository[1]
                }

                const [err, result] = await promiseWrapper(
                    executeSchema(root, schema, $args),
                )

                if (err || !result) return void spinner.fail((err || 'An error occurred') + '\n')

                spinner.succeed(result.message)

                this.newLine()

                dataRenderer(result.data)

                this.newLine()
            }
        }

        commands.push(command as unknown as typeof Command)
    }

    return commands
}