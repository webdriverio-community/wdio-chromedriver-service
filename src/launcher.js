import fs from 'fs-extra'
import ChromeDriver from 'chromedriver'

import getFilePath from './utils/getFilePath'

const DEFAULT_LOG_FILENAME = 'ChromeDriver.txt'

export default class ChromeDriverLauncher {
    constructor () {
        this.chromeDriverLogs = null
        this.chromeDriverArgs = null
        this.logToStdout = false

        return this
    }

    async onPrepare (config) {
        this.chromeDriverArgs = config.chromeDriverArgs
        this.chromeDriverLogs = config.chromeDriverLogs
        
        this.process = await ChromeDriver.start(this.chromeDriverArgs, true)

        if (typeof this.chromeDriverLogs === 'string') {
            this._redirectLogStream()
        }
    }

    onComplete () {
        ChromeDriver.stop()
    }

    _redirectLogStream () {
        const logFile = getFilePath(this.chromeDriverLogs, DEFAULT_LOG_FILENAME)

        // ensure file & directory exists
        fs.ensureFileSync(logFile)

        const logStream = fs.createWriteStream(logFile, { flags: 'w' })
        this.process.stdout.pipe(logStream)
        this.process.stderr.pipe(logStream)
    }
}
