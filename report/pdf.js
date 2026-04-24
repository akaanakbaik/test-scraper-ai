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

const textValue = value => {
  if (value === undefined || value === null || value === '') return '-'
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

const addHeader = (doc, report) => {
  const success = report.status === 'success'

  doc.rect(0, 0, doc.page.width, 110).fill('#111827')
  doc.fillColor('#ffffff').fontSize(22).text(report.title || 'Scraper Test Report', 40, 32, {
    width: doc.page.width - 80,
    align: 'center'
  })

  doc.fontSize(10).fillColor('#d1d5db').text(`Generated At: ${new Date().toISOString()}`, 40, 66, {
    width: doc.page.width - 80,
    align: 'center'
  })

  doc.roundedRect(232, 82, 130, 24, 8).fill(success ? '#16a34a' : '#dc2626')
  doc.fillColor('#ffffff').fontSize(11).text(String(report.status || 'unknown').toUpperCase(), 232, 89, {
    width: 130,
    align: 'center'
  })

  doc.y = 140
}

const sectionTitle = (doc, title) => {
  if (doc.y > 720) doc.addPage()
  doc.moveDown(0.7)
  doc.fillColor('#2563eb').fontSize(14).text(title)
  doc.moveDown(0.25)
  doc.strokeColor('#dbeafe').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.45)
}

const paragraph = (doc, value) => {
  doc.fillColor('#111827').fontSize(10).text(textValue(value), {
    width: 515,
    lineGap: 3,
    align: 'left'
  })
}

const codeBlock = (doc, value) => {
  const text = textValue(value)
  const lines = text.split('\n')
  const pageBottom = 760

  doc.font('Courier').fontSize(8).fillColor('#111827')

  for (const line of lines) {
    if (doc.y > pageBottom) {
      doc.addPage()
      doc.font('Courier').fontSize(8).fillColor('#111827')
    }

    doc.text(line || ' ', 45, doc.y, {
      width: 505,
      lineGap: 2
    })
  }

  doc.font('Helvetica')
}

const section = (doc, title, value) => {
  sectionTitle(doc, title)
  paragraph(doc, value)
}

export const buildPdf = async report => {
  await fs.ensureDir(reportsDir)

  const fileName = `${cleanName(report.title)}-${Date.now()}.pdf`
  const filePath = path.join(reportsDir, fileName)

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true
  })

  const stream = fs.createWriteStream(filePath)
  doc.pipe(stream)

  addHeader(doc, report)

  section(doc, 'Summary', report.summary)
  section(doc, 'Scraper Analysis', report.scraper_explanation)
  section(doc, 'Output Analysis', report.output_explanation)
  section(doc, 'Performance', report.performance)
  section(doc, 'Dependencies', report.dependencies)
  section(doc, 'Errors', report.errors)

  sectionTitle(doc, 'Raw Test Output')
  codeBlock(doc, report.raw_output || report.rawOutput || '-')

  section(doc, 'Suggestions', report.suggestions)

  const range = doc.bufferedPageRange()

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)
    doc.fontSize(8).fillColor('#6b7280').text(`Page ${i + 1} of ${range.count}`, 40, 775, {
      width: 515,
      align: 'center'
    })
  }

  doc.end()

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })

  return filePath
}