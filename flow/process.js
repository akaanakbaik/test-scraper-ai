import ora from 'ora'
import fs from 'fs-extra'
import path from 'path'
import { generatedDir, logsDir } from '../system/workspace.js'
import { aiGenerate } from '../lib/ai1.js'
import { aiReport } from '../lib/ai2.js'
import { ensureDependencies } from '../runtime/dependency.js'
import { runTest } from '../runtime/runner.js'
import { buildPdf } from '../report/pdf.js'
import { uploadFile } from '../report/upload.js'
import { cleanup } from '../system/cleanup.js'

export const runProcess = async ({ code, source, detected }) => {
  const spinner = ora('Memproses scraper dengan AI').start()

  const ai1 = await aiGenerate({ code, detected })

  if (!ai1 || !ai1.files || !ai1.run_command) {
    spinner.fail('AI gagal membuat test runner')
    process.exit(1)
  }

  spinner.succeed('Test runner dibuat')

  const writeSpinner = ora('Menulis file test').start()

  for (const file of ai1.files) {
    const target = path.join(generatedDir, file.path)
    await fs.outputFile(target, file.content)
  }

  writeSpinner.succeed('File test siap')

  const depSpinner = ora('Menyiapkan dependency').start()
  await ensureDependencies(ai1.dependencies || [], detected.language)
  depSpinner.succeed('Dependency siap')

  let result
  let attempts = 0
  let lastError = null

  while (attempts < 3) {
    const runSpinner = ora(`Menjalankan test scraper ${attempts > 0 ? `(retry ${attempts}/2)` : ''}`).start()

    const start = Date.now()
    result = await runTest(ai1.run_command)
    const end = Date.now()

    result.time = (end - start) / 1000

    if (result.exitCode === 0) {
      runSpinner.succeed('Test berhasil')
      break
    }

    runSpinner.fail('Test gagal')

    lastError = result.stderr || result.stdout

    if (attempts < 2) {
      const retrySpinner = ora('Mencoba perbaikan dependency').start()
      await ensureDependencies([], detected.language, lastError)
      retrySpinner.succeed('Perbaikan selesai')
    }

    attempts++
  }

  const logFile = path.join(logsDir, `log-${Date.now()}.txt`)
  await fs.writeFile(logFile, JSON.stringify(result, null, 2))

  const reportSpinner = ora('Menyusun laporan dengan AI').start()

  const ai2 = await aiReport({
    code,
    detected,
    ai1,
    result
  })

  reportSpinner.succeed('Laporan siap')

  const pdfSpinner = ora('Membuat PDF').start()
  const pdfPath = await buildPdf(ai2)
  pdfSpinner.succeed('PDF dibuat')

  const uploadSpinner = ora('Upload PDF ke CDN').start()
  const url = await uploadFile(pdfPath)
  uploadSpinner.succeed('Upload selesai')

  console.log('\n')
  console.log('Final Report:')
  console.log(url)

  await cleanup()
}