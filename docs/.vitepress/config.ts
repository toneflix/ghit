import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'Ghit',
    description: 'Build, test, and manage your GitHub integration from the terminal',
    cleanUrls: true,
    lastUpdated: true,
    head: [
        ['link', { rel: 'icon', href: 'https://ghit.toneflix.net/banner.png' }],
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
        ['meta', { name: 'theme-color', content: '#0d1117' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
        ['link', { rel: 'apple-touch-icon', href: 'https://ghit.toneflix.net/banner.png' }],
        ['link', { rel: 'mask-icon', href: 'https://ghit.toneflix.net/banner.png', color: '#0d1117' }],
        ['meta', { name: 'msapplication-TileImage', content: 'https://ghit.toneflix.net/banner.png' }],
        ['meta', { property: 'og:title', content: 'Ghit' }],
        ['meta', { property: 'og:description', content: 'Command-line toolkit that blends hand-crafted workflows with OpenAPI-generated commands for GitHub.' }],
        ['meta', { property: 'og:image', content: 'https://ghit.toneflix.net/banner.png' }],
        ['meta', { property: 'og:url', content: 'https://ghit.toneflix.net' }],
        ['meta', { name: 'og:type', content: 'website' }],
        ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: 'Ghit' }],
        ['meta', { name: 'twitter:description', content: 'Command-line toolkit that blends hand-crafted workflows with OpenAPI-generated commands for GitHub.' }],
        ['meta', { name: 'twitter:image', content: 'https://ghit.toneflix.net/banner.png' }],
        ['meta', { name: 'twitter:site', content: '@toneflixx' }],
        ['meta', { name: 'twitter:creator', content: '@toneflixx' }],
    ],
    themeConfig: {
        logo: '/banner.png',

        nav: [
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'API Reference', link: '/api/issues' },
            { text: 'Bulk Operations', link: '/guide/bulk-operations' },
            { text: 'GitHub', link: 'https://github.com/toneflix/ghit' },
            { text: 'npm', link: 'https://www.npmjs.com/package/ghit' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Introduction',
                    items: [
                        { text: 'What is Ghit?', link: '/guide/what-is-ghit' },
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
            { icon: 'github', link: 'https://github.com/toneflix/ghit' }
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
