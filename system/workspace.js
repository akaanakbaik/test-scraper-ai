import fs from 'fs-extra'
import path from 'path'

export const rootDir = process.cwd()
export const workspaceDir = path.join(rootDir, 'workspace')
export const inputDir = path.join(workspaceDir, 'input')
export const generatedDir = path.join(workspaceDir, 'generated')
export const logsDir = path.join(workspaceDir, 'logs')
export const tmpDir = path.join(workspaceDir, 'tmp')
export const cacheDir = path.join(workspaceDir, 'cache')
export const nodeCacheDir = path.join(cacheDir, 'node')
export const pipCacheDir = path.join(cacheDir, 'pip')
export const reportsDir = path.join(rootDir, 'reports')

export const prepareWorkspace = async () => {
  await fs.ensureDir(workspaceDir)
  await fs.ensureDir(inputDir)
  await fs.ensureDir(generatedDir)
  await fs.ensureDir(logsDir)
  await fs.ensureDir(tmpDir)
  await fs.ensureDir(cacheDir)
  await fs.ensureDir(nodeCacheDir)
  await fs.ensureDir(pipCacheDir)
  await fs.ensureDir(reportsDir)
}