import { execa } from 'execa'
import ora from 'ora'
import chalk from 'chalk'
import { confirm } from '@inquirer/prompts'

const run = async command => {
  return await execa(command, {
    shell: true,
    reject: false
  })
}

export const checkPythonIfNeeded = async () => {
  const check = ora('Kode Python terdeteksi, memeriksa python3').start()
  const python = await run('command -v python3')

  if (python.exitCode === 0) {
    check.succeed('python3 tersedia')
  } else {
    check.fail('python3 tidak ditemukan')

    const allow = await confirm({
      message: 'Install python3 otomatis sekarang?',
      default: true
    })

    if (!allow) {
      console.log(chalk.red('Proses dibatalkan karena python3 tidak tersedia'))
      process.exit(1)
    }

    const install = ora('Menginstall python3 dan pip').start()
    const result = await run('sudo apt update && sudo apt install -y python3 python3-pip')

    if (result.exitCode !== 0) {
      install.fail('Gagal install python3')
      console.log(result.stderr || result.stdout)
      process.exit(1)
    }

    install.succeed('python3 dan pip berhasil diinstall')
  }

  const pipCheck = ora('Memeriksa pip').start()
  const pip = await run('command -v pip3')

  if (pip.exitCode === 0) {
    pipCheck.succeed('pip3 tersedia')
    return
  }

  pipCheck.fail('pip3 tidak ditemukan')

  const allowPip = await confirm({
    message: 'Install pip3 otomatis sekarang?',
    default: true
  })

  if (!allowPip) {
    console.log(chalk.red('Proses dibatalkan karena pip3 tidak tersedia'))
    process.exit(1)
  }

  const installPip = ora('Menginstall pip3').start()
  const result = await run('sudo apt update && sudo apt install -y python3-pip')

  if (result.exitCode !== 0) {
    installPip.fail('Gagal install pip3')
    console.log(result.stderr || result.stdout)
    process.exit(1)
  }

  installPip.succeed('pip3 berhasil diinstall')
}