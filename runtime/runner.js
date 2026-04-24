import { execa } from 'execa'
import ora from 'ora'
import fs from 'fs-extra'
import path from 'path'
import { nodeCacheDir, pipCacheDir, generatedDir } from '../system/workspace.js'
import { isDebug } from '../system/debug.js'

const run = async cmd => {
  return await execa(cmd, {
    shell: true,
    reject: false,
    stdio: isDebug() ? 'inherit' : 'pipe'
  })
}

const normalizeName = value => {
  return String(value || '')
    .replace(/^@/, 'scope-')
    .replace(/[\/\\]/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
}

const addFromError = (list, errorLog) => {
  const text = String(errorLog || '')

  const jsPatterns = [
    /Cannot find module ['"](.+?)['"]/g,
    /Cannot find module ['"](.+?)['"] from/g,
    /Error \[ERR_MODULE_NOT_FOUND\].*?package ['"](.+?)['"]/g,
    /Cannot find package ['"](.+?)['"]/g
  ]

  const pyPatterns = [
    /No module named ['"](.+?)['"]/g,
    /ModuleNotFoundError: No module named ['"](.+?)['"]/g
  ]

  for (const pattern of jsPatterns) {
    for (const match of text.matchAll(pattern)) {
      list.push({ name: match[1], version: 'latest' })
    }
  }

  for (const pattern of pyPatterns) {
    for (const match of text.matchAll(pattern)) {
      list.push({ name: match[1], version: 'latest' })
    }
  }

  return list
}

const uniqueDeps = deps => {
  const map = new Map()

  for (const dep of deps) {
    const name = typeof dep === 'string' ? dep : dep?.name
    const version = typeof dep === 'string' ? 'latest' : dep?.version || 'latest'
    if (!name) continue
    map.set(name, { name, version })
  }

  return [...map.values()]
}

const ensureNodePackageJson = async dir => {
  const pkg = path.join(dir, 'package.json')

  if (await fs.pathExists(pkg)) return

  await fs.writeJson(pkg, {
    type: 'commonjs',
    scripts: {
      test: 'node test.js'
    },
    dependencies: {}
  }, {
    spaces: 2
  })
}

const updateGeneratedPackage = async deps => {
  const pkgPath = path.join(generatedDir, 'package.json')

  let pkg = {}

  if (await fs.pathExists(pkgPath)) {
    pkg = await fs.readJson(pkgPath).catch(() => ({}))
  }

  pkg.scripts = pkg.scripts || {}
  pkg.dependencies = pkg.dependencies || {}
  pkg.devDependencies = pkg.devDependencies || {}

  for (const dep of deps) {
    const version = dep.version && dep.version !== 'latest' ? dep.version : 'latest'
    if (!pkg.dependencies[dep.name] && !pkg.devDependencies[dep.name]) {
      pkg.dependencies[dep.name] = version
    }
  }

  await fs.writeJson(pkgPath, pkg, {
    spaces: 2
  })
}

const installNpmCached = async dep => {
  await ensureNodePackageJson(nodeCacheDir)

  const packageName = dep.version && dep.version !== 'latest' ? `${dep.name}@${dep.version}` : dep.name

  return await execa('npm', ['install', packageName, '--prefix', nodeCacheDir], {
    reject: false,
    stdio: isDebug() ? 'inherit' : 'pipe'
  })
}

const installNpmGenerated = async dep => {
  const packageName = dep.version && dep.version !== 'latest' ? `${dep.name}@${dep.version}` : dep.name

  return await execa('npm', ['install', packageName, '--prefix', generatedDir], {
    reject: false,
    stdio: isDebug() ? 'inherit' : 'pipe'
  })
}

const installPipCached = async dep => {
  const packageName = dep.version && dep.version !== 'latest' ? `${dep.name}==${dep.version}` : dep.name

  return await execa('python3', ['-m', 'pip', 'install', packageName, '--target', pipCacheDir, '--break-system-packages'], {
    reject: false,
    stdio: isDebug() ? 'inherit' : 'pipe'
  })
}

const checkNpmGenerated = async name => {
  const target = path.join(generatedDir, 'node_modules', name)
  return await fs.pathExists(target)
}

const checkNpmCached = async name => {
  const target = path.join(nodeCacheDir, 'node_modules', name)
  return await fs.pathExists(target)
}

const checkPipCached = async name => {
  const clean = name.split('.')[0].replace(/-/g, '_')
  const direct = path.join(pipCacheDir, clean)
  const alt = path.join(pipCacheDir, name)
  return await fs.pathExists(direct) || await fs.pathExists(alt)
}

export const ensureDependencies = async (deps, lang, errorLog = '') => {
  const all = uniqueDeps(addFromError([...(deps || [])], errorLog))

  if (!all.length) return []

  if (lang === 'javascript') {
    await updateGeneratedPackage(all)
  }

  for (const dep of all) {
    const spinner = ora(`Memastikan dependency ${dep.name}`).start()

    if (lang === 'javascript') {
      const inGenerated = await checkNpmGenerated(dep.name)
      const inCache = await checkNpmCached(dep.name)

      if (inGenerated && inCache) {
        spinner.succeed(`${dep.name} sudah ada`)
        continue
      }

      if (!inCache) {
        const cacheResult = await installNpmCached(dep)

        if (cacheResult.exitCode !== 0) {
          spinner.fail(`Gagal install cache ${dep.name}`)
          console.log(cacheResult.stderr || cacheResult.stdout || '')
          process.exit(1)
        }
      }

      if (!inGenerated) {
        const generatedResult = await installNpmGenerated(dep)

        if (generatedResult.exitCode !== 0) {
          spinner.fail(`Gagal install sandbox ${dep.name}`)
          console.log(generatedResult.stderr || generatedResult.stdout || '')
          process.exit(1)
        }
      }

      spinner.succeed(`${dep.name} siap`)
      continue
    }

    if (lang === 'python') {
      if (await checkPipCached(dep.name)) {
        spinner.succeed(`${dep.name} sudah ada di cache`)
        continue
      }

      const result = await installPipCached(dep)

      if (result.exitCode !== 0) {
        spinner.fail(`Gagal install ${dep.name}`)
        console.log(result.stderr || result.stdout || '')
        process.exit(1)
      }

      spinner.succeed(`${dep.name} berhasil diinstall ke cache`)
    }
  }

  return all
}