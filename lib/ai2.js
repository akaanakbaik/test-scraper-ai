import axios from 'axios'
import { ai3Report } from './ai3.js'

export const aiReport = async data => {
  const body = {
    messages: [
      {
        role: 'user',
        parts: [
          {
            text: `
Buat laporan lengkap scraper test dalam format JSON.

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
          }
        ]
      }
    ]
  }

  try {
    const res = await axios.post('https://api.ootaizumi.web.id/ai/gemini-v2', body, {
      timeout: 180000
    })

    const text = res.data?.result || res.data
    return JSON.parse(text)
  } catch {
    return await ai3Report(data)
  }
}