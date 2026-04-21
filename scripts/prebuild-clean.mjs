import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const targetDir = path.resolve(__dirname, '../../QMSystem/WebPages')

fs.rmSync(targetDir, { recursive: true, force: true })
fs.mkdirSync(targetDir, { recursive: true })

console.log(`[prebuild] cleaned: ${targetDir}`)
