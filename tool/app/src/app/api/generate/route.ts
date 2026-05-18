import { NextRequest, NextResponse } from 'next/server'
import { generateBewerbung } from '@/lib/anthropic'
import { createServiceClient } from '@/lib/supabase'
import { getDailyLimit, Tier } from '@/lib/plans'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lehrstelle, userId } = body

  if (!lehrstelle || !userId) {
    return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Load user profile + script
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!profile?.demo_script) {
    return NextResponse.json({ error: 'Bitte zuerst Script unter "Skript" speichern.' }, { status: 400 })
  }

  // Check tier-based daily limit
  const tier = (profile.subscription_tier ?? 'basic') as Tier
  const dailyLimit = getDailyLimit(tier)

  if (dailyLimit !== null) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString())

    if ((count ?? 0) >= dailyLimit) {
      return NextResponse.json({
        error: `Tageslimit erreicht (${dailyLimit}/Tag). Upgrade für mehr Bewerbungen.`,
        limitReached: true,
        tier,
        limit: dailyLimit,
      }, { status: 429 })
    }
  }

  // Try to extract contact info from job URL via Jina AI
  if (lehrstelle.url) {
    try {
      // Strip UTM params for cleaner page read
      const cleanUrl = lehrstelle.url.split('?')[0]
      const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`, {
        headers: { 'Accept': 'text/plain' },
        signal: AbortSignal.timeout(10000),
      })
      if (jinaRes.ok) {
        const text = await jinaRes.text()
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@(?!.*\.(png|jpg|svg|gif))[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0]
        const phoneMatch = text.match(/(\+41|0)[\s\-]?(\d{2})[\s\-]?(\d{3})[\s\-]?(\d{2})[\s\-]?(\d{2})/)?.[0]
        if (emailMatch && !emailMatch.includes('example') && !emailMatch.includes('yousty')) lehrstelle.email = emailMatch
        if (phoneMatch) lehrstelle.telefon = phoneMatch
      }
    } catch { /* ignore timeout */ }
  }

  try {
    const result = await generateBewerbung(lehrstelle, profile.demo_script, {
      vorname: profile.vorname ?? '',
      nachname: profile.nachname ?? '',
      schule: profile.schule ?? '',
      jahrgang: profile.jahrgang ?? '',
      wohnort: profile.wohnort ?? '',
    })

    await supabase.from('leads').upsert({
      user_id: userId,
      firma: lehrstelle.firma,
      beruf: lehrstelle.beruf,
      stadt: lehrstelle.stadt,
      kanton: lehrstelle.kanton,
      email: lehrstelle.email ?? null,
      telefon: lehrstelle.telefon ?? null,
      website: lehrstelle.website ?? null,
      url: lehrstelle.url ?? null,
      status: 'neu',
      generated_message: result.message,
    }, { onConflict: 'user_id,firma,beruf' })

    return NextResponse.json({
      ...result,
      email: lehrstelle.email ?? null,
      telefon: lehrstelle.telefon ?? null,
    })
  } catch (err) {
    console.error('Generate Fehler:', err)
    return NextResponse.json({ error: 'Generierung fehlgeschlagen' }, { status: 500 })
  }
}