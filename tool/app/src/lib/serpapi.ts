import { Lehrstelle } from '@/types'

const SERPAPI_KEY = process.env.SERPAPI_KEY!

const KANTON_NAMES: Record<string, string> = {
  AG: 'Aargau', AI: 'Appenzell', AR: 'Appenzell', BE: 'Bern',
  BL: 'Basel-Landschaft', BS: 'Basel', FR: 'Fribourg', GE: 'Genf',
  GL: 'Glarus', GR: 'Graubünden', JU: 'Jura', LU: 'Luzern',
  NE: 'Neuenburg', NW: 'Nidwalden', OW: 'Obwalden', SG: 'St. Gallen',
  SH: 'Schaffhausen', SO: 'Solothurn', SZ: 'Schwyz', TG: 'Thurgau',
  TI: 'Tessin', UR: 'Uri', VD: 'Waadt', VS: 'Wallis', ZG: 'Zug', ZH: 'Zürich',
}

// Recruitment agencies / platforms — their emails are NOT the company's contact
const RECRUITER_EMAIL_DOMAINS = [
  'convit.ch', 'yousty.ch', 'lehrstellenboerse.ch', 'jobup.ch',
  'jobs.ch', 'indeed.com', 'linkedin.com', 'scout24.ch', 'monster.ch',
  'glassdoor.com', 'jobagent.ch', 'stellenanzeigen.de', 'karriere.ch',
  'noreply', 'example', 'sentry', 'no-reply', 'donotreply',
]

// Platform phone numbers that appear on all listings
const JUNK_PHONES = ['0079941352', '0799413527', '0800', '+41800']

function isRecruiterEmail(email: string): boolean {
  const lower = email.toLowerCase()
  return RECRUITER_EMAIL_DOMAINS.some(d => lower.includes(d)) ||
    lower.endsWith('.png') || lower.endsWith('.jpg')
}

function isJunkPhone(phone: string): boolean {
  const digits = phone.replace(/\s/g, '')
  return JUNK_PHONES.some(j => digits.startsWith(j))
}

function extractEmail(desc: string): string | undefined {
  const emails = desc.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? []
  return emails.find(e => !isRecruiterEmail(e))
}

function extractPhone(desc: string): string | undefined {
  const phones = desc.match(/(\+41|0041|0)[\s\-]?(\d{2})[\s\-]?(\d{3})[\s\-]?(\d{2})[\s\-]?(\d{2})/g) ?? []
  return phones.find(p => !isJunkPhone(p))
}

async function fetchPage(query: string, start: number): Promise<SerpApiJob[]> {
  const url = new URL('https://serpapi.com/search.json')
  url.searchParams.set('engine', 'google_jobs')
  url.searchParams.set('q', query)
  url.searchParams.set('hl', 'de')
  url.searchParams.set('gl', 'ch')
  url.searchParams.set('start', String(start))
  url.searchParams.set('api_key', SERPAPI_KEY)
  try {
    const r = await fetch(url.toString())
    if (!r.ok) return []
    const data = await r.json()
    return data.jobs_results ?? []
  } catch {
    return []
  }
}

export async function searchLehrstellen(params: {
  beruf: string
  kanton?: string
  seite?: number
}): Promise<Lehrstelle[]> {
  const { beruf, kanton } = params
  const kantonName = kanton && KANTON_NAMES[kanton] ? KANTON_NAMES[kanton] : ''
  const loc = kantonName ? `${kantonName} Schweiz` : 'Schweiz'

  // Multiple query variations to maximise real results
  const queries = [
    `${beruf} Lehrstelle ${loc}`,
    `${beruf} Ausbildung ${loc}`,
    `${beruf} EFZ Lehrstelle ${loc}`,
    `Kaufmann Kauffrau EFZ Lehrstelle ${loc}`,
  ]

  // 3 pages per query (0, 10, 20) = up to 120 raw results
  const fetches = queries.flatMap(q => [0, 10, 20].map(start => fetchPage(q, start)))
  const pages = await Promise.all(fetches)
  const jobs = pages.flat()

  // Deduplicate by company name (keep first occurrence)
  const seen = new Set<string>()
  const unique = jobs.filter(job => {
    const key = (job.company_name ?? '').toLowerCase().trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.map((job: SerpApiJob, i: number): Lehrstelle => {
    const desc = job.description ?? ''
    const email = extractEmail(desc)
    const telefon = extractPhone(desc)

    const applyLinks = job.apply_options ?? []
    const directLink = applyLinks.find(l => l.link && !isJobBoardUrl(l.link ?? ''))?.link
    const anyLink = applyLinks[0]?.link ?? ''

    return {
      id: job.job_id ?? String(i),
      firma: job.company_name ?? 'Unbekannt',
      beruf: job.title ?? beruf,
      kanton: kantonName ? (kanton ?? 'CH') : extractKanton(job.location ?? ''),
      stadt: extractCity(job.location ?? ''),
      telefon,
      email,
      website: directLink ?? anyLink,
      beschreibung: desc.slice(0, 600),
      url: directLink ?? anyLink,
      quelle: extractSource(job.apply_options?.[0]?.title ?? ''),
    }
  })
}

interface SerpApiJob {
  job_id?: string
  title?: string
  company_name?: string
  location?: string
  description?: string
  apply_options?: { title?: string; link?: string }[]
}

function extractCity(location: string): string {
  return location.split(',')[0]?.trim() ?? location
}

function extractKanton(location: string): string {
  for (const [abbr, name] of Object.entries(KANTON_NAMES)) {
    if (location.includes(name)) return abbr
  }
  return 'CH'
}

function extractSource(applyTitle: string): string {
  if (!applyTitle) return 'Google Jobs'
  const match = applyTitle.match(/on (.+)/i)
  return match?.[1] ?? applyTitle
}

export function isJobBoardUrl(url: string): boolean {
  const boards = ['yousty', 'linkedin', 'indeed', 'jobup', 'jobs.ch', 'scout24', 'monster', 'glassdoor', 'stellenanzeigen', 'jobscout', 'jobagent', 'karriere', 'xing.com']
  return boards.some(b => url.includes(b))
}
