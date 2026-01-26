import { IIssue, IIssueFile, IRepoEntry } from 'src/Contracts/Interfaces'
import { logger, wait } from 'src/helpers'

import { Command } from '@h3ravel/musket'
import { IssuesSeeder } from 'src/github/issues-seeder'
import { Logger } from '@h3ravel/shared'
import { diffText } from 'src/utils/renderer'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { read } from 'src/db'
import { useCommand } from 'src/hooks'

export class IssuesUpdateCommand extends Command {
    protected signature = `issues:update
        {directory=issues : The directory containing issue files to seed from.}
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
            const usernameRepo = (repo.full_name.split('/') ?? ['', '']) as [string, string]
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

            // Separate issues into those to update and those to skip
            const toSkip: IIssueFile[] = []
            const toUpdate: { issue: IIssueFile, existingIssue: IIssue }[] = []

            issues.forEach(issue => {
                if (existingIssuePaths.has(issue.filePath)) {
                    const existingIssue = existingIssues.find(ei => seeder.getFilePath(ei.body ?? '') === issue.filePath)!
                    toUpdate.push({ issue, existingIssue })
                } else {
                    toSkip.push(issue)
                }
            })

            // Display summary
            if (toSkip.length > 0) {
                this.newLine().info('INFO: Issues to SKIP (not created):')
                toSkip.forEach((issue, index) => {
                    logger(`${index + 1}. ${issue.title}`, 'white', !0)
                    logger(`   File: ${issue.filePath} (${issue.type})`, 'white', !0)
                })
            }


            if (toUpdate.length > 0) {
                this.newLine().info('INFO: Issues to UPDATE:').newLine()
                toUpdate.forEach(({ issue, existingIssue }) => {
                    logger(`  >  ${diffText(issue.title, existingIssue.title)}`, 'white', !0)
                    logger(`     Existing: #${existingIssue.number} (${existingIssue.state})`, 'white', !0)
                })
                this.newLine()
            } else {
                this.newLine().success('INFO: No issues to update. All issues are up to date').newLine()
                Logger.log([['☑ Total files:', 'white'], [issues.length.toString(), 'blue']], ' ')
                Logger.log([['> Skipped:', 'white'], [toSkip.length.toString(), 'blue']], ' ')
                Logger.log([['± To update:', 'white'], [toUpdate.length.toString(), 'blue']], ' ')

                return void this.newLine()
            }

            // Confirm before proceeding
            Logger.log([
                ['⚠️ ', 'white'],
                [' CONFIRM ', 'bgYellow'],
                ['This will update', 'yellow'],
                [toUpdate.length.toString(), 'blue'],
                ['existing issues on GitHub.', 'yellow']
            ], ' ')

            if (toSkip.length > 0) {
                this.info(`(Skipping ${toSkip.length} existing issues)`)
            }

            const proceed = await this.confirm(`Do you want to proceed?${isDryRun ? ' (Dry Run - No changes will be made)' : ''}`)

            if (proceed) {
                this.newLine()

                // Update issues
                let updated = 0
                let failed = 0

                const spinner = this.spinner('Updating issues...').start()

                for (const { issue, existingIssue } of toUpdate) {
                    try {
                        spinner.start(`Updating: ${issue.title}...`)
                        if (!isDryRun) {
                            const result = await seeder.updateIssue(issue, existingIssue, ...usernameRepo)
                            spinner.succeed(`Updated #${result.number}: ${result.title}`)
                            this.info(`URL: ${result.html_url}\n`)
                        } else {
                            spinner.info(`Dry run: Issue ${logger(issue.title, ['cyan', 'italic'])} would be updated.`)
                        }
                        updated++

                        // Rate limiting: wait 1 second between requests
                        await wait(1000)
                    } catch (error: any) {
                        this.error(`ERROR: Failed to update Issue: ${logger(issue.title, ['cyan', 'italic'])}`)
                        this.error(`ERROR: ${error.message}\n`)
                        failed++
                    }
                }

                spinner.succeed(`All ${toUpdate.length} issues processed.`)

                // Summary
                Logger.log([
                    ['=========================', 'white'],
                    [`✔ Updated: ${updated}`, 'white'],
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