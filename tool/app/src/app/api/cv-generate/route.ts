import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { profile, format = 'json' } = await req.json()

  const prompt = `Create a professional Swiss apprenticeship CV for this person. Return ONLY valid JSON with this exact structure:

{
  "summary": "2-3 sentence professional summary",
  "education": [
    { "school": "School name", "degree": "Level/Type", "year": "Year range", "details": "Optional detail" }
  ],
  "experience": [
    { "company": "Company", "role": "Role", "period": "Period", "bullets": ["achievement 1", "achievement 2"] }
  ],
  "skills": ["skill1", "skill2", ...],
  "languages": ["German — Native", "English — B2", ...],
  "interests": "Hobbies and interests sentence"
}

Person's details:
- Name: ${profile.vorname} ${profile.nachname}
- Location: ${profile.wohnort || 'Switzerland'}
- School: ${profile.schule || 'Not specified'}
- Year: ${profile.jahrgang || 'Not specified'}
- Target role: ${profile.wunschberuf || 'Apprenticeship'}
- Phone: ${profile.telefon || ''}
- Email: ${profile.email || ''}
- About me: ${profile.about_me || ''}
- Skills: ${(profile.skills || []).join(', ') || 'Not specified'}
- Languages: ${(profile.languages || []).join(', ') || 'Not specified'}
- Hobbies: ${profile.hobbies || ''}
- CV text (if provided): ${profile.cv_text ? profile.cv_text.slice(0, 2000) : 'None'}

Generate realistic, professional content. If info is missing, create plausible placeholder content appropriate for a Swiss apprenticeship applicant. Write in a mix of German and English appropriate for Switzerland. Respond ONLY with valid JSON.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    const cvData = JSON.parse(jsonMatch[0])

    if (format === 'docx') {
      const doc = buildDocx(profile, cvData)
      const buffer = Buffer.from(await Packer.toBuffer(doc))
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="CV_${profile.vorname}_${profile.nachname}.docx"`,
        },
      })
    }

    return NextResponse.json({ cv: cvData })
  } catch (err) {
    console.error('CV generate error:', err)
    return NextResponse.json({ error: 'CV generation failed' }, { status: 500 })
  }
}

function buildDocx(profile: Record<string, string>, cv: Record<string, unknown>) {
  const name = `${profile.vorname} ${profile.nachname}`.trim()
  const contact = [profile.email, profile.telefon, profile.wohnort].filter(Boolean).join('  |  ')

  const section = (title: string) => new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, color: '1a1a2e', font: 'Calibri' })],
    spacing: { before: 320, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '1a1a2e' } },
  })

  const bullet = (text: string) => new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 20, font: 'Calibri' })],
    spacing: { after: 60 },
  })

  const children: Paragraph[] = [
    // Header
    new Paragraph({
      children: [new TextRun({ text: name, bold: true, size: 36, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: contact, size: 18, color: '555555', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    // Summary
    section('Profile'),
    new Paragraph({
      children: [new TextRun({ text: cv.summary as string ?? '', size: 20, font: 'Calibri' })],
      spacing: { after: 100 },
    }),

    // Education
    section('Education'),
    ...((cv.education as Array<{school:string;degree:string;year:string;details?:string}>) ?? []).flatMap(e => [
      new Paragraph({
        children: [
          new TextRun({ text: e.school, bold: true, size: 20, font: 'Calibri' }),
          new TextRun({ text: `  ${e.year}`, size: 20, color: '666666', font: 'Calibri' }),
        ],
        spacing: { before: 100, after: 40 },
      }),
      new Paragraph({
        children: [new TextRun({ text: e.degree + (e.details ? ` — ${e.details}` : ''), size: 20, font: 'Calibri', italics: true })],
        spacing: { after: 80 },
      }),
    ]),

    // Experience
    ...((cv.experience as Array<{company:string;role:string;period:string;bullets:string[]}>) ?? []).length > 0 ? [
      section('Experience'),
      ...((cv.experience as Array<{company:string;role:string;period:string;bullets:string[]}>) ?? []).flatMap(e => [
        new Paragraph({
          children: [
            new TextRun({ text: e.company, bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: `  ${e.period}`, size: 20, color: '666666', font: 'Calibri' }),
          ],
          spacing: { before: 100, after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: e.role, size: 20, font: 'Calibri', italics: true })],
          spacing: { after: 60 },
        }),
        ...(e.bullets ?? []).map(b => bullet(b)),
      ]),
    ] : [],

    // Skills
    section('Skills'),
    new Paragraph({
      children: [new TextRun({ text: ((cv.skills as string[]) ?? []).join('   •   '), size: 20, font: 'Calibri' })],
      spacing: { after: 100 },
    }),

    // Languages
    section('Languages'),
    new Paragraph({
      children: [new TextRun({ text: ((cv.languages as string[]) ?? []).join('   •   '), size: 20, font: 'Calibri' })],
      spacing: { after: 100 },
    }),

    // Interests
    section('Interests'),
    new Paragraph({
      children: [new TextRun({ text: cv.interests as string ?? '', size: 20, font: 'Calibri' })],
    }),
  ]

  return new Document({ sections: [{ properties: {}, children }] })
}
