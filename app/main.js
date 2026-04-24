#!/usr/bin/env node

import { startCli } from '../ui/screen.js'
import { prepareWorkspace } from '../system/workspace.js'
import { readInputCode } from '../system/input.js'
import { detectLanguage } from '../system/detect.js'
import { checkPythonIfNeeded } from '../runtime/python.js'

const main = async () => {
  console.clear()
  await prepareWorkspace()
  await startCli()

  const input = await readInputCode()
  const detected = detectLanguage(input.code)

  if (detected.language === 'python') {
    await checkPythonIfNeeded()
  }

  const next = await import('../flow/process.js')
  await next.runProcess({
    code: input.code,
    source: input.source,
    detected
  })
}

main().catch(error => {
  console.log('\n')
  console.error(error.stack || error.message || error)
  process.exit(1)
})