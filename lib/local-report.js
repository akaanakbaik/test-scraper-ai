const safe = value => {
  if (value === undefined || value === null || value === '') return '-'
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

const analyzeOutput = data => {
  const raw = data?.result?.rawOutput || data?.result?.all || data?.result?.stdout || ''
  const success = data?.result?.exitCode === 0

  const testPassed = raw.match(/Tests:\s+(.+)/i)?.[1] || raw.match(/Test Suites:\s+(.+)/i)?.[1] || '-'
  const time = raw.match(/Time:\s+(.+)/i)?.[1] || '-'

  if (success) {
    return [
      'Test scraper berhasil dijalankan.',
      `Ringkasan test: ${testPassed}`,
      `Waktu test internal: ${time}`,
      'Output asli tersedia pada bagian Raw Test Output.'
    ].join('\n')
  }

  return [
    'Test scraper gagal dijalankan.',
    `Ringkasan test: ${testPassed}`,
    'Detail error asli tersedia pada bagian Errors dan Raw Test Output.'
  ].join('\n')
}

export const localReport = (data, reason = '') => {
  const success = data?.result?.exitCode === 0
  const rawOutput = data?.result?.rawOutput || data?.result?.all || [data?.result?.stdout, data?.result?.stderr].filter(Boolean).join('\n\n')

  return {
    title: `Scraper Test Report - ${data?.scraper_name || 'unknown'}`,
    status: success ? 'success' : 'failed',
    summary: success
      ? 'Scraper berhasil dijalankan dan test selesai tanpa exit error.'
      : 'Scraper gagal dijalankan atau test mengembalikan exit error.',
    scraper_explanation: `Scraper terdeteksi sebagai ${data?.language || data?.detected?.language || 'unknown'} dengan module ${data?.detected?.module || '-'}.`,
    output_explanation: analyzeOutput(data),
    performance: data?.result?.time ? `${data.result.time}s, attempt ${data?.result?.attempt || 1}` : '-',
    dependencies: safe(data?.dependencies),
    errors: success ? '-' : safe(data?.result?.stderr || data?.lastError || reason),
    suggestions: success
      ? 'Scraper sudah berjalan dengan baik. Optimasi berikutnya bisa fokus pada timeout, retry request, dan validasi output.'
      : 'Periksa dependency, command runner, struktur file test, dan error asli di bagian Raw Test Output.',
    raw_output: rawOutput || '-'
  }
}