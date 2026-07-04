import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM = `Du bist Blitz-Berater, ein freundlicher und direkter Karriereberater spezialisiert auf Schweizer Berufslehren (Lehrstellen). Du hilfst Jugendlichen dabei, die richtige Ausbildung zu finden, Bewerbungen zu verbessern, und sich auf Vorstellungsgespräche vorzubereiten.

Wichtige Punkte:
- Du kennst das Schweizer Bildungssystem: EFZ, EBA, Berufsmaturität (BM), Fachhochschulen
- Du kennst typische Lehrberufe: Kaufmann/KV, Informatiker, Mediamatiker, Polymechaniker, FaGe, Koch, Detailhandelsangestellter, Logistiker, Maurer usw.
- Du gibst konkrete, praktische Ratschläge — keine leeren Phrasen
- Du antwortest auf Deutsch, es sei denn, der Nutzer schreibt auf Englisch
- Halte Antworten kurz und hilfreich (max. 3–4 Sätze, ausser wenn mehr Detail nötig ist)
- Du machst keine Versprechen über Jobangebote oder Gehälter — gib nur allgemeine Richtwerte

Wenn jemand über eine Bewerbung spricht, frage nach dem Lehrberuf und dem Unternehmen, damit du konkrete Tipps geben kannst.`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages required' }, { status: 400 })
  }

  const lastMsg = messages[messages.length - 1]?.content
  if (!lastMsg || typeof lastMsg !== 'string' || lastMsg.length > 2000) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
  }

  const formatted = messages.slice(-10).map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM,
      messages: formatted,
    })
    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Advisor error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
