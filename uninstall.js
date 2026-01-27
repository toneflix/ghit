import { homedir } from 'node:os'
import path from 'node:path'
import { rmSync } from 'node:fs'

(async function () {
    const cacheDir = path.join(homedir(), '.grithub')
    rmSync(cacheDir, { recursive: true, force: true })
})()