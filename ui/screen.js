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
    chalk.gray('Paste kode scraper atau jalankan dengan --file scraper.js'),
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