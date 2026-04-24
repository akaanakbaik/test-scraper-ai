import { execa } from 'execa'
import path from 'path'
import { generatedDir, pipCacheDir } from '../system/workspace.js'
import { isDebug } from '../system/debug.js'

const dockerCommand = command => {
  const workspace = generatedDir
  const pipPackages = pipCacheDir

  return [
    'docker run --rm',
    `-v "${workspace}:/sandbox"`,
    `-v "${pipPackages}:/sandbox/pip-packages"`,
    '-w /sandbox',
    '-e NODE_PATH=/sandbox/node_modules',
    '-e PYTHONPATH=/sandbox/pip-packages',
    '--network bridge',
    '--memory 1g',
    '--cpus 1.5',
    'scraper-test-sandbox:latest',
    'bash',
    '-lc',
    JSON.stringify(command)
  ].join(' ')
}

export const runTest = async command => {
  const result = await execa(dockerCommand(command), {
    shell: true,
    reject: false,
    timeout: 900000,
    stdio: isDebug() ? 'inherit' : 'pipe'
  })

  return {
    command,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.exitCode ?? 1,
    failed: result.failed || false,
    timedOut: result.timedOut || false
  }
}