import path from 'path'
import fs from 'fs-extra'
import { spawn } from 'child_process'
import tcpPortUsed from 'tcp-port-used'

import ChromeDriverLauncher from '../src/launcher'

jest.mock('child_process', () => {
    const stream = {}
    stream.pipe = jest.fn().mockReturnValue(stream)
    stream.on = jest.fn().mockReturnValue(stream)
    return {
        spawn: jest.fn().mockReturnValue({
            stdout: stream,
            stderr: stream,
            kill: jest.fn()
        })
    }
})

let config, options, capabilities, multiremoteCaps

describe('ChromeDriverLauncher launcher', () => {
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
        jest.clearAllMocks()
    })

    describe('onPrepare', () => {
        test('should set correct starting options', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(spawn.mock.calls[0][0]).toEqual('/some/local/chromedriver/path')
            expect(spawn.mock.calls[0][1]).toEqual(['--port=9515', '--url-base=/'])
        })

        it('should fallback to global chromedriver', async () => {
            fs.existsSync.mockReturnValueOnce(false)
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(spawn.mock.calls[0][0]).toEqual('chromedriver')
        })

        test('should set (and overwrite config.outputDir) outputDir when passed in the options', async () => {
            options.outputDir = 'options-outputdir'
            config.outputDir = 'config-outputdir'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.outputDir).toEqual('options-outputdir')
        })

        test('should set path when passed in the options', async () => {
            options.path = 'options-path'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.capabilities).toEqual([
                {
                    browserName: 'chrome',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 9515,
                    path: 'options-path'
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        test('should set port when passed in the options', async () => {
            options.port = 7676
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.capabilities).toEqual([
                {
                    browserName: 'chrome',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 7676,
                    path: '/'
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        test('should set protocol when passed in the options', async () => {
            options.protocol = 'https'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.capabilities).toEqual([
                {
                    browserName: 'chrome',
                    protocol: 'https',
                    hostname: 'localhost',
                    port: 9515,
                    path: '/'
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        test('should set hostname when passed in the options', async () => {
            options.hostname = 'dummy'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.capabilities).toEqual([
                {
                    browserName: 'chrome',
                    protocol: 'http',
                    hostname: 'dummy',
                    port: 9515,
                    path: '/'
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        test('should set capabilities', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.capabilities).toEqual([
                {
                    browserName: 'chrome',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 9515,
                    path: '/'
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        test('should set capabilities when using multiremote', async () => {
            const launcher = new ChromeDriverLauncher(options, multiremoteCaps, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.capabilities).toEqual({
                myCustomChromeBrowser: {
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 9515,
                    path: '/',
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

        test('should set capabilities when the browserName is not lowercase', async () => {
            capabilities.map(cap => {
                if (cap.browserName === 'chrome') {
                    cap.browserName = 'Chrome'
                }
            })
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.capabilities).toEqual([
                {
                    browserName: 'Chrome',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 9515,
                    path: '/'
                },
                {
                    browserName: 'firefox'
                }
            ])
        })

        test('should set correct config properties', async () => {
            config.outputDir = 'dummy'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.outputDir).toEqual('dummy')
        })

        test('should set correct port and path', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.args).toEqual(['--port=9515', '--url-base=/'])
        })

        test('should set correct args', async () => {
            options.args = ['--silent']
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher.args).toEqual(['--silent', '--port=9515', '--url-base=/'])
        })

        test('should throw if the argument "--port" is passed', async () => {
            options.args = ['--port=9616']
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await expect(launcher.onPrepare()).rejects.toThrow(new Error('Argument "--port" already exists'))
        })

        test('should throw if port is not free', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            tcpPortUsed.waitUntilFree.mockRejectedValueOnce(new Error('timeout'))
            const err = await launcher.onPrepare().catch((err) => err)
            expect(err.message).toContain('Please check if port 9515 is in use!')
        })

        test('should throw if Chromedriver fails to start', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            tcpPortUsed.waitUntilUsed.mockRejectedValueOnce(new Error('timeout'))
            const err = await launcher.onPrepare().catch((err) => err)
            expect(err.message).toContain('Chromedriver failed to start.')
        })

        test('should throw if the argument "--url-base" is passed', async () => {
            options.args = ['--url-base=/dummy']
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await expect(launcher.onPrepare()).rejects.toThrow(new Error('Argument "--url-base" already exists'))
        })

        test('should set correct config properties when empty', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare({})

            expect(launcher.args).toBeUndefined
        })

        test('should call ChromeDriver start', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(spawn.mock.calls[0][1]).toEqual(['--port=9515', '--url-base=/'])
        })

        test('should not output the log file', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare({})

            expect(launcher._redirectLogStream).not.toBeCalled()
        })

        test('should output the log file', async () => {
            options.outputDir = 'dummy'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare()

            expect(launcher._redirectLogStream).toBeCalled()
        })
    })

    describe('onComplete', () => {
        test('should call ChromeDriver.stop', async () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()

            await launcher.onPrepare({})

            launcher.onComplete()

            expect(launcher.process.kill).toBeCalled()
        })

        test('should not call process.kill', () => {
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher.onComplete()

            expect(launcher.process).toBeFalsy()
        })
    })

    describe('_redirectLogStream', () => {
        test('should write output to file', async () => {
            config.outputDir = 'dummy'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)

            await launcher.onPrepare()

            expect(fs.createWriteStream.mock.calls[0][0]).toBe(path.join(process.cwd(), 'dummy', 'wdio-chromedriver.log'))
            expect(launcher.process.stdout.pipe).toBeCalled()
            expect(launcher.process.stderr.pipe).toBeCalled()
        })
    })

    describe('custom chromedriver Path', () => {
        test('should select custom chromedriver path "chromedriver.exe"', async () => {
            options.chromedriverCustomPath = 'chromedriver.exe'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()
            await launcher.onPrepare()
            expect(spawn).toBeCalledWith(
                path.resolve(options.chromedriverCustomPath),
                [ '--port=9515', '--url-base=/' ]
            )
        })

        test('should select custom chromedriver path "c:\\chromedriver.exe"', async () => {
            options.chromedriverCustomPath = 'c:\\chromedriver.exe'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()
            await launcher.onPrepare()
            expect(spawn).toBeCalledWith(
                path.resolve(options.chromedriverCustomPath),
                [ '--port=9515', '--url-base=/' ]
            )
        })

        test('should select custom chromedriver path "./chromedriver.exe"', async () => {
            options.chromedriverCustomPath = './chromedriver.exe'
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()
            await launcher.onPrepare()
            expect(spawn).toBeCalledWith(
                path.resolve(options.chromedriverCustomPath),
                [ '--port=9515', '--url-base=/' ]
            )
        })

        test('should select default chromedriver path if no custom path provided"', async () => {
            options.chromedriverCustomPath = undefined
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            launcher._redirectLogStream = jest.fn()
            await launcher.onPrepare()
            expect(spawn).toBeCalledWith(
                '/some/local/chromedriver/path',
                [ '--port=9515', '--url-base=/' ]
            )
        })

        test('should throw if chromedriver not installed and no custom path provided"', async () => {
            jest.mock('chromedriver', () => { throw new Error('not found') })
            delete options.chromedriverCustomPath
            const launcher = new ChromeDriverLauncher(options, capabilities, config)
            const err = await launcher.onPrepare().catch((err) => err)
            expect(err.name).toBe('SevereServiceError')
            expect(err.message).toContain('not found')
        })
    })
})
