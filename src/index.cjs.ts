module.exports = class ChromeService {}
exports.launcher = class CJSChromedriverLauncher {
    private instance?: any

    constructor(options: any, capabilities: any, config: any) {
        this.instance = import('./launcher.js').then((ChromedriverLauncher) => {
            return new ChromedriverLauncher.default(options, capabilities, config)
        })
    }

    async onPrepare () {
        const instance = await this.instance
        return instance.onPrepare()
    }

    async onComplete () {
        const instance = await this.instance
        return instance.onComplete()
    }
}
