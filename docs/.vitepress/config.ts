import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'Grithub',
    description: 'Build, test, and manage your Grithub integration from the terminal',
    cleanUrls: true,
    lastUpdated: true,
    head: [
        ['link', { rel: 'icon', href: 'https://grithub.toneflix.net/banner.png' }],
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
        ['meta', { name: 'theme-color', content: '#07c4f9' }],
        ['meta', { name: 'description', content: 'Build, test, and manage your Grithub integration from the terminal' }],
        ['meta', { property: 'og:title', content: 'Grithub' }],
        ['meta', { property: 'og:description', content: 'Build, test, and manage your Grithub integration from the terminal' }],
        ['meta', { property: 'og:image', content: 'https://grithub.toneflix.net/banner.png' }],
        ['meta', { property: 'og:url', content: 'https://grithub.toneflix.net' }],
    ],
    themeConfig: {
        logo: '/banner.png',

        nav: [
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'API Reference', link: '/api/issues' },
            { text: 'Bulk Operations', link: '/guide/bulk-operations' },
            { text: 'GitHub', link: 'https://github.com/toneflix/grithub' },
            { text: 'npm', link: 'https://www.npmjs.com/package/@toneflix/grithub' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Introduction',
                    items: [
                        { text: 'What is Grithub?', link: '/guide/what-is-grithub' },
                        { text: 'Getting Started', link: '/guide/getting-started' },
                        { text: 'Quick Start', link: '/guide/quick-start' }
                    ]
                },
                {
                    text: 'Core Concepts',
                    items: [
                        { text: 'Authentication', link: '/guide/authentication' },
                        { text: 'Configuration', link: '/guide/configuration' },
                        { text: 'Commands', link: '/guide/commands' }
                    ]
                },
                {
                    text: 'Features',
                    items: [
                        { text: 'Bulk Operations', link: '/guide/bulk-operations' },
                    ]
                },
                {
                    text: 'Advanced',
                    items: [
                        { text: 'Development', link: '/guide/development' },
                        // { text: 'Troubleshooting', link: '/guide/troubleshooting' },
                        { text: 'Contributing', link: '/guide/contributing' }
                    ]
                }
            ],
            '/api/': [
                {
                    text: 'Core Commands',
                    items: [
                        { text: 'Issues', link: '/api/issues' }
                    ]
                },
                {
                    text: 'Generated Commands',
                    items: [
                        { text: 'Using Generated APIs', link: '/api/generated' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/toneflix/grithub' }
        ],

        footer: {
            message: 'Released under the ISC License.',
            copyright: 'Copyright © 2026 ToneFlix Technologies Limited'
        },

        search: {
            provider: 'local'
        }
    }
})
