import { IIssue, IIssueFile, IIssueMetadata } from 'src/Contracts/Interfaces'
import path, { join } from 'path'
import { useCommand, useOctokit } from 'src/hooks'

import { Command } from '@h3ravel/musket'
import { Logger } from '@h3ravel/shared'
import dns from 'dns/promises'
import fs from 'fs'

/**
 * GitHub Issues Creator
 * 
 * This script reads markdown issue files from the issues directory
 * and creates them as GitHub issues using the GitHub API.
 */
export class IssuesSeeder {
    private command: Command

    constructor() {
        const [command] = useCommand()
        this.command = command()
    }

    /**
     * Set filename in issue content
     * 
     * @param content 
     * @param fileName 
     */
    setFilePath (content: string, filePath?: string): string {
        if (!filePath) return content

        if (content.includes('<!-- grithub#filepath:')) {
            content = content.replace(/<!--\s*grithub#filepath:\s*.+?\s*-->/i, `<!-- grithub#filepath: ${filePath} -->`)
        } else {
            content = `<!-- grithub#filepath: ${filePath} -->\n\n` + content
        }

        return content
    }

    /**
     * Get filename from issue content
     * 
     * @param content 
     * @returns 
     */
    getFilePath (content: string): string | undefined {
        const fileNameRegex = /<!--\s*grithub#filepath:\s*(.+?)\s*-->/i
        const match = content.match(fileNameRegex)

        if (match) {
            return match[1].trim()
        }

        return undefined
    }

    /**
     * Parse frontmatter from markdown file
     * 
     * @param content 
     * @returns 
     */
    parseFrontmatter (content: string) {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
        const match = content.match(frontmatterRegex)

        if (!match) {
            return { metadata: {}, body: content }
        }

        const [, frontmatter, body] = match
        const metadata: IIssueMetadata = {}

        // Parse frontmatter fields
        const lines = frontmatter.split('\n')
        let currentKey: keyof IIssueMetadata | null = null

        for (const line of lines) {
            const keyValueMatch = line.match(/^(\w+):\s*['"]?(.*?)['"]?$/) as [
                string,
                keyof IIssueMetadata,
                keyof IIssueMetadata['type']
            ] | null

            if (keyValueMatch) {
                const [, key, value] = keyValueMatch
                currentKey = key
                metadata[key] = value
            } else if (currentKey && line.trim()) {
                // Handle multi-line values
                metadata[currentKey] += '\n' + line.trim()
            }
        }

        return { metadata, body: body.trim() }
    }

    /**
     * Create a GitHub issue
     * 
     * @param entry 
     * @param owner 
     * @param repo 
     * @returns 
     */
    async updateIssue (entry: IIssueFile, issue: IIssue, owner: string, repo: string): Promise<IIssue> {
        try {
            const { data } = await useOctokit().issues.update({
                repo,
                owner,
                issue_number: issue.number,
                body: this.setFilePath(entry.body, entry.filePath),
                title: entry.title,
                labels: entry.labels || [],
                assignees: entry.assignees || []
            })

            return data
        } catch (error: any) {
            throw this.requestError(error, owner, repo)
        }
    }

    /**
     * Create a GitHub issue
     * 
     * @param entry 
     * @param owner 
     * @param repo 
     * @returns 
     */
    async createIssue (entry: IIssueFile, owner: string, repo: string): Promise<IIssue> {
        try {
            const { data } = await useOctokit().issues.create({
                repo,
                owner,
                type: entry.type,
                body: this.setFilePath(entry.body, entry.filePath),
                title: entry.title,
                labels: entry.labels || [],
                assignees: entry.assignees || []
            })

            return data
        } catch (error: any) {
            throw this.requestError(error, owner, repo)
        }
    }

    /**
     * Read all issue files from a directory
     */
    getIssueFiles (dir: string): string[] {
        const files: string[] = []
        const spinner = this.command.spinner('Reading issue files...').start()

        const traverse = (currentDir: string) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true })

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name)

                if (entry.isDirectory()) {
                    traverse(fullPath)
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    files.push(fullPath)
                }
            }
        }

        traverse(dir)

        // Sort to maintain order
        const sortedFiles = files.sort()

        spinner.succeed(`Found ${sortedFiles.length} issue files`)

        if (sortedFiles.length === 0) {
            spinner.info('No issue files found. Exiting.')
            process.exit(0)
        }

        return sortedFiles
    }

    /**
     * Process a single issue file
     * 
     * @param filePath 
     * @returns 
     */
    processIssueFile (filePath: string): IIssueFile {
        const directory = join(process.cwd(), this.command.argument('directory', 'issues'))
        const content = fs.readFileSync(filePath, 'utf-8')
        const { metadata, body } = this.parseFrontmatter(content)

        // Extract wave and issue number from path
        const relativePath = path.relative(directory, filePath)
        // const pathParts = relativePath.split(path.sep)
        // const wave = pathParts[0] // e.g., 'wave-1'
        const fileName = path.basename(filePath, '.md')

        // Parse labels
        let labels: string[] = []

        if (metadata.labels) {
            labels = metadata.labels
                .split(',')
                .map(l => l.trim())
                .filter(l => l)
        }

        // Add wave label
        // labels.push(wave)

        // Parse assignees
        let assignees: string[] = []
        if (metadata.assignees && metadata.assignees.trim()) {
            assignees = metadata.assignees
                .split(',')
                .map(a => a.trim())
                .filter(a => a)
        }

        return {
            filePath: relativePath,
            title: metadata.title || metadata.name || fileName,
            type: metadata.type,
            body: body,
            labels: labels,
            assignees: assignees,
            // wave: wave,
            fileName: fileName
        }
    }

    /**
     * Validate GitHub token and repository access
     * 
     * @param owner 
     * @param repo 
     * @returns 
     */
    async validateAccess (owner: string, repo: string) {
        const spinner = this.command.spinner('Checking GitHub access...').start()
        try {
            return await useOctokit().repos.get({ owner, repo })
        } catch (error: any) {
            spinner.stop()
            let message: string = ''

            if (error.status === 404) {
                message =
                    `ERROR: ${error.message}\n\n` +
                    'This usually means:\n' +
                    '  1. No internet connection\n' +
                    '  2. DNS server issues\n' +
                    '  3. Firewall/proxy blocking DNS\n\n' +
                    'Troubleshooting:\n' +
                    '  - Check your internet connection\n' +
                    '  - Try opening https://github.com in your browser\n' +
                    '  - If behind a corporate firewall, check proxy settings\n' +
                    '  - Try using a different DNS (e.g., 8.8.8.8)\n\n' +
                    `Original error: ${error.message}`
            } else {
                message = `ERROR: GitHub access validation failed: ${error.message}`
            }

            throw new Error(message)
        } finally {
            spinner.succeed('GitHub access validated successfully.')
        }
    }

    /**
     * Check network connectivity to GitHub
     */
    async checkConnectivity () {
        const spinner = this.command.spinner('Checking network connectivity...').start()

        try {
            const addresses = await dns.resolve('api.github.com')
            spinner.succeed(`DNS resolution successful: ${Logger.log(addresses[0], 'blue', !1)}`)

            return addresses
        } catch (error: any) {
            spinner.stop()
            throw new Error(
                'ERROR: Cannot resolve api.github.com\n\n' +
                'This usually means:\n' +
                '  1. No internet connection\n' +
                '  2. DNS server issues\n' +
                '  3. Firewall/proxy blocking DNS\n\n' +
                'Troubleshooting:\n' +
                '  - Check your internet connection\n' +
                '  - Try opening https://github.com in your browser\n' +
                '  - If behind a corporate firewall, check proxy settings\n' +
                '  - Try using a different DNS (e.g., 8.8.8.8)\n\n' +
                `Original error: ${error.message}`
            )
        }
    }

    /**
     * Fetch all open issues from the repository
     * 
     * @param owner 
     * @param repo 
     * @param state 
     * @returns 
     */
    async fetchExistingIssues (owner: string, repo: string, state?: 'open' | 'closed' | 'all'): Promise<IIssue[]> {
        const issues: IIssue[] = []
        let page = 1
        let hasMore = true

        const spinner = this.command.spinner('Fetching existing open issues...').start()

        while (hasMore) {
            try {
                const { data } = await useOctokit().issues.listForRepo({
                    owner,
                    repo,
                    state: state || 'open',
                    per_page: 100,
                    page: page,
                })

                issues.push(...data.filter(issue => !issue.pull_request))
                spinner.stop()

                hasMore = issues.length % 100 === 0 && data.length === 100

                if (hasMore) {
                    page++
                } else {
                    hasMore = false
                }
            } catch (error: any) {
                hasMore = false
                spinner.stop()
                this.command.warn(`ERROR: Failed to fetch existing issues: ${error.message}`)
                this.command.warn('INFO: Proceeding without duplicate check...')
            }

        }

        spinner.succeed(`Found ${issues.length} existing issues.`)

        return issues
    }

    /**
     * Handle GitHub API request errors
     * 
     * @param error 
     * @param owner 
     * @param repo 
     * @returns 
     */
    private requestError (error: Error & { status?: number }, owner?: string, repo?: string) {
        // Add specific help for common errors
        let errorMsg = error.message || 'GitHub API error'

        if (error.status === 401) {
            errorMsg += '\n\nThis is an authentication error. Check that:'
            errorMsg += `\n  1. You are logged in (make sure to run the ${Logger.log('login', ['grey', 'italic'], !1)}`
            errorMsg += 'command first)'
            errorMsg += '\n  2. The app token has "repo" scope'
            errorMsg += '\n  3. The app token hasn\'t expired'
        } else if (error.status === 404) {
            errorMsg += '\n\nRepository not found. Check that:'
            if (owner)
                errorMsg += `\n  1. ${Logger.log(owner, ['blue', 'bold'], !1)} is a valid gitHub username or organization`
            if (repo)
                errorMsg += `\n  2. ${Logger.log(repo, ['blue', 'bold'], !1)} is the correct repository name`
            errorMsg += '\n  3. You have access to this repository'
        } else if (error.status === 422) {
            errorMsg += '\n\nValidation failed. This usually means:'
            errorMsg += '\n  1. Issue data format is invalid'
            errorMsg += '\n  2. Labels don\'t exist in the repository'
            errorMsg += '\n  3. Assignees don\'t have access to the repository'
        }

        return new Error(errorMsg)
    }
} 
