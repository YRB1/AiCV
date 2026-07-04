import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SYSTEM = `You are Blitz Bot, the friendly help assistant for Blitzbewerbung.ch — an AI platform helping Swiss students find apprenticeships (Lehrstellen). Always reply in the same language as the user (German or English). Keep answers short (2-4 sentences), friendly and encouraging. Never use markdown like ** or ##. Key facts: free tier available, Pro subscription for unlimited features; searches Google Jobs, company websites and cantonal portals across all 26 Swiss cantons; generates personalised cover letters (Motivationsschreiben) in German and English; accepts Visa, Mastercard, Amex, TWINT via Stripe; contact hallo@blitzbewerbung.ch for support. If you don't know something specific, suggest emailing hallo@blitzbewerbung.ch.`

function corsHeaders(origin: string) {
  const allowed = origin.includes('blitzbewerbung.ch') || origin.includes('localhost')
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://blitzbewerbung.ch',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') ?? ''
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin') ?? ''
  const headers = corsHeaders(origin)

  try {
    const { message } = await req.json()
    if (!message || typeof message !== 'string' || message.length > 500) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400, headers })
    }

    const key = process.env.GEMINI_API_KEY
    if (!key) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503, headers })
    }

    for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM }] },
            contents: [{ role: 'user', parts: [{ text: message }] }],
            generationConfig: { maxOutputTokens: 220, temperature: 0.7 },
          }),
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      const reply: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (reply) return NextResponse.json({ reply }, { headers })
    }

    throw new Error('No reply')
  } catch {
    return NextResponse.json({ error: 'AI unavailable' }, { status: 503, headers })
  }
}
