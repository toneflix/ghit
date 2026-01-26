import { RestEndpointMethodTypes } from '@octokit/rest'

export interface XGeneric<X = any> {
    [key: string]: X;
}

export type XEvent =
    | 'charge.success'
    | 'transfer.success'
    | 'transfer.failed'
    | 'subscription.create';

export type XCommand = keyof RestEndpointMethodTypes

type KnownKeys<T> = keyof {
    [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : K]: T[K]
}

type ExtractParameters<T extends XCommand, M extends keyof RestEndpointMethodTypes[T]> =
    RestEndpointMethodTypes[T][M] extends { parameters: infer P }
    ? P extends object
    ? KnownKeys<P>
    : string
    : string

export interface XParam<
    T extends XCommand = XCommand,
    M extends keyof RestEndpointMethodTypes[T] = keyof RestEndpointMethodTypes[T]
> {
    /**
     * Setting this will make the parameter a command argument instead of a flag
     */
    arg?: boolean
    parameter: ExtractParameters<T, M>
    required: boolean
    type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object',
    description?: string,
    data?: any
    default?: any
    options?: string[]
    paramType?: 'body' | 'query' | 'header' | 'path'
}

export interface XSchema<
    T extends XCommand,
    M extends keyof RestEndpointMethodTypes[T] = keyof RestEndpointMethodTypes[T]
> {
    api: M;
    endpoint: string;
    alias?: string;
    description?: string | null;
    parameters?: XGeneric;
    body?: XGeneric;
    params: XParam<T, M>[]
}

export type XAPITree = {
    [K in XCommand]?: XSchema<K, keyof RestEndpointMethodTypes[K]>[]
}

// export interface XAPI {
//     [key: string]: XSchema[];
// }

export interface XArg {
    options: XGeneric;
    flags: string[];
}

export interface XSection {
    api: string;
}