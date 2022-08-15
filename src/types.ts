export interface ServiceOptions {
    /**
     * The port on which the driver should run on
     */
    port?: number
    /**
     * The path on which the driver should run on
     */
    path?: string
    /**
     * The protocol on which the driver should use
     */
    protocol?: 'http' | 'https'
    /**
     * The protocol on which the driver should use
     */
    hostname?: string
    /**
     * The path where the output of the ChromeDriver server should be stored (uses the config.outputDir by default when not set).
     */
    outputDir?: string
    /**
     * The name of the log file to be written in `outputDir`.
     */
    logFileName?: string
    /**
     * To use a custome chromedriver different than the one installed through "chromedriver npm module", provide the path.
     */
    chromedriverCustomPath?: string
    /**
     * Additional command line args passed into the process
     */
    args?: string[]
}
