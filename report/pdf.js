import PDFDocument from 'pdfkit'
import fs from 'fs-extra'
import path from 'path'
import { reportsDir } from '../system/workspace.js'

const cleanName = value => {
  return String(value || 'scraper-report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const writeSection = (doc, title, value) => {
  doc.moveDown(0.7)
  doc.fontSize(14).text(title, { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(10).text(String(value || '-'), {
    align: 'left'
  })
}

export const buildPdf = async report => {
  await fs.ensureDir(reportsDir)

  const fileName = `${cleanName(report.title)}-${Date.now()}.pdf`
  const filePath = path.join(reportsDir, fileName)

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4'
  })

  const stream = fs.createWriteStream(filePath)
  doc.pipe(stream)

  doc.fontSize(20).text(report.title || 'Scraper Test Report', {
    align: 'center'
  })

  doc.moveDown()
  doc.fontSize(12).text(`Status: ${report.status || 'unknown'}`)
  doc.text(`Generated At: ${new Date().toISOString()}`)

  writeSection(doc, 'Summary', report.summary)
  writeSection(doc, 'Scraper Explanation', report.scraper_explanation)
  writeSection(doc, 'Output Explanation', report.output_explanation)
  writeSection(doc, 'Performance', report.performance)
  writeSection(doc, 'Dependencies', report.dependencies)
  writeSection(doc, 'Errors', report.errors)
  writeSection(doc, 'Suggestions', report.suggestions)

  doc.end()

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })

  return filePath
}