import { Options, Capabilities } from "@wdio/types";

export declare interface ChromedriverServiceOptions {
    protocol?: string;
    hostname?: string;
    port?: string;
    path?: string;
    outputDir?: string;
    logFileName?: string;
    args?: string[];
    chromedriverCustomPath?: string;
}

export declare class ChromedriverServiceLauncher {
    constructor(
        options: ChromedriverServiceOptions,
        capabilities: Capabilities.Capabilities,
        config: Omit<Options.Testrunner, "capabilities">
    );

    onComplete(): void;
    onPrepare(): void;
}

export default class ChromeDriverService {}
export declare const launcher: typeof ChromedriverServiceLauncher;
