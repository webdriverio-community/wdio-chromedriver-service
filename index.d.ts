import { Options, Services, Capabilities } from "@wdio/types";
declare class ChromedriverServiceLauncher {
    constructor(
        options: Services.ServiceOption,
        capabilities: Capabilities.Capabilities,
        config: Omit<Options.Testrunner, "capabilities">
    );

    onComplete(): void;
    onPrepare(): void;
}
export default class ChromeDriverService {}
export declare const launcher: ChromedriverServiceLauncher;
