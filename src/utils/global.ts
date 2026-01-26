String.prototype.toKebabCase = function (): string {
    return this
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase()
}

String.prototype.toCamelCase = function (): string {
    return this
        .replace(/[-_ ]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
        .replace(/^[A-Z]/, (c) => c.toLowerCase())
}

String.prototype.toPascalCase = function (): string {
    return this
        .replace(/(^\w|[-_ ]+\w)/g, (match) => match.replace(/[-_ ]+/, '').toUpperCase())
}

String.prototype.toSnakeCase = function (): string {
    return this
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase()
}

String.prototype.toTitleCase = function (): string {
    return this
        .toLowerCase()
        .replace(/(^|\s)\w/g, (match) => match.toUpperCase())
}

export { }
