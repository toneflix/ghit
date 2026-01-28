import { Command } from '@h3ravel/musket'
import { clearAuth } from 'src/Github'
import { useCommand } from '../hooks'
import { wait } from '../helpers'

export class LogoutCommand extends Command {
    protected signature = 'logout'
    protected description = 'Log out of Ghit CLI'

    async handle () {
        const [_, setCommand] = useCommand()
        setCommand(this)

        const spinner = this.spinner('Logging out...').start()

        try {
            // Clear stored login details
            await wait(1000, () => clearAuth())
            spinner.succeed('Logged out successfully')
        } catch (error: any) {
            spinner.fail('Logout failed')
            this.error('An error occurred during logout: ' + error.message)
        }

        this.newLine()
    }
}