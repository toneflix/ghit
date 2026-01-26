import { Logger } from '@h3ravel/shared'
import { XGeneric } from '../Contracts/Generic'
import diff from 'fast-diff'
import { logger } from 'src/helpers'

/**
 * We will recursively map through the result data and log each key value pair
 * as we apply coloring based on the value type.
 * We also need to handle root or nested objects and arrays while considering
 * indentation for better readability.
 * 
 * @param data 
 */
export const dataRenderer = (data: XGeneric) => {
    const render = (obj: XGeneric, indent = 0) => {
        const indentation = ' '.repeat(indent)
        for (const key in obj) {
            const value = obj[key]
            if (typeof value === 'object' && value !== null) {
                console.log(`${indentation}${stringFormatter(key)}:`)
                render(value, indent + 2)
            } else {
                let coloredValue
                switch (typeof value) {
                    case 'string':
                        coloredValue = Logger.log(value, 'green', false)
                        break
                    case 'number':
                        coloredValue = Logger.log(String(value), 'yellow', false)
                        break
                    case 'boolean':
                        coloredValue = Logger.log(String(value), 'blue', false)
                        break
                    case 'object':
                        if (value === null) {
                            coloredValue = Logger.log('null', 'gray', false)
                        } else {
                            coloredValue = Logger.log(JSON.stringify(value), 'cyan', false)
                        }
                        break
                    default:
                        coloredValue = value
                }
                console.log(`${indentation}${stringFormatter(key)}: ${coloredValue}`)
            }
        }
    }

    render(data)
}

/**
 * We will format a string by replacing underscores and hyphens with spaces,
 * capitalizing the first letter of every word,
 * converting camelCase to spaced words,
 * and trimming any leading or trailing spaces.
 * If a sentence is only two letters long we will make it uppercase.
 * 
 * @param str 
 * @returns 
 */
export const stringFormatter = (str: string) => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaced words
        .replace(/[_-]+/g, ' ')               // underscores and hyphens to spaces
        .replace(/\s+/g, ' ')                 // multiple spaces to single space
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
        .join(' ')
        .trim()
        .replace(/^(\w{2})$/, (_, p1) => p1.toUpperCase()) // uppercase if two letters
}

/**
 * Render the difference between two text strings, highlighting additions and deletions.
 * 
 * @param oldText 
 * @param newText 
 * @returns 
 */
export const diffText = (oldText: string, newText: string): string => {
    return diff(newText, oldText).map(part => {
        const [type, text] = part
        if (type === 0) {
            return text
        } else if (type === -1) {
            return logger(text, ['red', 'strikethrough'], !1)
        } else {
            return logger(text, ['green', 'underline'], !1)
        }
    }).join('')
}