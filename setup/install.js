import { execSync } from 'child_process'
import chalk from 'chalk'
import ora from 'ora'
import { confirm } from '@inquirer/prompts'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'

const debug = process.argv.includes('--debug')

const run = command => {
  try {
    execSync(command, {
      stdio: debug ? 'inherit' : 'pipe',
      shell: true
    })
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  }
}

const hasCommand = command => {
  try {
    execSync(`command -v ${command}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const versionNumber = value => {
  const match = String(value || '').match(/v?(\d+)/)
  return match ? Number(match[1]) : 0
}

const getNodeVersion = () => {
  try {
    const v = execSync('node -v').toString()
    return v.trim()
  } catch {
    return null
  }
}

const installDocker = async () => {
  const spinner = ora('Memeriksa Docker').start()

  if (hasCommand('docker')) {
    spinner.succeed('Docker tersedia')
    return
  }

  spinner.fail('Docker tidak ditemukan')

  const allow = await confirm({
    message: 'Install Docker otomatis?',
    default: true
  })

  if (!allow) {
    console.log(chalk.red('Setup dibatalkan'))
    process.exit(1)
  }

  const install = ora('Menginstall Docker').start()

  const res = run('apt update && apt install -y docker.io && systemctl enable docker && systemctl start docker')

  if (!res.success) {
    install.fail('Install Docker gagal')
    console.log(res.error)
    process.exit(1)
  }

  install.succeed('Docker berhasil diinstall')
}

const main = async () => {
  console.clear()
  console.log(chalk.cyan.bold('\nScraper Test CLI Setup\n'))

  const nodeSpinner = ora('Memeriksa Node.js').start()
  const nodeVersion = getNodeVersion()

  if (!nodeVersion || versionNumber(nodeVersion) < 20) {
    nodeSpinner.fail('Node.js v20+ wajib')
    process.exit(1)
  }

  nodeSpinner.succeed(`Node OK: ${nodeVersion}`)

  const npmSpinner = ora('Memeriksa npm').start()

  if (!hasCommand('npm')) {
    npmSpinner.fail('npm tidak ditemukan')
    process.exit(1)
  }

  npmSpinner.succeed('npm tersedia')

  const curlSpinner = ora('Memeriksa curl').start()

  if (!hasCommand('curl')) {
    curlSpinner.fail('curl tidak ada')

    const allow = await confirm({
      message: 'Install curl?',
      default: true
    })

    if (!allow) process.exit(1)

    run('apt update && apt install -y curl')
  }

  curlSpinner.succeed('curl tersedia')

  await installDocker()

  const folderSpinner = ora('Menyiapkan folder').start()

  const dirs = [
    'workspace',
    'workspace/input',
    'workspace/generated',
    'workspace/logs',
    'workspace/tmp',
    'workspace/cache',
    'workspace/cache/node',
    'workspace/cache/pip',
    'reports'
  ]

  for (const dir of dirs) {
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  }

  folderSpinner.succeed('Folder siap')

  const installSpinner = ora('Install dependency tools').start()

  const res = run('npm install')

  if (!res.success) {
    installSpinner.fail('npm install gagal')
    console.log(res.error)
    process.exit(1)
  }

  installSpinner.succeed('Dependency berhasil diinstall')

  console.log(chalk.green.bold('\nSetup selesai\n'))

  run('npm start')
}

main()