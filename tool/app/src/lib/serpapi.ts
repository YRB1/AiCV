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

// Domains belonging to recruiters/platforms — not the actual company
const RECRUITER_DOMAINS = [
  'convit.ch', 'yousty.ch', 'lehrstellenboerse.ch', 'jobup.ch', 'jobs.ch',
  'indeed.com', 'linkedin.com', 'scout24.ch', 'monster.ch', 'glassdoor.com',
  'jobagent.ch', 'stellenanzeigen.de', 'karriere.ch', 'jobscout24.ch',
  'adecco.ch', 'manpower.ch', 'randstad.ch', 'tempodrei.ch', 'perret.ch',
  'noreply', 'no-reply', 'donotreply', 'example',
]

// Known platform phone numbers — appear on every listing
const JUNK_PHONES = ['0079941352', '0799413527', '0800800', '+41800']

// A result is only kept if its title suggests an apprenticeship
const APPRENTICESHIP_TITLE_KEYWORDS = [
  'lehrstelle', 'lernende', 'lernender', 'efz', 'ausbildung',
  'ausbildungsplatz', 'lehrjahr', 'berufslehre', 'apprenti',
]

function isApprenticeship(title: string): boolean {
  const lower = title.toLowerCase()
  return APPRENTICESHIP_TITLE_KEYWORDS.some(k => lower.includes(k))
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

async function fetchJobsPage(query: string, start: number): Promise<SerpApiJob[]> {
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

// Secondary Google search to find a company's contact email
async function lookupCompanyEmail(companyName: string, city: string): Promise<string | undefined> {
  const url = new URL('https://serpapi.com/search.json')
  url.searchParams.set('engine', 'google')
  url.searchParams.set('q', `"${companyName}" ${city} Kontakt Email Impressum`)
  url.searchParams.set('hl', 'de')
  url.searchParams.set('gl', 'ch')
  url.searchParams.set('num', '5')
  url.searchParams.set('api_key', SERPAPI_KEY)
  try {
    const r = await fetch(url.toString())
    if (!r.ok) return undefined
    const data = await r.json()
    const text = (data.organic_results ?? [])
      .map((res: { snippet?: string; title?: string }) => `${res.title ?? ''} ${res.snippet ?? ''}`)
      .join(' ')
    return extractEmail(text)
  } catch {
    return undefined
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

  // Lehrstellen-specific queries only — no generic job terms
  const queries = [
    `"Lehrstelle" ${beruf} EFZ ${loc}`,
    `"Ausbildungsplatz" ${beruf} ${loc}`,
    `Lernende ${beruf} EFZ Lehrstelle ${loc}`,
    `${beruf} Kauffrau Kaufmann Lehrstelle ${loc}`,
  ]

  // 3 pages per query = up to 120 raw results
  const fetches = queries.flatMap(q => [0, 10, 20].map(start => fetchJobsPage(q, start)))
  const pages = await Promise.all(fetches)
  const allJobs = pages.flat()

  // Deduplicate by company name
  const seen = new Set<string>()
  const unique = allJobs.filter(job => {
    const key = (job.company_name ?? '').toLowerCase().trim()
    if (!key || key === 'unbekannt' || seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Filter to only real apprenticeships
  const apprenticeships = unique.filter(job => isApprenticeship(job.title ?? ''))

  // Map to Lehrstelle — collect those needing email enrichment
  const results: Lehrstelle[] = apprenticeships.map((job, i) => {
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
      _raw: job,
    }
  })

  // Enrich up to 20 companies that have no email with a secondary Google search
  const needsEmail = results.filter(r => !r.email).slice(0, 20)
  if (needsEmail.length > 0) {
    const enriched = await Promise.all(
      needsEmail.map(r => lookupCompanyEmail(r.firma, r.stadt))
    )
    enriched.forEach((email, i) => {
      if (email) needsEmail[i].email = email
    })
  }

  // Clean up internal field
  results.forEach(r => { delete (r as Lehrstelle & { _raw?: unknown })._raw })

  return results
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
  const boards = [
    'yousty', 'linkedin', 'indeed', 'jobup', 'jobs.ch', 'scout24',
    'monster', 'glassdoor', 'stellenanzeigen', 'jobscout', 'jobagent',
    'karriere', 'xing.com', 'jobsearch.ch', 'jobfinder',
  ]
  return boards.some(b => url.includes(b))
}
