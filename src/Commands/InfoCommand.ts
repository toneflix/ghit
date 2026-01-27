import { findCLIPackageJson, wait } from 'src/helpers'
import { init, read, useDbPath } from 'src/db'

import { Command } from '@h3ravel/musket'
import { IUser } from 'src/Contracts/Interfaces'
import { Logger } from '@h3ravel/shared'
import Table from 'cli-table3'
import { createRequire } from 'module'
import { dataRenderer } from 'src/utils/renderer'
import os from 'os'
import path from 'path'
import { useCommand } from 'src/hooks'

export class InfoCommand extends Command {
    protected signature = 'info'
    protected description = 'Display application runtime information.'
    async handle () {
        let pkg = { version: 'unknown', dependencies: {} }
        const user = read<IUser>('user')
        const pkgPath = findCLIPackageJson()
        const require = createRequire(import.meta.url)
        const [_, setCommand] = useCommand()
        const [dbPath] = useDbPath()
        setCommand(this)
        init()

        const spinner = this.spinner('Gathering application information...\n').start()

        if (pkgPath) {
            try {
                pkg = require(pkgPath)
            } catch { /** */ }
        }

        wait(500, () => {
            spinner.succeed('Application Information Loaded.\n')

            const out = new Table()
            out.push(
                { 'App Version': pkg.version },
                { 'Platform': `${os.platform()} ${os.arch()} (${os.release()})` },
                { 'CPUs': os.cpus().length },
                { 'Host': `${os.userInfo().username}@${os.hostname()}` },
                { 'Memory': `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB / ${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB` },
                { 'Database Path': path.join(dbPath, 'app.db') },
                { 'Github User': user ? `${user.login} (ID: ${user.id})` : 'Not logged in' },
                { 'Default Repo': read('default_repo')?.full_name || 'Not set' },
            )

            console.log(out.toString())
            Logger.log('\nDependencies:', 'yellow')
            Logger.log(Object.keys(pkg.dependencies).map(dep => `${dep}`).join(', '), 'green')
            this.newLine()
        })

    }
}