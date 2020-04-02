import path from 'path'
import fs from 'fs-extra'
import ChromeDriver from 'chromedriver'
import ChromeDriverLauncher from '../src/launcher'

jest.mock('fs-extra', () => ({
    createWriteStream: jest.fn(),
    ensureFileSync: jest.fn()
}))

const pipe = jest.fn()

describe('ChromeDriverLauncher launcher', () => {
    beforeAll(() => {
        ChromeDriver.start = jest.fn().mockReturnValue({
            stdout: { pipe },
            stderr: { pipe },
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('onPrepare', () => {
        test('should set correct starting options', async () => {
            const Launcher = new ChromeDriverLauncher({}, [{ browserName: 'chrome' }, { browserName: 'firefox' }], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(ChromeDriver.start.mock.calls[0][0]).toEqual(['--port=9515', '--url-base=/'])
        })

        test('should set (and overwrite config.outputDir) outputDir when passed in the options', async () => {
            const Launcher = new ChromeDriverLauncher({ outputDir: 'options-outputdir'}, [], { outputDir: 'config-outputdir'})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.outputDir).toEqual('options-outputdir')
        })

        test('should set path when passed in the options', async () => {
            const Launcher = new ChromeDriverLauncher({ path: 'options-path'}, [{ browserName: 'chrome' }, { browserName: 'firefox' }], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.capabilities).toEqual([
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
            const Launcher = new ChromeDriverLauncher({ port: 7676}, [{ browserName: 'chrome' }, { browserName: 'firefox' }], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.capabilities).toEqual([
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
            const Launcher = new ChromeDriverLauncher({ protocol: 'https'}, [{ browserName: 'chrome' }, { browserName: 'firefox' }], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.capabilities).toEqual([
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
            const Launcher = new ChromeDriverLauncher({ hostname: 'dummy'}, [{ browserName: 'chrome' }, { browserName: 'firefox' }], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.capabilities).toEqual([
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

        test('should set correct capabilities', async () => {
            const Launcher = new ChromeDriverLauncher({}, [{ browserName: 'chrome' }, { browserName: 'firefox' }], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.capabilities).toEqual([
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

        test('should set correct capabilities when using multiremote', async () => {
            const Launcher = new ChromeDriverLauncher({}, { myCustomChromeBrowser: { browserName: 'chrome' }, myCustomFirefoxBrowser: { browserName: 'firefox' }}, {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.capabilities).toEqual({
                myCustomChromeBrowser: {
                    browserName: 'chrome',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 9515,
                    path: '/'
                },
                myCustomFirefoxBrowser: {
                    browserName: 'firefox'
                }
            })
        })

        test('should set correct capabilities when the browserName is not lowercase', async () => {
            const Launcher = new ChromeDriverLauncher({}, [{ browserName: 'Chrome' }, { browserName: 'firefox' }], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.capabilities).toEqual([
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
            const Launcher = new ChromeDriverLauncher({}, [], { outputDir: 'dummy'})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.outputDir).toEqual('dummy')
        })

        test('should set correct chromeDriverArgs', async () => {
            const Launcher = new ChromeDriverLauncher({}, [], {})
            Launcher._redirectLogStream = jest.fn()

            const config = {
                port: 9515,
                path: '/'
            }

            await Launcher.onPrepare(config)

            expect(Launcher.chromeDriverArgs).toEqual([`--port=${config.port}`, `--url-base=${config.path}`])
        })

        test('should set correct config properties when empty', async () => {
            const Launcher = new ChromeDriverLauncher({}, [], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare({})

            expect(Launcher.chromeDriverArgs).toBeUndefined
        })

        test('should call ChromeDriver start', async () => {
            const Launcher = new ChromeDriverLauncher({}, [], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(ChromeDriver.start.mock.calls[0][0]).toEqual(['--port=9515', '--url-base=/'])
        })

        test('should map the capabilities', async () => {
            const Launcher = new ChromeDriverLauncher({}, [{ browserName: 'chrome' }, { browserName: 'chrome' }], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.capabilities).toEqual([
                {
                    browserName: 'chrome',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 9515,
                    path: '/'
                },
                {
                    browserName: 'chrome',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 9515,
                    path: '/'
                },
            ])
        })

        test('should map the capabilities using multiremote', async () => {
            const Launcher = new ChromeDriverLauncher({}, { dummy1: { browserName: 'chrome' }, dummy2: { browserName: 'chrome' }  }, {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher.capabilities).toEqual({
                dummy1: {
                    browserName: 'chrome',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 9515,
                    path: '/'
                },
                dummy2: {
                    browserName: 'chrome',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: 9515,
                    path: '/'
                },
            })
        })

        test('should not output the log file', async () => {
            const Launcher = new ChromeDriverLauncher({}, [], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare({})

            expect(Launcher._redirectLogStream).not.toBeCalled()
        })

        test('should output the log file', async () => {
            const Launcher = new ChromeDriverLauncher({ outputDir: 'dummy' }, [], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare()

            expect(Launcher._redirectLogStream).toBeCalled()
        })
    })

    describe('onComplete', () => {
        test('should call ChromeDriver.stop', async () => {
            const Launcher = new ChromeDriverLauncher({}, [], {})
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare({})

            Launcher.onComplete()

            expect(ChromeDriver.stop).toBeCalled()
        })

        test('should not call process.kill', () => {
            const Launcher = new ChromeDriverLauncher({}, [], {})
            Launcher.onComplete()

            expect(Launcher.process).toBeFalsy()
        })
    })

    describe('_redirectLogStream', () => {
        test('should write output to file', async () => {
            const Launcher = new ChromeDriverLauncher({}, [], { outputDir: 'dummy'})

            await Launcher.onPrepare()

            expect(fs.createWriteStream.mock.calls[0][0]).toBe(path.join(process.cwd(), 'dummy', 'chromedriver.log'))
            expect(Launcher.process.stdout.pipe).toBeCalled()
            expect(Launcher.process.stderr.pipe).toBeCalled()
        })
    })
})
