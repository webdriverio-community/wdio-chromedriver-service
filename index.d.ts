import { Options, Capabilities } from "@wdio/types";

export declare interface ChromedriverServiceOptions {
    protocol?: string;
    hostname?: string;
    port?: string;
    path?: string;
    pollTimeout?: number;
    outputDir?: string;
    logFileName?: string;
    args?: string[];
    chromedriverCustomPath?: string;
}

export declare class ChromedriverServiceLauncher {
    public chromedriverCustomPath: string;
    public options: Pick<ChromedriverServiceOptions, 'protocol' | 'hostname' | 'port' | 'path' | 'pollTimeout'>;
    public outputDir: string;
    public logFileName: string;
    public capabilities: Capabilities.Capabilities;
    public args: string[];

    constructor(
        options: ChromedriverServiceOptions,
        capabilities: Capabilities.Capabilities,
        config: Omit<Options.Testrunner, "capabilities">
    );

    onComplete(...args: any[]): void;
    onPrepare(...args: any[]): void;
}

export default class ChromeDriverService {}
export declare const launcher: typeof ChromedriverServiceLauncher;
