import axios from 'axios'

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

  const res = await axios.get('https://api.ootaizumi.web.id/ai/copilot', {
    params: { prompt }
  })

  let text = res.data?.result || res.data || ''

  try {
    const json = JSON.parse(text)
    return json
  } catch {
    return null
  }
}