import {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
} from 'docx'
import { formatDocxName } from './utils'

export interface DocxData {
  firma: string
  beruf: string
  bewerbungstext: string
  vorname: string
  nachname: string
  wohnort: string
  datum?: string
}

export async function generateDocx(data: DocxData): Promise<{ buffer: Buffer; filename: string }> {
  const datum = data.datum ?? new Date().toLocaleDateString('de-CH', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const paragraphs = data.bewerbungstext
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => new Paragraph({
      children: [new TextRun({ text: line, font: 'Calibri', size: 24 })],
      spacing: { after: 200 },
    }))

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: `${data.vorname} ${data.nachname}`, bold: true, font: 'Calibri', size: 24 }),
          ],
        }),
        new Paragraph({
          children: [new TextRun({ text: data.wohnort, font: 'Calibri', size: 24 })],
        }),
        new Paragraph({
          children: [new TextRun({ text: datum, font: 'Calibri', size: 24 })],
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Bewerbung als ${data.beruf}`, bold: true, font: 'Calibri', size: 28 }),
          ],
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.LEFT,
          spacing: { after: 400 },
        }),
        ...paragraphs,
        new Paragraph({
          children: [new TextRun({ text: 'Mit freundlichen Grüssen', font: 'Calibri', size: 24 })],
          spacing: { before: 600 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${data.vorname} ${data.nachname}`, font: 'Calibri', size: 24 }),
          ],
          spacing: { before: 400 },
        }),
      ],
    }],
  })

  const buffer = Buffer.from(await Packer.toBuffer(doc))
  const filename = formatDocxName(data.firma, data.beruf)
  return { buffer, filename }
}