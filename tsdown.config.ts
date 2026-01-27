import 'dotenv/config'

import { defineConfig } from 'tsdown'

const encodedClientId = Array
    .from(process.env.GITHUB_CLIENT_ID ?? '')
    .map(c => c.charCodeAt(0) ^ 73)
    .join('+')

export default defineConfig({
    define: {
        'process.env.GITHUB_CLIENT_ID': JSON.stringify(encodedClientId),
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    entry: ['src/cli.ts'],
    format: ['esm'],
    outDir: 'bin',
    dts: false,
    minify: true,
    sourcemap: false,
    external: [
        'fs',
        'path',
        'os',
        'dotenv'
    ],
    clean: true
}) 