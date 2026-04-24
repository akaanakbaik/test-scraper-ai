import { execa } from 'execa';
import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import process from 'process';

const run = async (cmd, args = [], opts = {}) => {
  return await execa(cmd, args, {
    stdio: opts.stdio || 'pipe',
    shell: opts.shell || false,
    timeout: opts.timeout || 300000
  });
};

const exists = async cmd => {
  try {
    await run(cmd, ['--version']);
    return true;
  } catch {
    return false;
  }
};

const nodeOk = () => {
  const major = Number(process.versions.node.split('.')[0]);
  return major >= 20;
};

const installSystemPackage = async names => {
  const hasApt = await exists('apt');
  const hasAptGet = await exists('apt-get');
  if (!hasApt && !hasAptGet) throw new Error('Package manager apt tidak ditemukan.');
  const apt = hasApt ? 'apt' : 'apt-get';
  await run('sudo', [apt, 'update'], { stdio: 'inherit', timeout: 600000 });
  await run('sudo', [apt, 'install', '-y', ...names], { stdio: 'inherit', timeout: 900000 });
};

const main = async () => {
  console.clear();
  console.log(chalk.cyan.bold('Scraper Test CLI Setup\n'));

  if (!nodeOk()) {
    console.log(chalk.red(`Node.js kamu versi ${process.versions.node}. Minimal Node.js v20.`));
    process.exit(1);
  }

  const checks = [
    ['npm', ['npm']],
    ['curl', ['curl']]
  ];

  const missing = [];

  for (const [name] of checks) {
    const spinner = ora(`Memeriksa ${name}`).start();
    const ok = await exists(name);
    if (ok) spinner.succeed(`${name} tersedia`);
    else {
      spinner.fail(`${name} belum tersedia`);
      missing.push(name);
    }
  }

  if (missing.length) {
    const yes = await confirm({
      message: `Install dependency sistem yang kurang: ${missing.join(', ')}?`,
      default: true
    });

    if (!yes) {
      console.log(chalk.red('Setup dibatalkan.'));
      process.exit(1);
    }

    await installSystemPackage(missing);
  }

  await fs.ensureDir('workspace');
  await fs.ensureDir('reports');
  await fs.ensureDir('logs');

  const spinner = ora('Menginstall dependency tools utama').start();

  try {
    await run('npm', ['install'], { timeout: 900000 });
    spinner.succeed('Dependency tools utama selesai');
  } catch (err) {
    spinner.fail('Gagal npm install');
    console.error(err.stdout || '');
    console.error(err.stderr || err.message);
    process.exit(1);
  }

  console.clear();
  await run('npm', ['start'], { stdio: 'inherit', timeout: 0 });
};

main().catch(err => {
  console.error(chalk.red('\nSETUP ERROR\n'));
  console.error(err.stack || err.message);
  process.exit(1);
});