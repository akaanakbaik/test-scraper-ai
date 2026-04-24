import { execa } from 'execa'
import ora from 'ora'

const run = async cmd => {
  return await execa(cmd, {
    shell: true,
    reject: false
  })
}

const installNpm = async name => {
  await run(`npm install ${name}`)
}

const installPip = async name => {
  await run(`pip3 install ${name}`)
}

export const ensureDependencies = async (deps, lang, errorLog = '') => {
  const list = [...deps]

  if (errorLog) {
    const match = errorLog.match(/Cannot find module '(.+?)'/)
    if (match) list.push({ name: match[1] })

    const py = errorLog.match(/No module named '(.+?)'/)
    if (py) list.push({ name: py[1] })
  }

  for (const dep of list) {
    const spinner = ora(`Memastikan ${dep.name}`).start()

    if (lang === 'javascript') {
      const check = await run(`npm list ${dep.name}`)
      if (check.exitCode === 0) {
        spinner.succeed(`${dep.name} sudah ada`)
        continue
      }

      await installNpm(dep.name)
      spinner.succeed(`${dep.name} diinstall`)
    }

    if (lang === 'python') {
      const check = await run(`python3 -c "import ${dep.name}"`)
      if (check.exitCode === 0) {
        spinner.succeed(`${dep.name} sudah ada`)
        continue
      }

      await installPip(dep.name)
      spinner.succeed(`${dep.name} diinstall`)
    }
  }
}