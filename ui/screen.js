import chalk from 'chalk'
import boxen from 'boxen'
import figlet from 'figlet'
import gradient from 'gradient-string'

export const startCli = async () => {
  const title = figlet.textSync('SCRAPER TEST', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  })

  console.log(gradient.pastel.multiline(title))

  console.log(boxen(chalk.white.bold('Auto Test Scraper JS CJS / JS ESM / Python\n') + chalk.gray('Paste kode scraper atau jalankan dengan --file scraper.js'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  }))
}