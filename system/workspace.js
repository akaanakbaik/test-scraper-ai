import fs from 'fs-extra'
import path from 'path'

export const paths = {
  root: process.cwd(),
  workspace: path.join(process.cwd(), 'workspace'),
  input: path.join(process.cwd(), 'workspace', 'input'),
  generated: path.join(process.cwd(), 'workspace', 'generated'),
  logs: path.join(process.cwd(), 'workspace', 'logs'),
  tmp: path.join(process.cwd(), 'workspace', 'tmp'),
  reports: path.join(process.cwd(), 'reports')
}

export const prepareWorkspace = async () => {
  await fs.ensureDir(paths.workspace)
  await fs.ensureDir(paths.input)
  await fs.ensureDir(paths.generated)
  await fs.ensureDir(paths.logs)
  await fs.ensureDir(paths.tmp)
  await fs.ensureDir(paths.reports)
}