import fs from 'fs-extra'
import path from 'path'
import { editor } from '@inquirer/prompts'
import { inputDir } from './workspace.js'

const getArgFile = () => {
  const index = process.argv.findIndex(v => v === '--file' || v === '-f')
  if (index === -1) return null
  return process.argv[index + 1] || null
}

export const readInputCode = async () => {
  const file = getArgFile()

  if (file) {
    const full = path.resolve(process.cwd(), file)
    const code = await fs.readFile(full, 'utf8')
    const target = path.join(inputDir, path.basename(file))
    await fs.writeFile(target, code)
    return {
      code,
      source: full
    }
  }

  const code = await editor({
    message: 'Paste kode scraper kamu, lalu simpan dan tutup editor'
  })

  const target = path.join(inputDir, `scraper-${Date.now()}.txt`)
  await fs.writeFile(target, code)

  return {
    code,
    source: target
  }
}