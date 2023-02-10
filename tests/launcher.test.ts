import path from 'node:path'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest'
import fs from 'fs-extra'
import tcpPortUsed from 'tcp-port-used'

import ChromeDriverLauncher from '../src/launcher.js'
const require = createRequire(import.meta.url)
const { launcher: CJSChromeLauncher } = require('../build/cjs/index.js')

vi.mock('tcp-port-used')
vi.mock('chromedriver')
vi.mock('fs-extra')

vi.mock('child_process', () => {
    const stream: any = {}
    stream.pipe = vi.fn().mockReturnValue(stream)
    stream.on = vi.fn().mockReturnValue(stream)
    return {
        spawn: vi.fn().mockReturnValue({
            stdout: stream,
            stderr: stream,
            kill: vi.fn()
        })
    }
})

let config, options, capabilities, multiremoteCaps

describe('ChromeDriverLauncher launcher', () => {
    
    const defaultOptions = {
        defaultLogFileName: 'wdio-chromedriver.log',
        defaultProtocol: 'http',
        defaultHostname: 'localhost',
        defaultPort: 9515,
        defaultPath: '/',
        defaultPollTimeOut: 10000,
    }

    beforeEach(() => {
        config = {}
        options = {}
        capabilities = [
            { browserName: 'chrome' },
            { browserName: 'firefox' }
        ]
        multiremoteCaps = {
            myCustomChromeBrowser: {
                capabilities: {
                    browserName: 'chrome'
                }
            },
            myCustomFirefoxBrowser: {
                capabilities: {
                    browserName: 'firefox'
                }
            },
            myCustomAppium: {
                capabilities: {
                    'platformName': 'android',
                }
            }
        }
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('onPrepare', () => {
        it('should set correct starting options', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(vi.mocked(spawn).mock.calls[0][0]).toEqual('/some/local/chromedriver/path')
            expect(vi.mocked(spawn).mock.calls[0][1]).toEqual(['--port=9515', '--url-base=/'])
        })

        it('should be able to do the same when using CJS module', async () => {
            const launcher = new CJSChromeLauncher(options, capabilities, config)
            expect(typeof launcher.onPrepare).toBe('function')
        })

        it('should fallback to global chromedriver', async () => {
            vi.mocked(fs.existsSync).mockReturnValueOnce(false)
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(vi.mocked(spawn).mock.calls[0][0]).toEqual('chromedriver')
        })

        it('should set (and overwrite config.outputDir) outputDir when passed in the options', async () => {
            options.outputDir = 'options-outputdir'
            config.outputDir = 'config-outputdir'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['outputDir']).toEqual('options-outputdir')
        })

        it('should set path when passed in the options', async () => {
            options.path = 'options-path'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['capabilities']).toEqual([
                {
                    browserName: 'chrome',
                    protocol: defaultOptions.defaultProtocol,
                    hostname: defaultOptions.defaultHostname,
                    port: defaultOptions.defaultPort,
                    pollTimeout:defaultOptions.defaultPollTimeOut,
                    path: 'options-path'
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        it('should set port when passed in the options', async () => {
            options.port = 7676
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['capabilities']).toEqual([
                {
                    browserName: 'chrome',
                    protocol: defaultOptions.defaultProtocol,
                    hostname: defaultOptions.defaultHostname,
                    port: 7676,
                    pollTimeout:defaultOptions.defaultPollTimeOut,
                    path: defaultOptions.defaultPath
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        it('should set protocol when passed in the options', async () => {
            options.protocol = 'https'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['capabilities']).toEqual([
                {
                    browserName: 'chrome',
                    protocol: 'https',
                    hostname: defaultOptions.defaultHostname,
                    port: defaultOptions.defaultPort,
                    pollTimeout:defaultOptions.defaultPollTimeOut,
                    path: defaultOptions.defaultPath
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        it('should set hostname when passed in the options', async () => {
            options.hostname = 'dummy'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['capabilities']).toEqual([
                {
                    browserName: 'chrome',
                    protocol: defaultOptions.defaultProtocol,
                    hostname: 'dummy',
                    port: defaultOptions.defaultPort,
                    pollTimeout:defaultOptions.defaultPollTimeOut,
                    path: defaultOptions.defaultPath
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        it('should set pollTimeout when passed in the options', async () => {
            options.pollTimeout = 15000
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['capabilities']).toEqual([
                {
                    browserName: 'chrome',
                    protocol: defaultOptions.defaultProtocol,
                    hostname: defaultOptions.defaultHostname,
                    port: defaultOptions.defaultPort,
                    pollTimeout: 15000,
                    path: defaultOptions.defaultPath
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        it('should set capabilities', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['capabilities']).toEqual([
                {
                    browserName: 'chrome',
                    protocol: defaultOptions.defaultProtocol,
                    hostname: defaultOptions.defaultHostname,
                    port: defaultOptions.defaultPort,
                    pollTimeout:defaultOptions.defaultPollTimeOut,
                    path: defaultOptions.defaultPath
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        it('should set capabilities when using multiremote', async () => {
            const launcher = new ChromeDriverLauncher(options, multiremoteCaps, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['capabilities']).toEqual({
                myCustomChromeBrowser: {
                    protocol: defaultOptions.defaultProtocol,
                    hostname: defaultOptions.defaultHostname,
                    port: defaultOptions.defaultPort,
                    pollTimeout:defaultOptions.defaultPollTimeOut,
                    path: defaultOptions.defaultPath,
                    capabilities: {
                        browserName: 'chrome',
                    }
                },
                myCustomFirefoxBrowser: {
                    capabilities: {
                        browserName: 'firefox'
                    }
                },
                myCustomAppium: {
                    capabilities: {
                        'platformName': 'android',
                    }
                }
            })
        })

        it('should set capabilities when the browserName is not lowercase', async () => {
            capabilities.map(cap => {
                if (cap.browserName === 'chrome') {
                    cap.browserName = 'Chrome'
                }
            })
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['capabilities']).toEqual([
                {
                    browserName: 'Chrome',
                    protocol: defaultOptions.defaultProtocol,
                    hostname: defaultOptions.defaultHostname,
                    port: defaultOptions.defaultPort,
                    pollTimeout:defaultOptions.defaultPollTimeOut,
                    path: defaultOptions.defaultPath
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        it('should set correct config properties', async () => {
            config.outputDir = 'dummy'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['outputDir']).toEqual('dummy')
        })

        it('should set correct port and path', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['args']).toEqual(['--port=9515', '--url-base=/'])
        })

        it('should set correct args', async () => {
            options.args = ['--silent']
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['args']).toEqual(['--silent', '--port=9515', '--url-base=/'])
        })

        it('should throw if the argument "--port" is passed', async () => {
            options.args = ['--port=9616']
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await expect(launcher.onPrepare()).rejects.toThrow(new Error('Argument "--port" already exists'))
        })

        it('should throw if port is not free', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            vi.mocked(tcpPortUsed.waitUntilFree).mockRejectedValueOnce(new Error('timeout'))
            const err = await launcher.onPrepare().catch((err) => err)
            expect(err.message).toContain('Please check if port 9515 is in use!')
        })

        it('should throw if Chromedriver fails to start', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            vi.mocked(tcpPortUsed.waitUntilUsed).mockRejectedValueOnce(new Error('timeout'))
            const err = await launcher.onPrepare().catch((err) => err)
            expect(err.message).toContain('Chromedriver failed to start.')
        })

        it('should throw if the argument "--url-base" is passed', async () => {
            options.args = ['--url-base=/dummy']
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await expect(launcher.onPrepare()).rejects.toThrow(new Error('Argument "--url-base" already exists'))
        })

        it('should set correct config properties when empty', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher['args']).toBeUndefined
        })

        it('should call ChromeDriver start', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(vi.mocked(spawn).mock.calls[0][1]).toEqual(['--port=9515', '--url-base=/'])
        })

        it('should not output the log file', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher._redirectLogStream).not.toBeCalled()
        })

        it('should output the log file', async () => {
            options.outputDir = 'dummy'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            expect(launcher._redirectLogStream).toBeCalled()
        })
    })

    describe('onComplete', () => {
        it('should call ChromeDriver.stop', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()

            await launcher.onPrepare()

            launcher.onComplete()

            expect(vi.mocked(launcher['process']!).kill).toBeCalled()
        })

        it('should not call process.kill', () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher.onComplete()

            expect(launcher['process']).toBeFalsy()
        })
    })

    describe('_redirectLogStream', () => {
        it('should write output to file', async () => {
            config.outputDir = 'dummy'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)

            await launcher.onPrepare()

            expect(vi.mocked(fs.createWriteStream).mock.calls[0][0]).toBe(path.join(process.cwd(), 'dummy', 'wdio-chromedriver.log'))
            expect(vi.mocked(launcher['process']!).stdout.pipe).toBeCalled()
            expect(vi.mocked(launcher['process']!).stderr.pipe).toBeCalled()
        })
    })

    describe('custom chromedriver Path', () => {
        it('should select custom chromedriver path "chromedriver.exe"', async () => {
            options.chromedriverCustomPath = 'chromedriver.exe'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()
            await launcher.onPrepare()
            expect(spawn).toBeCalledWith(
                path.resolve(options.chromedriverCustomPath),
                [ '--port=9515', '--url-base=/' ]
            )
        })

        it('should select custom chromedriver path "c:\\chromedriver.exe"', async () => {
            options.chromedriverCustomPath = 'c:\\chromedriver.exe'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()
            await launcher.onPrepare()
            expect(spawn).toBeCalledWith(
                path.resolve(options.chromedriverCustomPath),
                [ '--port=9515', '--url-base=/' ]
            )
        })

        it('should select custom chromedriver path "./chromedriver.exe"', async () => {
            options.chromedriverCustomPath = './chromedriver.exe'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()
            await launcher.onPrepare()
            expect(spawn).toBeCalledWith(
                path.resolve(options.chromedriverCustomPath),
                [ '--port=9515', '--url-base=/' ]
            )
        })

        it('should select default chromedriver path if no custom path provided"', async () => {
            options.chromedriverCustomPath = undefined
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = vi.fn()
            await launcher.onPrepare()
            expect(spawn).toBeCalledWith(
                '/some/local/chromedriver/path',
                [ '--port=9515', '--url-base=/' ]
            )
        })

        /**
         * dynamic changes of mock don't work in vitest
         */
        it.skip('should throw if chromedriver not installed and no custom path provided"', async () => {
            vi.mock('chromedriver', () => { throw new Error('not found') })
            delete options.chromedriverCustomPath
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            const err = await launcher.onPrepare().catch((err) => err)
            expect(err.name).toBe('SevereServiceError')
            expect(err.message).toContain('not found')
        })
    })
})
