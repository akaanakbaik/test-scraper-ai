import cliProgress from 'cli-progress'
import chalk from 'chalk'
import { isDebug } from '../system/debug.js'

let bar = null

export const progressStart = title => {
  if (isDebug()) {
    console.log(chalk.cyan(title))
    return
  }

  bar = new cliProgress.SingleBar({
    format: `${chalk.cyan(title)} |{bar}| {percentage}% | {value}/{total}`,
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
    clearOnComplete: true,
    stopOnComplete: true
  })

  bar.start(100, 0)
}

export const progressUpdate = value => {
  if (isDebug()) return
  if (bar) bar.update(Math.min(100, Math.max(0, value)))
}

export const progressStop = () => {
  if (isDebug()) return
  if (bar) {
    bar.update(100)
    bar.stop()
    bar = null
  }
}

export const progressStep = async (title, steps, fn) => {
  progressStart(title)

  for (const step of steps) {
    progressUpdate(step)
    await new Promise(resolve => setTimeout(resolve, 120))
  }

  const result = await fn()
  progressStop()
  return result
}