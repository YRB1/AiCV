import { Lehrstelle } from '@/types'

const GATEWAY_BASE = 'https://junior.gateway.one'
const SERPAPI_KEY = process.env.SERPAPI_KEY

const KANTON_NAMES: Record<string, string> = {
  AG: 'Aargau', AI: 'Appenzell', AR: 'Appenzell', BE: 'Bern',
  BL: 'Basel-Landschaft', BS: 'Basel', FR: 'Fribourg', GE: 'Genf',
  GL: 'Glarus', GR: 'Graubünden', JU: 'Jura', LU: 'Luzern',
  NE: 'Neuenburg', NW: 'Nidwalden', OW: 'Obwalden', SG: 'St. Gallen',
  SH: 'Schaffhausen', SO: 'Solothurn', SZ: 'Schwyz', TG: 'Thurgau',
  TI: 'Tessin', UR: 'Uri', VD: 'Waadt', VS: 'Wallis', ZG: 'Zug', ZH: 'Zürich',
}

const RECRUITER_DOMAINS = [
  'convit.ch', 'yousty.ch', 'lehrstellenboerse.ch', 'jobup.ch', 'jobs.ch',
  'indeed.com', 'linkedin.com', 'scout24.ch', 'monster.ch', 'glassdoor.com',
  'jobagent.ch', 'stellenanzeigen.de', 'karriere.ch', 'jobscout24.ch',
  'adecco.ch', 'manpower.ch', 'randstad.ch', 'tempodrei.ch', 'perret.ch',
  'noreply', 'no-reply', 'donotreply', 'example',
]

const JUNK_PHONES = ['0079941352', '0799413527', '0800800', '+41800']

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function extractEmail(text: string): string | undefined {
  const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? []
  return emails.find(e => {
    const lower = e.toLowerCase()
    return !RECRUITER_DOMAINS.some(d => lower.includes(d)) &&
      !lower.endsWith('.png') && !lower.endsWith('.jpg') && !lower.endsWith('.svg')
  })
}

function extractPhone(text: string): string | undefined {
  const phones = text.match(/(\+41|0041|0)[\s\-.]?(\d{2})[\s\-.]?(\d{3})[\s\-.]?(\d{2})[\s\-.]?(\d{2})/g) ?? []
  return phones.find(p => {
    const digits = p.replace(/[\s\-.]/g, '')
    return !JUNK_PHONES.some(j => digits.startsWith(j))
  })
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function extractKanton(location: string): string {
  for (const [abbr, name] of Object.entries(KANTON_NAMES)) {
    if (location.includes(name)) return abbr
  }
  return 'CH'
}

function dedupeLehrstellen(items: Lehrstelle[]): Lehrstelle[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.url?.trim().toLowerCase() || `${item.firma}|${item.beruf}|${item.stadt}`.toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// --- gateway.one scraping ---
interface GatewayJob { url: string; beruf: string; firma: string; stadt: string; location: string; rawHtml: string }
interface GatewaySchema {
  description?: string
  hiringOrganization?: { legalName?: string; name?: string; url?: string }
  jobLocation?: { address?: { streetAddress?: string; postalCode?: string; addressLocality?: string; addressRegion?: string } }
  title?: string
  url?: string
}

interface SerpApiJob {
  job_id?: string
  title?: string
  company_name?: string
  location?: string
  description?: string
  apply_options?: { title?: string; link?: string }[]
}

async function fetchGatewayPage(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    if (!res.ok) return ''
    return await res.text()
  } catch (err) {
    console.error('gateway.one fetch error', err)
    return ''
  }
}

function parseGatewayJobs(html: string): GatewayJob[] {
  const jobs: GatewayJob[] = []
  const anchorRegex = /<a[^>]*class=["'][^"'>]*gw-job-item-link[^"'>]*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null

  while ((match = anchorRegex.exec(html))) {
    const href = match[1]
    const inner = match[2]
    const title = stripHtml(String(inner.match(/class=["']gw-job-item-title["'][^>]*>([\s\S]*?)<\//i)?.[1] ?? '')).trim()
    const company = stripHtml(String(inner.match(/class=["']gw-job-item-customer-name["'][^>]*>([\s\S]*?)<\//i)?.[1] ?? '')).trim()
    const location = stripHtml(String(inner.match(/class=["']gw-job-item-location["'][^>]*>([\s\S]*?)<\//i)?.[1] ?? '')).trim()
    if (!title && !company) continue
    jobs.push({ url: href.startsWith('http') ? href : `${GATEWAY_BASE}${href}`, beruf: title || company, firma: company || 'Unbekannt', stadt: location, location, rawHtml: inner })
  }

  return jobs
}

async function fetchGatewayJobDetail(jobUrl: string) {
  const html = await fetchGatewayPage(jobUrl)
  if (!html) return null
  const schemaMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  let schema: GatewaySchema | null = null
  if (schemaMatch) {
    try { schema = JSON.parse(schemaMatch[1]) as GatewaySchema } catch { schema = null }
  }
  const description = schema?.description ? stripHtml(String(schema.description)) : stripHtml(html)
  const companyName = schema?.hiringOrganization?.legalName || schema?.hiringOrganization?.name || ''
  const address = schema?.jobLocation?.address || {}
  const street = address.streetAddress ?? ''
  const postal = address.postalCode ?? ''
  const city = address.addressLocality ?? ''
  const region = address.addressRegion ?? ''
  return {
    jobLocation: { street, postal, city, region },
    companyName,
    description,
    companyUrl: schema?.hiringOrganization?.url ?? schema?.url ?? jobUrl,
    email: extractEmail(html),
    telefon: extractPhone(html),
    adresse: [street, postal, city, region].filter(Boolean).join(', '),
    title: schema?.title ?? '',
  }
}

async function searchGatewayJobs(params: { beruf: string; kanton?: string; seite?: number }): Promise<Lehrstelle[]> {
  const { beruf, kanton, seite = 1 } = params
  const page = seite > 0 ? seite : 1
  const searchSlug = slugify(beruf)

  // try up to 5 pages on gateway.one (or until no new results)
  const pagesToFetch = Math.min(5, Math.max(1, page))
  const allJobs: GatewayJob[] = []
  for (let p = 1; p <= pagesToFetch; p++) {
    const path = `${GATEWAY_BASE}/de/lehrstellen/${searchSlug}/${p}`
    const html = await fetchGatewayPage(path)
    if (!html) continue
    allJobs.push(...parseGatewayJobs(html))
    // also try search endpoint on first page
    if (p === 1) {
      const alt = await fetchGatewayPage(`${GATEWAY_BASE}/de/Home/JobOffers?SearchTerm=${encodeURIComponent(beruf)}`)
      if (alt) allJobs.push(...parseGatewayJobs(alt))
    }
  }

  const unique = Array.from(new Map(allJobs.map(j => [j.url, j])).values())
  const limit = Math.min(unique.length, 200)
  const details = await Promise.all(unique.slice(0, limit).map(async job => {
    const d = await fetchGatewayJobDetail(job.url)
    return {
      id: job.url,
      firma: d?.companyName || job.firma || 'Unbekannt',
      beruf: d?.title || job.beruf,
      kanton: kanton ?? extractKanton(d?.jobLocation?.region || job.location || ''),
      stadt: d?.jobLocation?.city || job.stadt || job.location || '',
      telefon: d?.telefon,
      email: d?.email,
      website: d?.companyUrl,
      adresse: d?.adresse,
      beschreibung: (d?.description || '').slice(0, 1000),
      url: job.url,
      quelle: 'gateway.one',
    } as Lehrstelle
  }))

  return dedupeLehrstellen(details)
}

// --- Berufsberatung scraping ---
async function fetchBerufsberatung(beruf: string, kanton?: string, page = 1): Promise<Lehrstelle[]> {
  const url = 'https://www.berufsberatung.ch/LenaWeb/AjaxWebSearch'
  const params: Record<string, string> = {
    __RequestVerificationToken: 'dummy',
    UrlAjaxWebSearch: '/LenaWeb/AjaxWebSearch',
    getTotal: 'False',
    isBlankState: 'True',
    postBack: 'true',
    CountResult: '0',
    Total_Idx: '0',
    CounterSearch: '0',
    Idx: String((page - 1) * 10),
    OrderBy: '1',
    Order: '0',
    PostBackOrder: '0',
    lang: 'de',
    langcode_: 'de',
    schoolyear_: '2026',
    Area: '10',
    cty_: (kanton ?? '').toUpperCase(),
    LocName: '',
    LocId: '',
    autocomplete_swissdoc: beruf,
    fakelocalityremember: '',
    prof_: beruf,
  }

  const body = new URLSearchParams(params).toString()
  try {
    const res = await fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Berufsberatung fetch failed ${res.status}`)
    const text = await res.text()
    try {
      const data = JSON.parse(text)
      // If returned JSON has Html or ResultHtml, parse anchors
      const html = data.Html ?? data.ResultHtml ?? JSON.stringify(data)
      return parseBerufsberatungHtml(html, beruf, kanton)
    } catch {
      return parseBerufsberatungHtml(text, beruf, kanton)
    }
  } catch (err) {
    console.error('berufsberatung fetch error', err)
    return []
  }
}

function parseBerufsberatungHtml(html: string, beruf: string, kanton?: string): Lehrstelle[] {
  // Generic anchor parsing — Berufsberatung structure varies, so extract links and surrounding text
  const anchorRe = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  const items: Lehrstelle[] = []
  while ((m = anchorRe.exec(html))) {
    const href = m[1]
    const inner = stripHtml(m[2])
    const parts = inner.split(/[-–|—]/).map(s => s.trim()).filter(Boolean)
    const title = parts[0] ?? beruf
    const firma = parts[1] ?? 'Unbekannt'
    items.push({
      id: href,
      firma,
      beruf: title,
      kanton: kanton ?? extractKanton(''),
      stadt: '',
      telefon: undefined,
      email: undefined,
      website: href.startsWith('http') ? href : `https://www.berufsberatung.ch${href}`,
      adresse: undefined,
      beschreibung: inner.slice(0, 800),
      url: href.startsWith('http') ? href : `https://www.berufsberatung.ch${href}`,
      quelle: 'berufsberatung.ch',
    })
  }
  return dedupeLehrstellen(items)
}

// --- Public aggregator ---
function extractCity(location: string): string {
  return location.split(',')[0]?.trim() ?? location
}

function extractSource(applyTitle: string): string {
  if (!applyTitle) return 'Google Jobs'
  const match = applyTitle.match(/on (.+)/i)
  return match?.[1] ?? applyTitle
}

async function fetchSerpJobs(query: string, start: number): Promise<SerpApiJob[]> {
  if (!SERPAPI_KEY) return []
  const url = new URL('https://serpapi.com/search.json')
  url.searchParams.set('engine', 'google_jobs')
  url.searchParams.set('q', query)
  url.searchParams.set('hl', 'de')
  url.searchParams.set('gl', 'ch')
  url.searchParams.set('start', String(start))
  url.searchParams.set('api_key', SERPAPI_KEY)

  try {
    const res = await fetch(url.toString())
    if (!res.ok) return []
    const data = await res.json() as { jobs_results?: SerpApiJob[] }
    return data.jobs_results ?? []
  } catch (err) {
    console.warn('SerpAPI jobs error', err)
    return []
  }
}

async function searchSerpJobs(params: { beruf: string; kanton?: string; seite?: number }): Promise<Lehrstelle[]> {
  const { beruf, kanton, seite = 1 } = params
  const kantonName = kanton && KANTON_NAMES[kanton] ? KANTON_NAMES[kanton] : ''
  const loc = kantonName ? `${kantonName} Schweiz` : 'Schweiz'
  const start = Math.max(0, seite - 1) * 10
  const queries = [
    `"Lehrstelle" ${beruf} EFZ ${loc}`,
    `"Ausbildungsplatz" ${beruf} ${loc}`,
  ]

  const pages = await Promise.all(queries.map(q => fetchSerpJobs(q, start)))
  const jobs = pages.flat()
  const results = jobs.map((job, index) => {
    const desc = job.description ?? ''
    const applyLinks = job.apply_options ?? []
    const directLink = applyLinks.find(link => link.link && !isJobBoardUrl(link.link))?.link
    const anyLink = applyLinks[0]?.link ?? ''

    return {
      id: job.job_id ?? `${job.company_name ?? 'job'}-${index}`,
      firma: job.company_name ?? 'Unbekannt',
      beruf: job.title ?? beruf,
      kanton: kantonName ? (kanton ?? 'CH') : extractKanton(job.location ?? ''),
      stadt: extractCity(job.location ?? ''),
      telefon: extractPhone(desc),
      email: extractEmail(desc),
      website: directLink ?? anyLink,
      beschreibung: desc.slice(0, 600),
      url: directLink ?? anyLink,
      quelle: extractSource(applyLinks[0]?.title ?? ''),
    } satisfies Lehrstelle
  })

  return dedupeLehrstellen(results)
}

export async function searchLehrstellen(params: { beruf: string; kanton?: string; seite?: number }): Promise<Lehrstelle[]> {
  const [gatewayResults, berufsberatungResults, serpResults] = await Promise.all([
    searchGatewayJobs(params),
    fetchBerufsberatung(params.beruf, params.kanton, params.seite ?? 1),
    searchSerpJobs(params),
  ])

  const merged = dedupeLehrstellen([...gatewayResults, ...berufsberatungResults, ...serpResults])
  return merged
}

export function isJobBoardUrl(url: string): boolean {
  const boards = [
    'yousty', 'linkedin', 'indeed', 'jobup', 'jobs.ch', 'scout24',
    'monster', 'glassdoor', 'stellenanzeigen', 'jobscout', 'jobagent',
    'karriere', 'xing.com', 'jobsearch.ch', 'jobfinder',
  ]
  return boards.some(b => url.includes(b))
}
