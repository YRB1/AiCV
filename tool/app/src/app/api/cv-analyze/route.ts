import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { cvText } = await req.json()
  if (!cvText?.trim()) return NextResponse.json({ error: 'No CV text provided' }, { status: 400 })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Analyse this CV and return a JSON object with:
- "skills": array of key skills (max 15, short labels like "Python", "Microsoft Office", "Teamwork")
- "improved_summary": a compelling 3-4 sentence professional summary for a Swiss apprenticeship applicant
- "strengths": array of 3 strengths found in the CV
- "suggestions": array of 3 specific improvements to make the CV stronger
- "career_advice": 2 sentences of career advice based on the CV content

CV TEXT:
${cvText.slice(0, 4000)}

Respond ONLY with valid JSON, no markdown.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err) {
    console.error('CV analyze error:', err)
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
  }
}
