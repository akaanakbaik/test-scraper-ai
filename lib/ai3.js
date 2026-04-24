import axios from 'axios'
import { debugLog } from '../system/debug.js'

const extractJson = value => {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  const clean = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {}

  const match = clean.match(/\{[\s\S]*\}/)

  if (!match) return null

  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

const cut = (value, max = 2500) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '\n...[TRUNCATED]' : text
}

const compactReportData = data => {
  return {
    detected: data?.detected,
    scraper_name: data?.ai1?.scraper_name,
    language: data?.ai1?.language,
    dependencies: data?.ai1?.dependencies,
    run_command: data?.ai1?.run_command,
    exitCode: data?.result?.exitCode,
    failed: data?.result?.failed,
    timedOut: data?.result?.timedOut,
    time: data?.result?.time,
    attempt: data?.result?.attempt,
    stdout: cut(data?.result?.stdout, 2500),
    stderr: cut(data?.result?.stderr, 2500),
    lastError: cut(data?.lastError, 2500),
    code_preview: cut(data?.code, 2500)
  }
}

export const ai3Generate = async prompt => {
  const res = await axios.get('https://apis.prexzyvilla.site/ai/copilot-think', {
    params: { text: cut(prompt, 12000) },
    timeout: 180000
  })

  debugLog(res.data)

  if (!res.data?.status && res.data?.status !== undefined) {
    throw new Error(JSON.stringify(res.data, null, 2))
  }

  const text = res.data?.text || res.data?.result || res.data?.response || ''
  const parsed = extractJson(text)

  if (!parsed || !parsed.files || !parsed.run_command) {
    throw new Error('AI3 gagal membuat JSON test runner valid')
  }

  return parsed
}

export const ai3Report = async data => {
  const compact = compactReportData(data)

  const prompt = `
Buat laporan lengkap scraper test dalam format JSON.
Jangan gunakan markdown.
Jangan sensor token, API key, URL, atau data apa pun.
Output wajib JSON valid.

Data:
${JSON.stringify(compact, null, 2)}

Format:
{
 "title": "",
 "status": "",
 "summary": "",
 "scraper_explanation": "",
 "output_explanation": "",
 "performance": "",
 "dependencies": "",
 "errors": "",
 "suggestions": ""
}
`

  try {
    const res = await axios.get('https://apis.prexzyvilla.site/ai/copilot-think', {
      params: { text: prompt },
      timeout: 180000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    debugLog(res.data)

    const text = res.data?.text || res.data?.result || res.data?.response || ''
    const parsed = extractJson(text)

    if (parsed && parsed.title) return parsed

    return {
      title: `Scraper Test Report - ${compact.scraper_name || 'unknown'}`,
      status: compact.exitCode === 0 ? 'success' : 'failed',
      summary: text || 'AI3 tidak memberikan JSON valid',
      scraper_explanation: `Scraper terdeteksi sebagai ${compact.language || compact.detected?.language || 'unknown'}.`,
      output_explanation: compact.stdout || '-',
      performance: compact.time ? `${compact.time}s` : '-',
      dependencies: JSON.stringify(compact.dependencies || [], null, 2),
      errors: compact.stderr || compact.lastError || '-',
      suggestions: 'Periksa dependency, struktur output, dan error log jika test gagal.'
    }
  } catch (error) {
    debugLog(error.stack || error.message)

    return {
      title: `Scraper Test Report - ${compact.scraper_name || 'unknown'}`,
      status: compact.exitCode === 0 ? 'success' : 'failed',
      summary: 'Report dibuat otomatis karena AI report fallback gagal.',
      scraper_explanation: `Scraper terdeteksi sebagai ${compact.language || compact.detected?.language || 'unknown'}.`,
      output_explanation: compact.stdout || '-',
      performance: compact.time ? `${compact.time}s` : '-',
      dependencies: JSON.stringify(compact.dependencies || [], null, 2),
      errors: compact.stderr || compact.lastError || error.message || '-',
      suggestions: 'Jika error 414 muncul, berarti payload AI terlalu panjang. Sistem sekarang memakai compact report agar tetap lanjut membuat PDF.'
    }
  }
}