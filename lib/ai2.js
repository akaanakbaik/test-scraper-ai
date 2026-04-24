import axios from 'axios'

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

  const res = await axios.post('https://api.ootaizumi.web.id/ai/gemini-v2', body)

  let text = res.data?.result || res.data || ''

  try {
    const json = JSON.parse(text)
    return json
  } catch {
    return {
      title: 'Report',
      status: 'unknown',
      summary: text,
      scraper_explanation: '',
      output_explanation: '',
      performance: '',
      dependencies: '',
      errors: '',
      suggestions: ''
    }
  }
}