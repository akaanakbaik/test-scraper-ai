import PDFDocument from 'pdfkit'
import fs from 'fs-extra'
import path from 'path'
import { reportsDir } from '../system/workspace.js'

const clean = text => String(text || '').replace(/\s+/g, ' ').trim()

const section = (doc, title, content) => {
  doc.moveDown(1)
  doc.fontSize(14).fillColor('#2563eb').text(title)
  doc.moveDown(0.3)
  doc.fontSize(10).fillColor('#111').text(content || '-', {
    lineGap: 2
  })
}

const divider = doc => {
  doc.moveDown(0.5)
  doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke()
}

export const buildPdf = async report => {
  await fs.ensureDir(reportsDir)

  const filePath = path.join(reportsDir, `${Date.now()}.pdf`)

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4'
  })

  const stream = fs.createWriteStream(filePath)
  doc.pipe(stream)

  doc.fontSize(20).fillColor('#111').text(report.title || 'Scraper Test Report', {
    align: 'center'
  })

  doc.moveDown(0.5)

  doc.fontSize(10).fillColor('#666').text(`Generated: ${new Date().toLocaleString()}`, {
    align: 'center'
  })

  doc.moveDown(1)

  doc.fontSize(12).fillColor(report.status === 'success' ? '#16a34a' : '#dc2626')
    .text(`Status: ${report.status?.toUpperCase()}`, { align: 'center' })

  divider(doc)

  section(doc, 'Summary', clean(report.summary))
  divider(doc)

  section(doc, 'Scraper Analysis', clean(report.scraper_explanation))
  divider(doc)

  section(doc, 'Output Analysis', clean(report.output_explanation))
  divider(doc)

  section(doc, 'Performance', clean(report.performance))
  divider(doc)

  section(doc, 'Dependencies', clean(report.dependencies))
  divider(doc)

  section(doc, 'Errors', clean(report.errors))
  divider(doc)

  section(doc, 'Suggestions', clean(report.suggestions))

  doc.end()

  await new Promise(resolve => stream.on('finish', resolve))

  return filePath
}