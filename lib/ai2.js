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

const cut = (value, max = 7000) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '\n...[TRUNCATED]' : text
}

export const aiReport = async data => {
  const compact = {
    code: cut(data?.code, 7000),
    detected: data?.detected,
    ai1: data?.ai1,
    result: {
      command: data?.result?.command,
      stdout: cut(data?.result?.stdout, 5000),
      stderr: cut(data?.result?.stderr, 5000),
      exitCode: data?.result?.exitCode,
      failed: data?.result?.failed,
      timedOut: data?.result?.timedOut,
      time: data?.result?.time,
      attempt: data?.result?.attempt
    },
    lastError: cut(data?.lastError, 5000)
  }

  const text = `
Buat laporan lengkap scraper test dalam format JSON.
Seluruh proses, dependency, retry, output, error, waktu respon, dan hasil akhir wajib dirangkum.
Jangan sensor token, API key, URL, atau data apa pun.
Jangan gunakan markdown.

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
      timeout: 180000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    debugLog(res.data)

    const result = res.data?.result || res.data?.text || res.data?.response || res.data
    const parsed = extractJson(result)

    if (!parsed || !parsed.title) {
      return await ai3Report(compact)
    }

    return parsed
  } catch (error) {
    debugLog(error.stack || error.message)
    return await ai3Report(compact)
  }
}