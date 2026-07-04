import { NextRequest, NextResponse } from 'next/server'
import { Lehrstelle } from '@/types'
import { searchLehrstellen } from '@/lib/serpapi'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const FALLBACK_RESULTS: Lehrstelle[] = [
  {
    id: 'demo-1',
    firma: 'Musterfirma AG',
    beruf: 'Informatiker EFZ',
    kanton: 'ZH',
    stadt: 'Zürich',
    telefon: '+41 44 123 45 67',
    email: 'jobs@musterfirma.ch',
    website: 'https://musterfirma.ch',
    beschreibung: 'Moderne IT-Firma mit Lehrstellen im Bereich Informatik.',
    url: 'https://musterfirma.ch/karriere',
    quelle: 'Fallback',
  },
  {
    id: 'demo-2',
    firma: 'Tech Campus GmbH',
    beruf: 'Informatiker EFZ',
    kanton: 'BE',
    stadt: 'Bern',
    telefon: '+41 31 765 43 21',
    email: 'ausbildung@techcampus.ch',
    website: 'https://techcampus.ch',
    beschreibung: 'Aufstrebendes Technologieunternehmen mit einem praxisnahen Lehrbetrieb.',
    url: 'https://techcampus.ch/karriere',
    quelle: 'Fallback',
  },
]

type CachedSearch = {
  results: unknown
  expires_at: string
}

async function getCachedSearch(cacheKey: string): Promise<CachedSearch | null> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('search_cache')
      .select('results, expires_at')
      .eq('cache_key', cacheKey)
      .maybeSingle()

    if (error) {
      console.warn('Search cache read failed:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.warn('Search cache unavailable:', err)
    return null
  }
}

async function setCachedSearch(cacheKey: string, beruf: string, kanton: string | undefined, results: Lehrstelle[]) {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('search_cache').upsert({
      cache_key: cacheKey,
      beruf,
      kanton: kanton ?? null,
      results,
      expires_at: null, // never expires
    })

    if (error) console.warn('Search cache write failed:', error.message)
  } catch (err) {
    console.warn('Search cache write unavailable:', err)
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const beruf = searchParams.get('beruf')?.trim()
  const kanton = searchParams.get('kanton')?.trim()
  const seite = parseInt(searchParams.get('seite') ?? '1')

  if (!beruf) return NextResponse.json({ error: 'Beruf fehlt' }, { status: 400 })

  const cacheKey = `${beruf.toLowerCase()}-${(kanton ?? '').toLowerCase()}-${seite}`
  const cached = await getCachedSearch(cacheKey)

  if (cached && (!cached.expires_at || new Date(cached.expires_at) > new Date())) {
    if (Array.isArray(cached.results) && cached.results.length > 0) {
      return NextResponse.json({ results: cached.results, cached: true })
    }
    return NextResponse.json({ results: FALLBACK_RESULTS, cached: false, fallback: true, warning: 'Fallback-Ergebnisse, weil die gespeicherte Suche keine Einträge liefert.' })
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

    if (results.length === 0) {
      return NextResponse.json({ results: FALLBACK_RESULTS, cached: false, fallback: true, warning: 'Fallback-Ergebnisse, weil die Suche keine Einträge liefert.' })
    }

    await setCachedSearch(cacheKey, beruf, kanton, results)

    return NextResponse.json({ results, cached: false })
  } catch (err) {
    console.error('Suche Fehler:', err)
    if (cached) {
      return NextResponse.json({ results: cached.results, cached: true, stale: true, warning: 'Alte Ergebnisse, weil die Suche aktuell nicht verfügbar ist.' })
    }

    return NextResponse.json({ results: FALLBACK_RESULTS, cached: false, fallback: true, warning: 'Fallback-Ergebnisse, weil die externe Suche aktuell nicht verfügbar ist.' })
  }
}
