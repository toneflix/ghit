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