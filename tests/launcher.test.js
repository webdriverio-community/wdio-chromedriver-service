import path from 'path'
import fs from 'fs-extra'
import ChromeDriver from 'chromedriver'
import ChromeDriverLauncher from '../src/launcher'

jest.mock('fs-extra', () => ({
    createWriteStream: jest.fn(),
    ensureFileSync: jest.fn()
}))

describe('ChromeDriverLauncher launcher', () => {
    beforeEach(() => {
        ChromeDriver.start.mockClear()
    })

    describe('onPrepare', () => {
        test('should set correct config properties', async () => {
            const Launcher = new ChromeDriverLauncher()
            Launcher._redirectLogStream = jest.fn()

            const config = {
                chromeDriverLogs: './',
                chromeDriverArgs: ['--port=9515', '--url-base=\'/\'']
            }

            await Launcher.onPrepare(config)

            expect(Launcher.chromeDriverLogs).toBe(config.chromeDriverLogs)
            expect(Launcher.chromeDriverArgs).toEqual(config.chromeDriverArgs)
        })

        test('should set correct chromeDriverArgs', async () => {
            const Launcher = new ChromeDriverLauncher()
            Launcher._redirectLogStream = jest.fn()

            const config = {
                port: 9515,
                path: '/'
            }

            await Launcher.onPrepare(config)

            expect(Launcher.chromeDriverArgs).toEqual([`--port=${config.port}`, `--url-base=${config.path}`])
        })

        test('should set correct config properties when empty', async () => {
            const Launcher = new ChromeDriverLauncher()
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare({})

            expect(Launcher.chromeDriverArgs).toBeUndefined
        })

        test('should call ChromeDriver start', async () => {
            const Launcher = new ChromeDriverLauncher()
            Launcher._redirectLogStream = jest.fn()

            const config = {
                chromeDriverLogs: './',
                chromeDriverArgs: ['--port=9515']
            }

            await Launcher.onPrepare(config)

            expect(ChromeDriver.start.mock.calls[0][0]).toBe(config.chromeDriverArgs)
            expect(Launcher._redirectLogStream).toBeCalled()
        })

        test('should not output the log file', async () => {
            const Launcher = new ChromeDriverLauncher()
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare({})

            expect(Launcher._redirectLogStream).not.toBeCalled()
        })
    })

    describe('onComplete', () => {
        test('should call ChromeDriver.stop', async () => {
            const Launcher = new ChromeDriverLauncher()
            Launcher._redirectLogStream = jest.fn()

            await Launcher.onPrepare({})

            Launcher.onComplete()

            expect(ChromeDriver.stop).toBeCalled()
        })

        test('should not call process.kill', () => {
            const Launcher = new ChromeDriverLauncher()
            Launcher.onComplete()

            expect(Launcher.process).toBeFalsy()
        })
    })

    describe('_redirectLogStream', () => {
        test('should write output to file', async () => {
            const Launcher = new ChromeDriverLauncher()

            await Launcher.onPrepare({
                chromeDriverLogs: './',
                chromeDriverArgs: ['--port=9515']
            })

            expect(fs.createWriteStream.mock.calls[0][0]).toBe(path.join(process.cwd(), 'ChromeDriver.txt'))
            expect(Launcher.process.stdout.pipe).toBeCalled()
            expect(Launcher.process.stderr.pipe).toBeCalled()
        })
    })
})
