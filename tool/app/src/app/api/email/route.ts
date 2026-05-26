import { NextRequest, NextResponse } from 'next/server'
import { isJobBoardUrl } from '@/lib/serpapi'

export const dynamic = 'force-dynamic'

const SERPAPI_KEY = process.env.SERPAPI_KEY!

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
// Swiss phone: +41 XX XXX XX XX / 0XX XXX XX XX / various spacing
const PHONE_RE = /(?:\+41|0)[\s\-.]?(?:\d{2})[\s\-.]?\d{3}[\s\-.]?\d{2}[\s\-.]?\d{2}/g

const BAD_EMAIL = (e: string) =>
  ['yousty', 'example', 'noreply', 'sentry', 'linkedin', 'wixpress',
   'google', 'schema', 'instagram', 'facebook', 'twitter', 'whatsapp',
   '.png', '.jpg', '.svg', 'cloudflare', 'swisstopo', '@2x',
   'no-reply', 'donotreply', 'mailer', 'bounce', 'support@stripe',
   'newsletter', 'unsubscribe', 'notifications@', 'alerts@'].some(b => e.includes(b))

// Rank emails by how likely they are the correct apprenticeship contact
// Higher score = more likely correct
const EMAIL_RANK = [
  ['ausbildung', 10], ['lehrstelle', 10], ['berufsbildung', 10], ['lernende', 9],
  ['apprentice', 9], ['hr@', 8], ['personal@', 8], ['personalwesen', 8],
  ['recruiting', 8], ['bewerbung', 8], ['karriere', 7], ['jobs@', 7],
  ['administration', 5], ['kontakt', 4], ['contact', 4], ['info@', 3], ['hello@', 3],
] as [string, number][]

function rankEmail(e: string): number {
  const lower = e.toLowerCase()
  for (const [kw, score] of EMAIL_RANK) if (lower.includes(kw)) return score
  return 2
}

const BAD_PHONE = (p: string) => {
  const digits = p.replace(/\D/g, '')
  // too short, emergency numbers, or obviously fake
  if (digits.length < 9) return true
  if (/^(117|118|144|145|147|112)$/.test(digits)) return true
  return false
}

function pickEmail(text: string): string | null {
  const all = (text.match(EMAIL_RE) ?? []).filter(e => !BAD_EMAIL(e))
  if (!all.length) return null
  // Return the highest-ranked email (most likely to be the correct contact)
  return all.reduce((best, e) => rankEmail(e) >= rankEmail(best) ? e : best, all[0])
}

function pickPhone(text: string): string | null {
  const matches = text.match(PHONE_RE) ?? []
  return matches.find(p => !BAD_PHONE(p)) ?? null
}

function extractAll(text: string): { email: string | null; telefon: string | null } {
  return { email: pickEmail(text), telefon: pickPhone(text) }
}

async function jinaRead(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      signal: AbortSignal.timeout(7000),
      headers: { 'Accept': 'text/plain' },
    })
    return res.ok ? res.text() : null
  } catch { return null }
}

// Generate multiple domain candidates from company name
function guessDomains(firma: string): string[] {
  const REMOVE = /\b(AG|GmbH|SA|Group|International|Gruppe|Holding|Ltd|Inc|Co\.?|Suisse|Schweiz|CH|Regio|Region|Bank|Versicherung)\b/gi
  const clean = firma
    .replace(REMOVE, '').replace(/[()&+,\.]/g, ' ').trim()
    .split(/\s+/)
    .map(w => w.toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9-]/g, ''))
    .filter(w => w.length >= 2)

  if (!clean.length) return []

  const candidates: string[] = []
  const first = clean[0]
  const joined = clean.slice(0, 3).join('')
  const hyphenated = clean.slice(0, 3).join('-')

  // Try all TLD variants
  for (const tld of ['.ch', '.com', '.swiss', '.net']) {
    candidates.push(`${first}${tld}`)
    if (clean.length > 1) {
      candidates.push(`${joined}${tld}`)
      candidates.push(`${hyphenated}${tld}`)
    }
  }

  return [...new Set(candidates)]
}

const CONTACT_PATHS = [
  '/kontakt', '/contact', '/lehrstellen', '/ausbildung', '/berufsbildung',
  '/karriere', '/jobs', '/impressum', '/imprint', '/uber-uns', '/ueber-uns',
  '/about', '/team', '/lernende', '/apprenticeship',
]

async function tryWebsite(base: string): Promise<{ email: string | null; telefon: string | null }> {
  let found = { email: null as string | null, telefon: null as string | null }

  // Homepage first
  const home = await jinaRead(base)
  if (home) {
    const r = extractAll(home)
    found = { email: r.email ?? found.email, telefon: r.telefon ?? found.telefon }
    if (found.email && found.telefon) return found

    // Find internal links matching apprenticeship/contact keywords
    const kw = /lehr|ausbildung|berufsbildung|lernende|kontakt|contact|impressum/i
    const links = (home.match(/https?:\/\/[^\s"')<>]+/g) ?? [])
      .filter(u => kw.test(u) && !isJobBoardUrl(u))
      .slice(0, 4)

    for (const link of links) {
      const page = await jinaRead(link.split('?')[0])
      if (!page) continue
      const r2 = extractAll(page)
      found = { email: r2.email ?? found.email, telefon: r2.telefon ?? found.telefon }
      if (found.email && found.telefon) return found
    }
  }

  // Try common paths
  for (const path of CONTACT_PATHS) {
    if (found.email && found.telefon) break
    const page = await jinaRead(base + path)
    if (!page) continue
    const r = extractAll(page)
    found = { email: r.email ?? found.email, telefon: r.telefon ?? found.telefon }
  }

  return found
}

// SerpAPI Google search for email AND phone
async function tryGoogle(firma: string): Promise<{ email: string | null; telefon: string | null }> {
  const domains = guessDomains(firma)
  const domainHint = domains[0] ? `site:${domains[0]} OR "@${domains[0]}"` : ''

  const queries = [
    `"${firma}" ausbildung lehrstelle email bewerbung Schweiz`,
    `"${firma}" kontakt telefon email Schweiz`,
    domainHint ? `${domainHint} kontakt email telefon` : `"${firma}" telefon impressum`,
  ].filter(Boolean)

  let email: string | null = null
  let telefon: string | null = null

  for (const q of queries) {
    if (email && telefon) break
    try {
      const url = new URL('https://serpapi.com/search.json')
      url.searchParams.set('engine', 'google')
      url.searchParams.set('q', q)
      url.searchParams.set('num', '5')
      url.searchParams.set('hl', 'de')
      url.searchParams.set('gl', 'ch')
      url.searchParams.set('api_key', SERPAPI_KEY)

      const data = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) }).then(r => r.json())
      const text = (data.organic_results ?? [])
        .map((r: { snippet?: string; title?: string }) => `${r.snippet ?? ''} ${r.title ?? ''}`)
        .join(' ')

      email = email ?? pickEmail(text)
      telefon = telefon ?? pickPhone(text)
    } catch { /* */ }
  }

  return { email, telefon }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const firma = searchParams.get('firma') ?? ''
  const jobUrl = searchParams.get('url') ?? ''

  let email: string | null = null
  let telefon: string | null = null

  // 1. Try job URL directly (if it's a direct company URL, not a job board)
  if (jobUrl && !isJobBoardUrl(jobUrl)) {
    try {
      const base = new URL(jobUrl).origin
      const r = await tryWebsite(base)
      email = r.email ?? email
      telefon = r.telefon ?? telefon
    } catch { /* */ }
  }

  // 2. Try guessed company domains
  if (!email || !telefon) {
    const domains = guessDomains(firma)
    for (const domain of domains.slice(0, 3)) {
      if (email && telefon) break
      const r = await tryWebsite(`https://www.${domain}`)
      email = r.email ?? email
      telefon = r.telefon ?? telefon
    }
  }

  // 3. Google search fallback
  if (!email || !telefon) {
    const r = await tryGoogle(firma)
    email = r.email ?? email
    telefon = r.telefon ?? telefon
  }

  return NextResponse.json({ email: email ?? null, telefon: telefon ?? null })
}
