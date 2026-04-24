import { execa } from 'execa'
import { generatedDir } from '../system/workspace.js'

export const runTest = async command => {
  const result = await execa(command, {
    shell: true,
    cwd: generatedDir,
    reject: false,
    timeout: 600000
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