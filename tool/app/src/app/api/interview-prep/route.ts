import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { firma, beruf, beschreibung, cvText } = await req.json()
  if (!firma || !beruf) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Generate interview preparation for a Swiss apprenticeship interview.

Company: ${firma}
Role: ${beruf}
Job description: ${beschreibung ?? 'Not provided'}
Applicant CV summary: ${cvText ? cvText.slice(0, 1000) : 'Not provided'}

Return a JSON object with:
- "questions": array of 8 interview questions (mix of personal, technical, motivational), each with:
  - "question": the question text
  - "category": one of "Motivation", "Personal", "Technical", "Situational"
  - "tip": a 1-sentence tip for answering this question well
- "company_research": array of 3 things to research about the company before the interview
- "what_to_wear": one sentence dress code advice for a Swiss apprenticeship interview
- "opening_line": a strong opening line to introduce yourself at the start of the interview

Respond ONLY with valid JSON, no markdown.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (err) {
    console.error('Interview prep error:', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
