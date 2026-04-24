import chalk from 'chalk'
import boxen from 'boxen'
import figlet from 'figlet'
import gradient from 'gradient-string'

export const startCli = async debug => {
  const title = figlet.textSync('SCRAPER TEST', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  })

  console.log(gradient.pastel.multiline(title))

  const body = [
    chalk.white.bold('Auto Test Scraper JS CJS / JS ESM / Python'),
    chalk.gray('Mode stabil: buat file dulu dengan nano, lalu jalankan pakai --file'),
    '',
    chalk.cyan('nano scraper.js'),
    chalk.cyan('npm start -- --file scraper.js'),
    '',
    chalk.cyan('nano scraper.py'),
    chalk.cyan('npm start -- --file scraper.py'),
    '',
    chalk.gray('Docker sandbox aktif otomatis'),
    chalk.gray('Dependency cache aktif'),
    debug ? chalk.yellow('Debug mode aktif') : chalk.gray('Gunakan --debug untuk log full')
  ].join('\n')

  console.log(boxen(body, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: debug ? 'yellow' : 'cyan'
  }))
}