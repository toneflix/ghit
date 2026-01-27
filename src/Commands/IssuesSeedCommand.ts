import { IIssue, IIssueFile, IRepoEntry } from 'src/Contracts/Interfaces'
import { logger, wait } from 'src/helpers'

import { Command } from '@h3ravel/musket'
import { IssuesSeeder } from 'src/github/issues-seeder'
import { Logger } from '@h3ravel/shared'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { read } from 'src/db'
import { useCommand } from 'src/hooks'

export class IssuesSeedCommand extends Command {
    protected signature = `issues:seed
        {directory=issues : The directory containing issue files to seed from.}
        {--r|repo? : The repository to seed issues into. If not provided, the default repository will be used.}
        {--dry-run : Simulate the deletion without actually deleting issues.}
    `

    protected description = 'Seed the database with issues from a preset directory.'

    async handle () {
        const [_, setCommand] = useCommand()
        setCommand(this)

        const directory = join(process.cwd(), this.argument('directory', 'issues'))
        const isDryRun = this.option('dryRun', false)
        const repo = read<IRepoEntry>('default_repo')

        if (!repo)
            return void this.error(
                `ERROR: No default repository set. Please set a default repository using the ${logger('set-repo', ['grey', 'italic'])} command.`
            )

        const seeder = new IssuesSeeder()

        try {
            const usernameRepo = (this.option('repo', repo.full_name).split('/') ?? ['', '']) as [string, string]
            // Check network connectivity first
            await seeder.checkConnectivity()

            // Validate GitHub access
            await seeder.validateAccess(...usernameRepo)

            // Check if issues directory exists
            if (!existsSync(directory)) {
                return void this.error(`ERROR: Issues directory not found: ${logger(directory, ['grey', 'italic'])}`)
            }

            // Get all issue files
            const issueFiles = seeder.getIssueFiles(directory)

            const existingIssues = await seeder.fetchExistingIssues(...usernameRepo, 'all')

            // Create a set of existing issue titles for quick lookup
            const existingIssuePaths = new Set(existingIssues.map(i => seeder.getFilePath(i.body ?? '')))

            // Process each issue file
            const issues = issueFiles.map(seeder.processIssueFile.bind(seeder)).filter(Boolean)

            // Separate issues into those to create and those to skip
            const toCreate: IIssueFile[] = []
            const toSkip: { issue: IIssueFile, existingIssue: IIssue }[] = []

            issues.forEach(issue => {
                if (existingIssuePaths.has(issue.filePath)) {
                    const existingIssue = existingIssues.find(ei => ei.title.toLowerCase() === issue.title.toLowerCase())!
                    toSkip.push({ issue, existingIssue })
                } else {
                    toCreate.push(issue)
                }
            })

            // Display summary
            if (toSkip.length > 0) {
                this.newLine().info('INFO: Issues to SKIP (already exist):')
                toSkip.forEach(({ issue, existingIssue }) => {
                    logger(`  >  ${issue.title}`, 'white', !0)
                    logger(`     Existing: #${existingIssue.number} (${existingIssue.state})`, 'white', !0)
                })
            }


            if (toCreate.length > 0) {
                this.newLine().info('INFO: Issues to CREATE:').newLine()
                toCreate.forEach((issue, index) => {
                    logger(`${index + 1}. ${issue.title}`, 'white', !0)
                })
                this.newLine()
            } else {
                this.newLine().success('INFO: No new issues to create. All issues already exist').newLine()
                Logger.log([['☑ Total files:', 'white'], [issues.length.toString(), 'blue']], ' ')
                Logger.log([['> Skipped:', 'white'], [toSkip.length.toString(), 'blue']], ' ')
                Logger.log([['± To create:', 'white'], [toCreate.length.toString(), 'blue']], ' ')

                return void this.newLine()
            }

            // Confirm before proceeding
            Logger.log([
                ['⚠️ ', 'white'],
                [' CONFIRM ', 'bgYellow'],
                ['This will create', 'yellow'],
                [toCreate.length.toString(), 'blue'],
                ['new issues on GitHub.', 'yellow']
            ], ' ')

            if (toSkip.length > 0) {
                this.info(`(Skipping ${toSkip.length} existing issues)`)
            }

            const proceed = await this.confirm(`Do you want to proceed?${isDryRun ? ' (Dry Run - No changes will be made)' : ''}`)

            if (proceed) {
                this.newLine()

                // Create issues
                let created = 0
                let failed = 0

                const spinner = this.spinner('Creating issues...').start()

                for (const issue of toCreate) {
                    try {
                        spinner.start(`Creating: ${issue.title}...`)
                        if (!isDryRun) {
                            const result = await seeder.createIssue(issue, ...usernameRepo)
                            spinner.succeed(`Created #${result.number}: ${result.title}`)
                            this.info(`URL: ${result.html_url}\n`)
                        } else {
                            spinner.info(`Dry run: Issue ${logger(issue.title, ['cyan', 'italic'])} would be created.`)
                        }
                        created++

                        // Rate limiting: wait 1 second between requests
                        await wait(1000)
                    } catch (error: any) {
                        this.error(`ERROR: Failed to create Issue: ${logger(issue.title, ['cyan', 'italic'])}`)
                        this.error(`ERROR: ${error.message}\n`)
                        failed++
                    }
                }

                spinner.succeed(`All ${toCreate.length} issues processed.`)

                // Summary
                Logger.log([
                    ['=========================', 'white'],
                    [`✔ Created: ${created}`, 'white'],
                    [`x Failed: ${failed}`, 'white'],
                    [`> Skipped: ${toSkip.length}`, 'white'],
                    [`☑ Total: ${issues.length}`, 'white'],
                    ['========================', 'white'],
                ], '\n')
                this.newLine()
            }
        } catch (error: any) {
            return void this.error(error.message)
        }
    }
}