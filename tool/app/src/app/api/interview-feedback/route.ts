import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { question, answer, beruf } = await req.json()
  if (!question || !answer) {
    return NextResponse.json({ error: 'Question and answer required' }, { status: 400 })
  }
  if (answer.trim().length < 10) {
    return NextResponse.json({ score: 0, feedback: 'Antwort zu kurz.', strengths: [], improvements: ['Schreibe eine vollständige Antwort.'] })
  }

  const prompt = `Du bewertest die Antwort eines Lehrstellenbewerbers auf eine Vorstellungsgespräch-Frage.

Beruf: ${beruf || 'Allgemein'}
Frage: ${question}
Antwort des Bewerbers: ${answer}

Bewerte die Antwort und antworte NUR als JSON:
{
  "score": <Zahl 0-100>,
  "feedback": "<1-2 Sätze Gesamtfeedback>",
  "strengths": ["<Stärke 1>", "<Stärke 2>"],
  "improvements": ["<Verbesserung 1>", "<Verbesserung 2>"]
}

Kriterien: Relevanz, Konkretheit, Authentizität, Überzeugungskraft. Sei konstruktiv und ermutigend.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err) {
    console.error('Interview feedback error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
