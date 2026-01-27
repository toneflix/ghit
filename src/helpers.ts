import { Logger, LoggerChalk } from '@h3ravel/shared'
import { XCommand, XGeneric, XSchema } from './Contracts/Generic.js'

import { IIssue } from './Contracts/Interfaces'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import readline from 'node:readline/promises'
import { useOctokit } from './hooks'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Wrap a promise to return a tuple of error and result
 * 
 * @param promise 
 * @returns 
 */
export const promiseWrapper = <T> (promise: Promise<T>): Promise<[string | null, T | null]> =>
    promise
        .then((data) => [null, data] as [null, T])
        .catch((error) => [typeof error === 'string' ? error : error.message, null] as [string, null])

/**
 * Check if a value is JSON
 * 
 * @param val 
 * @returns 
 */
export function isJson (val: any): val is XGeneric {
    return val instanceof Array || val instanceof Object ? true : false
}

/**
 * Parse a URL
 * 
 * @param uri 
 * @returns 
 */
export function parseURL (uri: string) {
    if (!uri.startsWith('http')) uri = 'http://' + uri

    return new URL(uri)
}

/**
 * Execute a schema
 * 
 * @param schema 
 * @param options 
 * @returns 
 */
export async function executeSchema (root: XCommand, schema: XSchema<any>, args: XGeneric) {
    const octokit = useOctokit()

    const { data, message } = (await Reflect.apply(octokit[root][schema.api as never], octokit[root], [args])) as {
        data: any,
        message?: string
    }

    if (!data || (Array.isArray(data) && data.length < 1) || (data instanceof Object && Object.keys(data).length < 1)) {
        return { data: null, message: message ?? 'Request was successful but returned no data.', status: false }
    }

    return { data, message: message ?? 'Request Completed', status: true }
}

/**
 * Wait for a specified number of milliseconds
 * 
 * @param ms 
 * @param callback 
 * @returns 
 */
export const wait = (ms: number, callback?: () => any) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            if (callback) resolve(callback())
            resolve()
        }, ms)
    })
}

/**
 * Logger helper
 * 
 * @param str 
 * @param config 
 * @returns 
 */
export const logger = <B extends boolean = false> (
    str: string,
    config: LoggerChalk = ['green', 'italic'],
    log?: B
): B extends true ? void : string => {
    return Logger.log(str, config, log ?? false) as never
}

export const viewIssue = (issue: IIssue) => {
    Logger.log([
        ['Title:', ['white', 'bold']], [issue.title, ['blue']],
        ['\nType:', ['white', 'bold']], [typeof issue.type === 'string' ? issue.type : issue.type?.name ?? 'N/A', ['blue']],
        ['\nNumber:', ['white', 'bold']], [String(issue.number), ['blue']],
        ['\nState:', ['white', 'bold']], [issue.state, ['blue']],
        ['\nLabels:', ['white', 'bold']], [issue.labels.map((l: any) => l.name ?? l).join(', '), ['blue']],
        ['\nAssignees:', ['white', 'bold']], [issue.assignees?.map((a: any) => a.login ?? a).join(', ') || 'N/A', ['blue']],
        ['\nCreated at:', ['white', 'bold']], [new Date(issue.created_at).toLocaleString(), ['blue']],
        ['\nUpdated at:', ['white', 'bold']], [new Date(issue.updated_at).toLocaleString(), ['blue']],
    ], ' ')
}

/**
 * Find the nearest package.json file
 * 
 * @param startDir 
 * @returns 
 */
export const findCLIPackageJson = (startDir = __dirname) => {
    let dir = startDir

    while (true) {
        const pkgPath = path.join(dir, 'package.json')
        if (existsSync(pkgPath)) {
            return pkgPath
        }

        const parent = path.dirname(dir)
        if (parent === dir) break
        dir = parent
    }

    return null
}

/**
 * Wait for the user to press Enter
 * 
 * @param onEnter 
 */
export const waitForEnter = async (onEnter: () => void | Promise<void>) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    await rl.question('')
    onEnter()
    rl.close()
}
