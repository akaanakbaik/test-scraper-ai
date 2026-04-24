#!/usr/bin/env node

import { startCli } from '../ui/screen.js'
import { prepareWorkspace } from '../system/workspace.js'
import { readInputCode } from '../system/input.js'
import { detectLanguage } from '../system/detect.js'
import { checkPythonIfNeeded } from '../runtime/python.js'
import { ensureDocker } from '../runtime/docker.js'
import { setDebug } from '../system/debug.js'

const main = async () => {
  const debug = process.argv.includes('--debug')
  setDebug(debug)

  console.clear()
  await prepareWorkspace()
  await startCli(debug)
  await ensureDocker()

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