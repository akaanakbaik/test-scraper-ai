import ora from 'ora'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { generatedDir, logsDir } from '../system/workspace.js'
import { aiGenerate } from '../lib/ai1.js'
import { aiReport } from '../lib/ai2.js'
import { ensureDependencies } from '../runtime/dependency.js'
import { runTest } from '../runtime/runner.js'
import { buildPdf } from '../report/pdf.js'
import { uploadFile } from '../report/upload.js'
import { cleanup } from '../system/cleanup.js'
import { progressStart, progressUpdate, progressStop } from '../ui/progress.js'
import { debugLog } from '../system/debug.js'

export const runProcess = async ({ code, source, detected }) => {
  progressStart('AI membuat test runner')
  progressUpdate(15)

  const ai1 = await aiGenerate({ code, detected })

  progressUpdate(100)
  progressStop()

  if (!ai1 || !ai1.files || !ai1.run_command) {
    console.log('AI gagal membuat test runner')
    process.exit(1)
  }

  const writeSpinner = ora('Menulis file test').start()

  for (const file of ai1.files) {
    const target = path.join(generatedDir, file.path)
    await fs.outputFile(target, file.content)
  }

  writeSpinner.succeed('File test siap')

  progressStart('Menyiapkan dependency')
  progressUpdate(20)
  await ensureDependencies(ai1.dependencies || [], detected.language)
  progressUpdate(100)
  progressStop()

  let result = null
  let attempts = 0
  let lastError = null

  while (attempts < 3) {
    console.log('\n' + chalk.cyan.bold(`========== TEST SCRAPER OUTPUT ${attempts > 0 ? `RETRY ${attempts}/2` : 'RUN'} ==========`))
    console.log(chalk.gray(`Command: ${ai1.run_command}`))
    console.log(chalk.cyan.bold('================================================\n'))

    const start = Date.now()
    result = await runTest(ai1.run_command)
    const end = Date.now()

    result.time = (end - start) / 1000
    result.attempt = attempts + 1
    result.rawOutput = [
      result.stdout ? `STDOUT:\n${result.stdout}` : '',
      result.stderr ? `STDERR:\n${result.stderr}` : ''
    ].filter(Boolean).join('\n\n')

    console.log('\n' + chalk.cyan.bold('=============== END TEST OUTPUT ===============\n'))

    debugLog(result)

    if (result.exitCode === 0) {
      console.log(chalk.green.bold('Test scraper berhasil'))
      break
    }

    lastError = result.stderr || result.stdout || result.rawOutput

    if (attempts < 2) {
      const retrySpinner = ora(`Mendeteksi dan memperbaiki dependency retry ${attempts + 1}/2`).start()
      await ensureDependencies([], detected.language, lastError)
      retrySpinner.succeed('Perbaikan dependency selesai')
    }

    attempts++
  }

  const logFile = path.join(logsDir, `log-${Date.now()}.txt`)

  await fs.writeFile(logFile, JSON.stringify({
    source,
    detected,
    ai1,
    result,
    lastError
  }, null, 2))

  progressStart('AI menyusun laporan')
  progressUpdate(20)

  const ai2 = await aiReport({
    code,
    detected,
    ai1,
    result,
    lastError
  })

  progressUpdate(100)
  progressStop()

  progressStart('Membuat PDF')
  progressUpdate(30)
  const pdfPath = await buildPdf(ai2)
  progressUpdate(100)
  progressStop()

  progressStart('Upload PDF ke CDN')
  progressUpdate(25)
  const url = await uploadFile(pdfPath)
  progressUpdate(100)
  progressStop()

  console.log('\nFinal Report:')
  console.log(url)

  await cleanup()
}