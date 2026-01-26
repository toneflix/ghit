declare global {
    interface String {
        /**
         * Convert a string to Kebab Case
         * 
         * @returns 
         */
        toKebabCase (): string;

        /**
         * Convert a string to camel Case
         * 
         * @returns 
         */
        toCamelCase (): string;

        /**
         * Convert a string to Pascal Case
         * 
         * @returns 
         */
        toPascalCase (): string;

        /**
         * Convert a string to Snake Case
         * 
         * @returns 
         */
        toSnakeCase (): string;

        /**
         * Convert a string to Title Case
         * 
         * @returns
         */
        toTitleCase (): string;
    }
}
export { } 