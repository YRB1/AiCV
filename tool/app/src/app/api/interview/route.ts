import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { beruf } = await req.json()
  if (!beruf) return NextResponse.json({ error: 'Beruf required' }, { status: 400 })

  const prompt = `Erstelle 6 typische Vorstellungsgespräch-Fragen für eine Schweizer Lehrstelle als "${beruf}".

Antwort NUR als JSON-Array:
[
  {
    "question": "Die Frage auf Deutsch",
    "answer": "Eine gute Musterantwort (2-4 Sätze, authentisch und jugendgerecht)",
    "tip": "Ein kurzer Tipp für den Bewerber (max. 1 Satz)"
  }
]

Die Fragen sollen praxisnah sein und typische Themen abdecken: Motivation, Stärken/Schwächen, Berufsspezifisches, Teamarbeit, Zukunftspläne.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')
    const questions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ questions })
  } catch (err) {
    console.error('Interview generate error:', err)
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}
