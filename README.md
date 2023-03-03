WDIO ChromeDriver Service
=========================

This service helps you to run ChromeDriver seamlessly when running tests with the [WDIO testrunner](http://webdriver.io/guide/testrunner/gettingstarted.html). It uses the [chromedriver](https://www.npmjs.com/package/chromedriver) NPM package that wraps ChromeDriver for you.

__Note:__ this service does not require a Selenium server, but uses ChromeDriver to communicate with the browser directly.

Obviously, it only supports:

```js
capabilities: [{
    browserName: 'chrome'
}]
```

## Installation

The easiest way is to keep `wdio-chromedriver-service` as a devDependency in your `package.json`.

```json
{
  "devDependencies": {
    "wdio-chromedriver-service": "^8.0.0"
  }
}
```

You can do it by:

```bash
npm install wdio-chromedriver-service --save-dev
```

__Note:__ You have to install [chromedriver](https://www.npmjs.com/package/chromedriver) separately, as it's a peerDependency of this project, and you're free to choose which version to use. Depending of which version of Chrome you have installed on your system you should install the same version of `chromedriver`. Install it using:

```bash
npm install chromedriver --save-dev
# if you have Chrome 104 installed on your machine do
npm install chromedriver@104 --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here](https://webdriver.io/docs/gettingstarted).

## Configuration

By design, only Google Chrome is available (when installed on the host system). In order to use the service you need to add `chromedriver` to your service array:

```js
// wdio.conf.js
export.config = {
  outputDir: 'all-logs',
  // ...
  services: [
    ['chromedriver', {
        logFileName: 'wdio-chromedriver.log', // default
        outputDir: 'driver-logs', // overwrites the config.outputDir
        args: ['--silent']
    }]
  ],
  // ...
};
```

## Options

### port
The port on which the driver should run on

Example: 9515

Type: `number`

### path
The path on which the driver should run on

Example: `/`

Type: `string`

### protocol
The protocol on which the driver should use

Example: `http`

Type: `string`

### hostname
The protocol on which the driver should use

Example: `localhost`

Type: `string`

### pollTimeout
The startup timeout in ms, it checks if the port is open before starting ChromeDriver and then checks again if the it is closed after starting it.

Example: `10000`

Type: `number`

### outputDir
The path where the output of the ChromeDriver server should be stored (uses the config.outputDir by default when not set).

Example: `driver-logs`

Type: `string`

### logFileName
The name of the log file to be written in `outputDir`.

Example: `wdio-chromedriver.log`

Type: `string`

### chromedriverCustomPath
To use a custom chromedriver different than the one installed through the "chromedriver npm module", provide the path.

Example: `/path/to/chromedriver` (Linux / MacOS), `./chromedriver.exe` or `d:/driver/chromedriver.exe` (Windows)

Type: `string`

---

For more information on WebdriverIO see the [homepage](https://webdriver.io).
