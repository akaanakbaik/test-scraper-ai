import fs from 'fs-extra'
import axios from 'axios'
import FormData from 'form-data'

export const uploadFile = async filePath => {
  const form = new FormData()
  form.append('file', fs.createReadStream(filePath))

  const res = await axios.post('https://api.kabox.my.id/api/upload', form, {
    headers: {
      ...form.getHeaders(),
      'x-expire': '1d'
    },
    timeout: 120000
  })

  if (!res.data?.url) {
    throw new Error(JSON.stringify(res.data, null, 2))
  }

  return res.data.url
}