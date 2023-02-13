import path from 'node:path'
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

import fs from 'fs-extra'
import split2 from 'split2'
import logger from '@wdio/logger'
import tcpPortUsed from 'tcp-port-used'
import { SevereServiceError } from 'webdriverio'
import type { Capabilities, Options } from '@wdio/types'

import getFilePath from './utils/getFilePath.js'
import { pkg } from './constants.js'
import type { ServiceOptions } from './types'

const log = logger('chromedriver')

const DEFAULT_LOG_FILENAME = 'wdio-chromedriver.log'
const POLL_INTERVAL = 100
const DEFAULT_POLL_TIMEOUT = 10000
const DEFAULT_CONNECTION = {
    protocol: 'http' as const,
    hostname: 'localhost',
    port: 9515,
    path: '/'
}

const isMultiremote = (obj: Capabilities.Capabilities) => typeof obj === 'object' && !Array.isArray(obj)
const isChrome = (cap: Capabilities.Capabilities) => cap.browserName && cap.browserName.toLowerCase() === 'chrome'

export default class ChromeDriverLauncher {
    protected options: { protocol: 'http' | 'https', hostname: string, port: number, path: string, pollTimeout: number }
    protected outputDir?: string
    protected logFileName: string
    protected capabilities: Capabilities.Capabilities
    protected args: string[]
    protected chromedriverCustomPath?: string
    private process?: ChildProcessWithoutNullStreams

    constructor(
        options: ServiceOptions,
        capabilities: Capabilities.Capabilities,
        config: Options.Testrunner
    ) {
        log.info(`Initiate Chromedriver Launcher (v${pkg.version})`)
        this.options = {
            protocol: options.protocol || DEFAULT_CONNECTION.protocol,
            hostname: options.hostname || DEFAULT_CONNECTION.hostname,
            port: options.port || DEFAULT_CONNECTION.port,
            path: options.path || DEFAULT_CONNECTION.path,
            pollTimeout: options.pollTimeout || DEFAULT_POLL_TIMEOUT
        }

        this.outputDir = options.outputDir || config.outputDir
        this.logFileName = options.logFileName || DEFAULT_LOG_FILENAME
        this.capabilities = capabilities
        this.args = options.args || []
        this.chromedriverCustomPath = options.chromedriverCustomPath
    }

    async onPrepare() {
        this.args.forEach(argument => {
            if (argument.includes('--port')) {
                throw new Error('Argument "--port" already exists')
            }
            if (argument.includes('--url-base')) {
                throw new Error('Argument "--url-base" already exists')
            }
        })

        this.args.push(`--port=${this.options.port}`)
        this.args.push(`--url-base=${this.options.path}`)

        /**
         * update capability connection options to connect
         * to chromedriver
         */
        this._mapCapabilities()

        let command = this.chromedriverCustomPath
            ? path.resolve(this.chromedriverCustomPath)
            : await this._getChromedriverPath()
        log.info(`Start Chromedriver (${command}) with args ${this.args.join(' ')}`)
        if (!fs.existsSync(command)) {
            log.warn('Could not find chromedriver in default path: ', command)
            log.warn('Falling back to use global chromedriver bin')
            command = process && process.platform === 'win32' ? 'chromedriver.exe' : 'chromedriver'
        }

        /**
         * wait for port to be available before starting Chromedriver
         */
        try {
            await tcpPortUsed.waitUntilFree(this.options.port, POLL_INTERVAL, this.options.pollTimeout)
        } catch (err) {
            throw new SevereServiceError(
                `Couldn't start Chromedriver: ${err.message}\n` +
                `Please check if port ${this.options.port} is in use!`
            )
        }

        this.process = spawn(command, this.args)

        if (typeof this.outputDir === 'string') {
            await this._redirectLogStream(this.process, this.outputDir)
        } else {
            this.process.stdout.pipe(split2()).on('data', log.info)
            this.process.stderr.pipe(split2()).on('data', log.warn)
        }

        try {
            await tcpPortUsed.waitUntilUsed(this.options.port, POLL_INTERVAL, this.options.pollTimeout)
        } catch (err) {
            throw new SevereServiceError(
                `Couldn't start Chromedriver: ${err.message}\n` +
                'Chromedriver failed to start.')
        }

        process.on('exit', this.onComplete.bind(this))
        process.on('SIGINT', this.onComplete.bind(this))
        process.on('uncaughtException', this.onComplete.bind(this))
    }

    onComplete() {
        if (this.process) {
            this.process.kill()
        }
    }

    async _redirectLogStream(process: ChildProcessWithoutNullStreams, outputDir: string) {
        const logFile = getFilePath(outputDir, this.logFileName)

        // ensure file & directory exists
        await fs.ensureFile(logFile)

        const logStream = fs.createWriteStream(logFile, { flags: 'w' })
        process.stdout.pipe(logStream)
        process.stderr.pipe(logStream)
    }

    _mapCapabilities() {
        if (isMultiremote(this.capabilities)) {
            for (const cap in this.capabilities) {
                if (isChrome((this.capabilities as Capabilities.MultiRemoteCapabilities)[cap].capabilities as Capabilities.Capabilities)) {
                    Object.assign((this.capabilities as Capabilities.MultiRemoteCapabilities)[cap], this.options)
                }
            }
        } else {
            for (const cap of (this.capabilities as Capabilities.DesiredCapabilities[])) {
                if (isChrome(cap)) {
                    Object.assign(cap, this.options)
                }
            }
        }
    }

    async _getChromedriverPath() {
        try {
            return (await import('chromedriver')).path
        } catch (e) {
            log.error('Can\'t load chromedriver, please define "chromedriverCustomPath" property or install dependency via "npm install chromedriver --save-dev"')
            throw new SevereServiceError(e.message)
        }
    }
}
