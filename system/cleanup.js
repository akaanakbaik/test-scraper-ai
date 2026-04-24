import fs from 'fs-extra'
import path from 'path'
import { workspaceDir, generatedDir, tmpDir } from './workspace.js'

export const cleanup = async () => {
  const targets = [
    generatedDir,
    tmpDir,
    path.join(workspaceDir, 'node_modules'),
    path.join(workspaceDir, 'package-lock.json'),
    path.join(workspaceDir, '__pycache__'),
    path.join(workspaceDir, '.pytest_cache')
  ]

  for (const target of targets) {
    await fs.remove(target).catch(() => {})
  }

  await fs.ensureDir(generatedDir)
  await fs.ensureDir(tmpDir)
}