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

export const ai3Generate = async prompt => {
  const res = await axios.get('https://apis.prexzyvilla.site/ai/copilot-think', {
    params: { text: prompt },
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
  const prompt = `
Buat laporan lengkap scraper test dalam format JSON.
Seluruh proses, dependency, retry, output, error, waktu respon, dan hasil akhir wajib dirangkum.
Jangan sensor token, API key, URL, atau data apa pun.
Jangan gunakan markdown.

Data:
${JSON.stringify(data, null, 2)}

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

  const res = await axios.get('https://apis.prexzyvilla.site/ai/copilot-think', {
    params: { text: prompt },
    timeout: 180000
  })

  debugLog(res.data)

  const text = res.data?.text || res.data?.result || res.data?.response || ''
  const parsed = extractJson(text)

  if (parsed && parsed.title) return parsed

  return {
    title: 'Scraper Test Report',
    status: 'unknown',
    summary: text || 'AI3 tidak memberikan ringkasan valid',
    scraper_explanation: '',
    output_explanation: '',
    performance: '',
    dependencies: '',
    errors: '',
    suggestions: ''
  }
}