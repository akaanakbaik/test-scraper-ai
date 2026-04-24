import { execa } from 'execa'
import ora from 'ora'
import chalk from 'chalk'
import { confirm } from '@inquirer/prompts'
import { isDebug } from '../system/debug.js'

const run = async command => {
  return await execa(command, {
    shell: true,
    reject: false,
    stdio: isDebug() ? 'inherit' : 'pipe'
  })
}

const exists = async command => {
  const result = await execa(`command -v ${command}`, {
    shell: true,
    reject: false
  })
  return result.exitCode === 0
}

export const ensureDocker = async () => {
  const check = ora('Memeriksa Docker sandbox').start()
  const dockerExists = await exists('docker')

  if (!dockerExists) {
    check.fail('Docker belum tersedia')

    const allow = await confirm({
      message: 'Install Docker otomatis untuk sandbox?',
      default: true
    })

    if (!allow) {
      console.log(chalk.red('Proses dibatalkan karena Docker sandbox tidak tersedia'))
      process.exit(1)
    }

    const install = ora('Menginstall Docker dan konfigurasi otomatis').start()
    const result = await run('sudo apt update && sudo apt install -y docker.io && sudo systemctl enable docker && sudo systemctl start docker && sudo usermod -aG docker $USER')

    if (result.exitCode !== 0) {
      install.fail('Install Docker gagal')
      console.log(result.stderr || result.stdout || '')
      process.exit(1)
    }

    install.succeed('Docker berhasil disiapkan')
  } else {
    check.succeed('Docker tersedia')
  }

  const daemon = ora('Memastikan Docker daemon aktif').start()
  const active = await run('docker info')

  if (active.exitCode !== 0) {
    daemon.fail('Docker daemon belum aktif')
    const start = await run('sudo systemctl start docker')

    if (start.exitCode !== 0) {
      console.log(chalk.red('Gagal menjalankan Docker daemon'))
      process.exit(1)
    }

    daemon.succeed('Docker daemon aktif')
  } else {
    daemon.succeed('Docker daemon aktif')
  }

  const image = ora('Memastikan image sandbox tersedia').start()
  const inspect = await run('docker image inspect scraper-test-sandbox:latest')

  if (inspect.exitCode === 0) {
    image.succeed('Image sandbox tersedia')
    return
  }

  image.text = 'Membuat image sandbox otomatis'

  const build = await run(`docker build -t scraper-test-sandbox:latest -f docker/Dockerfile .`)

  if (build.exitCode !== 0) {
    image.fail('Build image sandbox gagal')
    console.log(build.stderr || build.stdout || '')
    process.exit(1)
  }

  image.succeed('Image sandbox berhasil dibuat')
}