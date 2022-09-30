import fs from 'node:fs'
import url from 'node:url'
import path from 'node:path'

const dirname = url.fileURLToPath(new URL('.', import.meta.url))
const packageJSONContent = (await fs.promises.readFile(path.resolve(dirname, '..', 'package.json'))).toString()
export const pkg = JSON.parse(packageJSONContent)
