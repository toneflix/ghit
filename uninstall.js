import { homedir } from 'node:os'
import path from 'node:path'
import { rmSync } from 'node:fs'

(async function () {
    try {
        const cacheDir = path.join(homedir(), '.grithub')
        rmSync(cacheDir, { recursive: true, force: true })
        rmSync('.grithub', { recursive: true, force: true })
    } catch {
        /** */
    }
})()