import 'dotenv/config'

export const config: {
    CLIENT_ID: string
    CLIENT_TYPE: 'oauth-app' | 'github-app'
    SCOPES: string[]
} = {
    CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
    CLIENT_TYPE: 'oauth-app',
    SCOPES: ['repo', 'read:user', 'user:email'],
}