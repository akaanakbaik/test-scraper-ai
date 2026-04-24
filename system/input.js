import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import boxen from 'boxen'
import { input, confirm } from '@inquirer/prompts'
import { execa } from 'execa'
import { inputDir } from './workspace.js'
import { isDebug } from './debug.js'

const getArgFile = () => {
  const index = process.argv.findIndex(v => v === '--file' || v === '-f')
  if (index === -1) return null
  return process.argv[index + 1] || null
}

const runNano = async file => {
  await execa('nano', [file], {
    stdio: 'inherit',
    reject: false
  })
}

const readFileSafe = async file => {
  const full = path.resolve(process.cwd(), file)

  if (!(await fs.pathExists(full))) {
    throw new Error(`File tidak ditemukan: ${full}`)
  }

  const stat = await fs.stat(full)

  if (!stat.isFile()) {
    throw new Error(`Path bukan file: ${full}`)
  }

  const code = await fs.readFile(full, 'utf8')

  if (!code.trim()) {
    throw new Error(`File kosong: ${full}`)
  }

  const target = path.join(inputDir, path.basename(file))
  await fs.copy(full, target)

  return {
    code,
    source: full
  }
}

export const readInputCode = async () => {
  const file = getArgFile()

  if (file) {
    return await readFileSafe(file)
  }

  console.log(boxen([
    chalk.yellow.bold('Mode paste langsung dinonaktifkan agar tidak bug di terminal.'),
    '',
    chalk.white('Cara yang disarankan:'),
    chalk.cyan('nano scraper.js'),
    chalk.cyan('npm start -- --file scraper.js'),
    '',
    chalk.white('Atau untuk Python:'),
    chalk.cyan('nano scraper.py'),
    chalk.cyan('npm start -- --file scraper.py')
  ].join('\n'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'yellow'
  }))

  const createNow = await confirm({
    message: 'Mau buat/edit file scraper sekarang dengan nano?',
    default: true
  })

  let fileName = await input({
    message: 'Nama file scraper',
    default: 'scraper.js',
    validate: value => {
      if (!value.trim()) return 'Nama file tidak boleh kosong'
      if (!/\.(js|mjs|cjs|py)$/i.test(value)) return 'Gunakan ekstensi .js, .mjs, .cjs, atau .py'
      return true
    }
  })

  fileName = fileName.trim()
  const full = path.resolve(process.cwd(), fileName)

  if (createNow) {
    await runNano(full)
  }

  if (isDebug()) {
    console.log(chalk.gray(`Membaca file: ${full}`))
  }

  return await readFileSafe(full)
}