import axios from 'axios'
import { ai3Report } from './ai3.js'
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

export const aiReport = async data => {
  const text = `
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

  const body = {
    messages: [
      {
        role: 'user',
        parts: [
          {
            text
          }
        ]
      }
    ]
  }

  try {
    const res = await axios.post('https://api.ootaizumi.web.id/ai/gemini-v2', body, {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        Referer: 'https://api.ootaizumi.web.id/endpoint'
      },
      timeout: 180000
    })

    debugLog(res.data)

    const result = res.data?.result || res.data?.text || res.data?.response || res.data
    const parsed = extractJson(result)

    if (!parsed || !parsed.title) {
      return await ai3Report(data)
    }

    return parsed
  } catch (error) {
    debugLog(error.stack || error.message)
    return await ai3Report(data)
  }
}