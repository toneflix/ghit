import { GeneratedParam, GeneratedTree } from '../Contracts/Grithub'
import { mkdirSync, writeFileSync } from 'node:fs'
import path, { dirname } from 'node:path'
import { read, write } from 'src/db'
import { useCommand, useConfig } from '../hooks'

import { IConfig } from '../Contracts/Interfaces'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { installPackage } from '@antfu/install-pkg'
import { logger } from 'src/helpers'

export class ApisGenerator {
    spec: Record<string, any>
    config: IConfig

    openapi: {
        [key: string]: any,
        schemas: {
            [key: string]: any
        }
    }

    private skipApis = new Set<string>([
        'issues:list', 'issues:update', 'issues:seed', 'issues:delete'
    ])
    private skipParams = new Set<string>(['s'])
    private PARAM_LOCATIONS = new Set(['path', 'query', 'header'])

    constructor(
        openapi: Record<string, any>,
        schema: string = 'api.github.com.deref'
    ) {
        const [getConfig] = useConfig()
        this.openapi = openapi as any
        this.spec = this.openapi.schemas[schema]
        this.config = getConfig()

        if (!this.spec || !this.spec.paths) {
            throw new Error(`Could not find ${schema} schema`)
        }
    }

    static async installOctokitOpenapi () {
        const spinner = (useCommand()[0]())
            .spinner('Installing @octokit/openapi...')
            .start()

        const __filename = fileURLToPath(import.meta.url)
        const __dirname = dirname(__filename)
        const dirPath = path.normalize(path.join(__dirname, '../..'))

        await installPackage('@octokit/openapi', {
            cwd: dirPath,
            silent: true,
            dev: true,
        })

        spinner.succeed('@octokit/openapi installed successfully.')

        return (await import(('@octokit/openapi'))).default
    }

    skipParam (name: string): boolean {
        return this.skipParams.has(name) ||
            name.length > 20 ||
            name.length <= 2
    }

    skipApi (api: string, namespace?: string): boolean {
        const cmd = (namespace ? namespace + ':' : '') + api.toCamelCase()

        return this.skipApis.has(cmd) ||
            this.skipApis.has(api.toCamelCase()) ||
            cmd.length > (this.config.skipLongCommandGeneration ? 23 : Infinity)
    }

    normalizeType (schema: any): string {
        const typeMap: Record<string, string> = {
            integer: 'Number',
            number: 'Number',
            string: 'String',
            boolean: 'Boolean',
            array: 'Array',
            object: 'Object',
            enum: 'String',
            oneOf: 'String',
            anyOf: 'String',
            allOf: 'String',
        }

        let type = typeMap[schema?.type] || 'any'

        // Handle array of types
        if (Array.isArray(schema?.type)) {
            type = schema.type.map((t: string) => typeMap[t] || 'any').join('|')
        }

        if (type !== 'any') return type

        // Fallback checks
        if (!schema) type = 'any'
        if (Array.isArray(schema.type)) return schema.type.join('|')
        if (schema.type) type = schema.type
        if (schema.enum) type = 'enum'
        if (schema.oneOf) type = 'oneOf'
        if (schema.anyOf) type = 'anyOf'
        if (schema.allOf) type = 'allOf'

        return typeMap[type] || 'any'
    }

    gatherParams (op: any): GeneratedParam[] {
        const collected: GeneratedParam[] = []

        for (const p of op.parameters ?? []) {
            const loc = this.PARAM_LOCATIONS.has(p.in) ? (p.in as GeneratedParam['paramType']) : 'query'

            if (this.skipParam(p.name)) continue

            collected.push({
                parameter: p.name,
                required: !!p.required,
                type: this.normalizeType(p.schema).toPascalCase(),
                description: p.description,
                paramType: loc,
            })
        }

        const jsonBody = op.requestBody?.content?.['application/json']
        const bodySchema = jsonBody?.schema
        const bodyProps: Record<string, any> = bodySchema?.properties ?? {}
        const requiredProps: string[] = bodySchema?.required ?? []

        for (const [name, schema] of Object.entries(bodyProps)) {
            if (this.skipParam(name)) continue
            collected.push({
                parameter: name,
                required: requiredProps.includes(name) || !!jsonBody?.required,
                type: this.normalizeType(schema).toPascalCase(),
                description: (schema as any).description,
                paramType: 'body',
            })
        }

        return collected
    }

    buildTree (): GeneratedTree {
        const tree: GeneratedTree = {}

        for (const [route, ops] of Object.entries<any>(this.spec.paths)) {
            for (const [_method, def] of Object.entries<any>(ops ?? {})) {
                const op = def
                const opId: string | undefined = op?.operationId
                if (!opId) continue

                const [namespace, name] = opId.split('/')
                if (!namespace || !name || this.skipApi(name, namespace)) continue

                const params = this.gatherParams(op)

                if (!tree[namespace.toCamelCase()]) tree[namespace.toCamelCase()] = []

                tree[namespace.toCamelCase()].push({
                    api: name.toCamelCase(),
                    endpoint: route,
                    description: op.summary ?? op.description ?? undefined,
                    alias: op['x-github']?.alias ?? op['x-octokit']?.alias ?? undefined,
                    params,
                })
            }
        }

        return tree
    }

    /**
     * Get output path for generated APIs
     * 
     * @param type 
     * @returns 
     */
    static getOutputPath (type: 'global' | 'local' = 'local'): string {
        if (type === 'global') {
            return path.join(homedir(), '.grithub/apis.generated.js')
        }

        return path.join(process.cwd(), '.grithub/apis.generated.js')
    }

    /**
     * Run the API generator
     * 
     * @returns 
     */
    static async run () {
        let octokitOpenapi: any
        let type = read<'global' | 'local'>('generated_commands_type', 'local')
        const [cmd] = useCommand()
        const command = cmd()

        type = await command.choice(`Api Generation Type${type ? ` (${type.toTitleCase()})` : ''}`, [
            { value: 'global', name: 'Global', description: 'Will always be available.' },
            { value: 'local', name: 'Local', description: 'Only for this project.' },
            { value: 'cancel', name: logger('Cancel', 'red'), description: 'Cancel the operation.' }
        ], 0) as never

        if (type === 'cancel') {
            return void command.newLine().info('Operation cancelled.').newLine()
        }

        // Save the generation type
        write('generated_commands_type', type)

        const spinner = command.spinner('Checking if @octokit/openapi Installed...').start()

        try {
            ({ default: octokitOpenapi } = await import(('@octokit/openapi')))
            spinner.succeed('@octokit/openapi is already installed.')
        } catch {
            spinner.fail('@octokit/openapi is not installed.')
            octokitOpenapi = await ApisGenerator.installOctokitOpenapi()
        }

        spinner.start('Generating Extended APIs...')

        // Instantiate generator
        const generator = new ApisGenerator(octokitOpenapi, 'api.github.com.deref')

        const tree = generator.buildTree()
        const target = ApisGenerator.getOutputPath(type)
        const header = '// Auto-generated from @octokit/openapi. Do not edit directly.\n\n'

        const stringObject = JSON
            .stringify(tree, null, 2)
            // Remove quotes from identifier-like keys only
            .replace(/"([A-Za-z_][\w$]*)":/g, '$1:')
            // Convert surrounding double quotes on values to single quotes, unescape \" (safe inside single quotes), and escape single quotes
            .replace(
                /:\s*"((?:[^"\\]|\\.)*)"/g,
                (_, p1) => `: '${p1.replace(/\\"/g, '"').replace(/'/g, '\\\'')}'`
            )

        const contents =
            `${header}export const APIs = ${stringObject}\n\nexport default APIs\n`

        mkdirSync(path.dirname(target), { recursive: true })
        writeFileSync(target, contents, 'utf8')
        spinner.succeed('Generated Extended APIs to: ' + logger(target, ['gray', 'italic']))
    }
}
