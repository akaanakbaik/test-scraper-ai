import axios from 'axios'
import { ai3Generate } from './ai3.js'
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

export const aiGenerate = async ({ code, detected }) => {
  const prompt = `
Buatkan test runner untuk scraper berikut.
Output wajib JSON valid tanpa markdown.
Dependency harus lengkap dan sesuai agar tidak terjadi module not found.
Gunakan versi dependency stabil dan cocok.
Jangan menambahkan penjelasan di luar JSON.

Kode:
${code}

Bahasa:
${JSON.stringify(detected, null, 2)}

Format:
{
 "scraper_name": "",
 "language": "",
 "dependencies": [{"name":"","version":"latest"}],
 "files": [{"path":"","content":""}],
 "run_command": ""
}
`

  try {
    const res = await axios.get('https://api.ootaizumi.web.id/ai/copilot', {
      params: { prompt },
      headers: {
        accept: '*/*',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        Referer: 'https://api.ootaizumi.web.id/endpoint'
      },
      timeout: 180000
    })

    debugLog(res.data)

    const text = res.data?.result || res.data?.text || res.data?.response || res.data
    const parsed = extractJson(text)

    if (!parsed || !parsed.files || !parsed.run_command) {
      return await ai3Generate(prompt)
    }

    return parsed
  } catch (error) {
    debugLog(error.stack || error.message)
    return await ai3Generate(prompt)
  }
}