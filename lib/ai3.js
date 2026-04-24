import axios from 'axios'

const parseSafe = text => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const ai3Generate = async prompt => {
  const res = await axios.get('https://apis.prexzyvilla.site/ai/copilot-think', {
    params: { text: prompt },
    timeout: 180000
  })

  const text = res.data?.text || ''

  const parsed = parseSafe(text)

  if (parsed) return parsed

  return {
    scraper_name: 'fallback',
    language: 'javascript',
    dependencies: [],
    files: [],
    run_command: ''
  }
}

export const ai3Report = async data => {
  const prompt = `
Buat laporan JSON dari data berikut:
${JSON.stringify(data, null, 2)}
`

  const res = await axios.get('https://apis.prexzyvilla.site/ai/copilot-think', {
    params: { text: prompt },
    timeout: 180000
  })

  const text = res.data?.text || ''

  const parsed = parseSafe(text)

  if (parsed) return parsed

  return {
    title: 'Fallback Report',
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