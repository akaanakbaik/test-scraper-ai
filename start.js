#!/usr/bin/env node
import fs from 'fs-extra';
import process from 'process';
import { intro, outro, pasteScraper, fileInputPrompt } from './ui.js';

const getArgFile = () => {
  const index = process.argv.findIndex(v => v === '--file' || v === '-f');
  if (index === -1) return null;
  return process.argv[index + 1] || null;
};

const main = async () => {
  console.clear();
  await fs.ensureDir('workspace');
  await fs.ensureDir('reports');
  await fs.ensureDir('logs');

  intro();

  const argFile = getArgFile();
  let code = '';

  if (argFile) {
    if (!await fs.pathExists(argFile)) throw new Error(`File tidak ditemukan: ${argFile}`);
    code = await fs.readFile(argFile, 'utf8');
  } else {
    const mode = await fileInputPrompt();
    if (mode === 'file') {
      const file = await pasteScraper('Masukkan path file scraper');
      if (!await fs.pathExists(file.trim())) throw new Error(`File tidak ditemukan: ${file.trim()}`);
      code = await fs.readFile(file.trim(), 'utf8');
    } else {
      code = await pasteScraper('Paste kode scraper kamu');
    }
  }

  if (!code.trim()) throw new Error('Kode scraper kosong.');

  await fs.writeFile('workspace/input.raw.txt', code);
  console.log('');
  console.log('Kode diterima dan disimpan ke workspace/input.raw.txt');
  console.log('');
  console.log('Batch berikutnya akan berisi detector, workspace manager, logger, dan security scanner.');
  outro();
};

main().catch(err => {
  console.error('\nERROR\n');
  console.error(err.stack || err.message);
  process.exit(1);
});