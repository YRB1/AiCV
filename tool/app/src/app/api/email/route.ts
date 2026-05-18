import { NextRequest, NextResponse } from 'next/server'
import { isJobBoardUrl } from '@/lib/serpapi'

export const dynamic = 'force-dynamic'

const SERPAPI_KEY = process.env.SERPAPI_KEY!
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const BAD = (e: string) =>
  ['yousty', 'example', 'noreply', 'sentry', 'linkedin', 'wixpress',
   'google', 'schema', 'instagram', 'facebook', 'twitter', '.png', '.jpg'].some(b => e.includes(b))

function pickEmail(text: string): string | null {
  return text.match(EMAIL_RE)?.find(e => !BAD(e)) ?? null
}

async function jinaRead(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, { signal: AbortSignal.timeout(6000) })
    return res.ok ? res.text() : null
  } catch { return null }
}

function guessDomain(firma: string): string | null {
  const REMOVE = /\b(AG|GmbH|SA|Group|International|Gruppe|Holding|Ltd|Inc|Co\.?|Suisse|Schweiz|CH)\b/gi
  const words = firma
    .replace(REMOVE, '').replace(/[()&+]/g, ' ').trim()
    .split(/\s+/)
    .map(w => w.toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length >= 2)
  return words[0] ? `${words[0]}.ch` : null
}

// Step 1: Try reading job URL or company website with Jina
async function tryJina(firma: string, directUrl?: string): Promise<string | null> {
  const urls: string[] = []
  if (directUrl && !isJobBoardUrl(directUrl)) {
    try { urls.push(new URL(directUrl).origin) } catch { /* */ }
  }
  const domain = guessDomain(firma)
  if (domain) urls.push(`https://www.${domain}`)

  for (const base of [...new Set(urls)]) {
    // Try homepage
    const home = await jinaRead(base)
    if (home) {
      const e = pickEmail(home)
      if (e) return e
      // Follow ausbildung/lehrstellen link
      const kw = /lehr|ausbildung|berufsbildung|lernende/i
      const link = (home.match(/https?:\/\/[^\s"')<>]+/g) ?? [])
        .find(u => kw.test(u) && !isJobBoardUrl(u))
      if (link) {
        const page = await jinaRead(link.split('?')[0])
        if (page) {
          const e2 = pickEmail(page)
          if (e2) return e2
        }
      }
      // Try common paths
      for (const path of ['/lehrstellen', '/ausbildung', '/karriere', '/kontakt']) {
        const page = await jinaRead(base + path)
        if (page) {
          const e3 = pickEmail(page)
          if (e3) return e3
        }
      }
    }
  }
  return null
}

// Step 2: Google search via SerpApi — finds emails from all indexed sources
async function tryGoogle(firma: string): Promise<string | null> {
  const domain = guessDomain(firma)
  const query = domain
    ? `"@${domain}" OR site:${domain} lehrstelle ausbildung email`
    : `"${firma}" lehrstelle ausbildung email bewerbung`

  const url = new URL('https://serpapi.com/search.json')
  url.searchParams.set('engine', 'google')
  url.searchParams.set('q', query)
  url.searchParams.set('num', '5')
  url.searchParams.set('hl', 'de')
  url.searchParams.set('gl', 'ch')
  url.searchParams.set('api_key', SERPAPI_KEY)

  try {
    const data = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) }).then(r => r.json())
    const snippets = (data.organic_results ?? [])
      .map((r: { snippet?: string; title?: string }) => `${r.snippet ?? ''} ${r.title ?? ''}`)
      .join(' ')
    return pickEmail(snippets)
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const firma = searchParams.get('firma') ?? ''
  const url = searchParams.get('url') ?? ''

  // Try Jina first (fast, free)
  const jinaEmail = await tryJina(firma, url)
  if (jinaEmail) return NextResponse.json({ email: jinaEmail })

  // Fallback: Google search via SerpApi
  const googleEmail = await tryGoogle(firma)
  return NextResponse.json({ email: googleEmail ?? null })
}