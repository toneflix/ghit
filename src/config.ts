import 'dotenv/config'

const ecid = String(process.env.GITHUB_CLIENT_ID!)
    .split('+')
    .map(n => String.fromCharCode(Number(n) ^ 73))
    .join('')

export const config: {
    CLIENT_ID: string
    CLIENT_TYPE: 'oauth-app' | 'github-app'
    SCOPES: string[]
} = {
    CLIENT_ID: process.env.NODE_ENV === 'production' ? ecid : String(process.env.GITHUB_CLIENT_ID),
    CLIENT_TYPE: 'oauth-app',
    SCOPES: ['repo', 'read:user', 'user:email'],
}