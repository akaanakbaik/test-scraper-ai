import { execa } from 'execa'
import chalk from 'chalk'
import ora from 'ora'
import { confirm } from '@inquirer/prompts'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'

const debug = process.argv.includes('--debug')

const run = async (command, args = [], options = {}) => {
  return await execa(command, args, {
    shell: true,
    stdio: options.stdio || (debug ? 'inherit' : 'pipe'),
    reject: false
  })
}

const hasCommand = async command => {
  const result = await execa(`command -v ${command}`, {
    shell: true,
    reject: false
  })
  return result.exitCode === 0
}

const versionNumber = value => {
  const match = String(value || '').match(/v?(\d+)/)
  return match ? Number(match[1]) : 0
}

const installDocker = async () => {
  const dockerCheck = ora('Memeriksa Docker').start()
  const dockerExists = await hasCommand('docker')

  if (dockerExists) {
    dockerCheck.succeed('Docker tersedia')
    return
  }

  dockerCheck.fail('Docker tidak ditemukan')

  const allow = await confirm({
    message: 'Docker belum tersedia. Install dan konfigurasi otomatis sekarang?',
    default: true
  })

  if (!allow) {
    console.log(chalk.red('Setup dibatalkan karena Docker dibutuhkan untuk sandbox'))
    process.exit(1)
  }

  const install = ora('Menginstall dan mengkonfigurasi Docker').start()
  const result = await run('sudo apt update && sudo apt install -y docker.io && sudo systemctl enable docker && sudo systemctl start docker && sudo usermod -aG docker $USER')

  if (result.exitCode !== 0) {
    install.fail('Install Docker gagal')
    console.log(result.stderr || result.stdout || '')
    process.exit(1)
  }

  install.succeed('Docker berhasil diinstall dan dikonfigurasi')
}

const main = async () => {
  console.clear()
  console.log(chalk.cyan.bold('\nScraper Test CLI Setup\n'))

  const nodeCheck = ora('Memeriksa Node.js v20+').start()
  const nodeResult = await execa('node -v', {
    shell: true,
    reject: false
  })
  const nodeMajor = versionNumber(nodeResult.stdout)

  if (nodeResult.exitCode !== 0 || nodeMajor < 20) {
    nodeCheck.fail('Node.js v20 ke atas wajib tersedia')
    console.log(chalk.red('\nInstall Node.js v20+ terlebih dahulu, lalu jalankan ulang npm run setup\n'))
    process.exit(1)
  }

  nodeCheck.succeed(`Node.js sesuai: ${nodeResult.stdout}`)

  const npmCheck = ora('Memeriksa npm').start()
  const npmExists = await hasCommand('npm')

  if (!npmExists) {
    npmCheck.fail('npm tidak ditemukan')
    process.exit(1)
  }

  npmCheck.succeed('npm tersedia')

  const curlCheck = ora('Memeriksa curl').start()
  const curlExists = await hasCommand('curl')

  if (!curlExists) {
    curlCheck.fail('curl tidak ditemukan')

    const allow = await confirm({
      message: 'curl belum tersedia. Install otomatis sekarang?',
      default: true
    })

    if (!allow) {
      console.log(chalk.red('Setup dibatalkan'))
      process.exit(1)
    }

    const installCurl = ora('Menginstall curl').start()
    const install = await run('sudo apt update && sudo apt install -y curl')

    if (install.exitCode !== 0) {
      installCurl.fail('Install curl gagal')
      process.exit(1)
    }

    installCurl.succeed('curl berhasil diinstall')
  } else {
    curlCheck.succeed('curl tersedia')
  }

  await installDocker()

  const folderCheck = ora('Menyiapkan folder utama dan cache').start()

  for (const dir of ['workspace', 'workspace/input', 'workspace/generated', 'workspace/logs', 'workspace/tmp', 'workspace/cache', 'workspace/cache/node', 'workspace/cache/pip', 'reports']) {
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  }

  folderCheck.succeed('Folder utama dan cache siap')

  const npmInstall = ora('Menginstall dependency utama tools').start()
  const installResult = await run('npm install')

  if (installResult.exitCode !== 0) {
    npmInstall.fail('npm install gagal')
    console.log(installResult.stderr || installResult.stdout || '')
    process.exit(1)
  }

  npmInstall.succeed('Dependency utama tools siap')

  console.log(chalk.green.bold('\nSetup selesai. Menjalankan tools...\n'))

  await new Promise(resolve => setTimeout(resolve, 800))
  console.clear()

  const start = await run('npm start', [], { stdio: 'inherit' })
  process.exit(start.exitCode || 0)
}

main().catch(error => {
  console.log(chalk.red(error.stack || error.message))
  process.exit(1)
})