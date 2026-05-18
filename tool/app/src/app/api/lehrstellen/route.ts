import { NextRequest, NextResponse } from 'next/server'
import { searchLehrstellen } from '@/lib/serpapi'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const beruf = searchParams.get('beruf')?.trim()
  const kanton = searchParams.get('kanton')?.trim()
  const seite = parseInt(searchParams.get('seite') ?? '1')

  if (!beruf) return NextResponse.json({ error: 'Beruf fehlt' }, { status: 400 })

  const cacheKey = `${beruf.toLowerCase()}-${(kanton ?? '').toLowerCase()}-${seite}`
  const supabase = createServiceClient()

  const { data: cached } = await supabase
    .from('search_cache')
    .select('results, expires_at')
    .eq('cache_key', cacheKey)
    .single()

  if (cached && new Date(cached.expires_at) > new Date()) {
    return NextResponse.json({ results: cached.results, cached: true })
  }

  try {
    const raw = await searchLehrstellen({ beruf, kanton, seite })

    // Deduplicate by firma+beruf combination
    const seen = new Set<string>()
    const results = raw.filter(r => {
      const key = `${r.firma.toLowerCase()}|${r.beruf.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('search_cache').upsert({
      cache_key: cacheKey,
      beruf,
      kanton: kanton ?? null,
      results,
      expires_at: expiresAt,
    })

    return NextResponse.json({ results, cached: false })
  } catch (err) {
    console.error('Suche Fehler:', err)
    return NextResponse.json({ error: 'Suche fehlgeschlagen' }, { status: 500 })
  }
}