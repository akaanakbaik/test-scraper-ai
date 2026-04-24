import axios from 'axios'
import { ai3Generate } from './ai3.js'

export const aiGenerate = async ({ code, detected }) => {
  const prompt = `
Buatkan test runner untuk scraper berikut.
Output wajib JSON valid tanpa markdown.

Kode:
${code}

Bahasa: ${detected.language}

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
      timeout: 180000
    })

    const text = res.data?.result || res.data

    const parsed = JSON.parse(text)
    return parsed
  } catch {
    return await ai3Generate(prompt)
  }
}