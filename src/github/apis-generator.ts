import fs from 'node:fs'
import { installPackage } from '@antfu/install-pkg'
import path from 'node:path'
import { useCommand } from 'src/hooks'

// Simple runtime shape for the generated API tree
export type GeneratedParam = {
    parameter: string
    required: boolean
    type: string
    description?: string
    paramType: 'path' | 'query' | 'body' | 'header'
}

export type GeneratedSchema = {
    api: string
    endpoint: string
    description?: string
    alias?: string | null
    params: GeneratedParam[]
}

export type GeneratedTree = {
    [namespace: string]: GeneratedSchema[]
}

export class ApisGenerator {
    spec: Record<string, any>

    openapi: {
        [key: string]: any,
        schemas: {
            [key: string]: any
        }
    }

    private PARAM_LOCATIONS = new Set(['path', 'query', 'header'])

    private skipParams = new Set([
        'default_for_new_repos', 'configuration_id', 'scope'
    ])

    private skipApis = new Set([
        'createConfiguration', 'getConfigurationsForOrg',
        'getRepositoriesForEnterpriseConfiguration',
        'updateEnterpriseConfiguration', 'createConfigurationForEnterprise',
        'getConfigurationForEnterprise', 'deleteConfiguration',
        'getAllConfigurations', 'getConfigurationForRepo',
    ])

    constructor(
        openapi: Record<string, any>,
        schema: string = 'api.github.com.deref'
    ) {
        this.openapi = openapi as any
        this.spec = this.openapi.schemas[schema]

        if (!this.spec || !this.spec.paths) {
            throw new Error(`Could not find ${schema} schema`)
        }
    }

    static async installOctokitOpenapi () {
        const spinner = (useCommand()[0]())
            .spinner('Installing @octokit/openapi...')
            .start()

        await installPackage('@octokit/openapi', {
            cwd: process.cwd(),
            silent: true,
        })

        spinner.succeed('@octokit/openapi installed successfully.')

        return (await import(('@octokit/openapi'))).default
    }

    skipParam (name: string): boolean {
        return this.skipParams.has(name) ||
            name.length > 20 ||
            name.length < 2
    }

    skipApi (api: string): boolean {
        return this.skipApis.has(api) ||
            api.length > 20 ||
            api.length < 2
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
                if (!namespace || !name || this.skipApi(name.toCamelCase())) continue

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

    static async run () {
        const [cmd] = useCommand()
        const command = cmd()
        let octokitOpenapi: any

        const spinner = command.spinner('Checking if @octokit/openapi Installed...').start()

        try {
            ({ default: octokitOpenapi } = await import(('@octokit/openapi')))
            spinner.succeed('@octokit/openapi is already installed.')
        } catch {
            spinner.fail('@octokit/openapi is not installed.')
            octokitOpenapi = await ApisGenerator.installOctokitOpenapi()
        }

        spinner.start('Generating Extended APIs...')

        const generator = new ApisGenerator(octokitOpenapi, 'api.github.com.deref')
        const tree = generator.buildTree()

        const target = path.join(process.cwd(), 'github/apis.generated.ts')
        const header = '// Auto-generated from @octokit/openapi. Do not edit directly.\n\n'

        /**
         * Remove all double quotes from object keys, and convert 
         * double quotes from object values to single quotes for cleaner output
         * At the same time, pay attention to not affect the quotes inside the strings.
         */
        const stringObject = JSON
            .stringify(tree, null, 2)
            // Remove quotes from identifier-like keys only
            .replace(/"([A-Za-z_][\w$]*)":/g, '$1:')
            // Convert surrounding double quotes on values to single quotes, preserve inner escapes, and escape single quotes
            .replace(/:\s*"((?:[^"\\]|\\.)*)"/g, (_, p1) => `: '${p1.replace(/'/g, '\\\'')}'`)

        const contents = `${header}import { XAPITree } from '@toneflix/grithub'\n\nexport const APIs = ${stringObject} as const satisfies XAPITree\n\nexport default APIs\n`

        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.writeFileSync(target, contents, 'utf8')

        spinner.succeed('Generated Extended APIs to: ' + 'target')
    }
}
