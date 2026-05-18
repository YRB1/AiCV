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

export async function searchLehrstellen(params: {
  beruf: string
  kanton?: string
  seite?: number
}): Promise<Lehrstelle[]> {
  const { beruf, kanton } = params

  const kantonName = kanton && KANTON_NAMES[kanton] ? KANTON_NAMES[kanton] : ''
  const query = kantonName
    ? `${beruf} Lehrstelle ${kantonName} Schweiz`
    : `${beruf} Lehrstelle Schweiz`

  // Fetch 3 pages in parallel = up to 30 results
  const pages = [0, 10, 20]
  const responses = await Promise.all(pages.map(start => {
    const url = new URL('https://serpapi.com/search.json')
    url.searchParams.set('engine', 'google_jobs')
    url.searchParams.set('q', query)
    url.searchParams.set('hl', 'de')
    url.searchParams.set('gl', 'ch')
    url.searchParams.set('start', String(start))
    url.searchParams.set('api_key', SERPAPI_KEY)
    return fetch(url.toString()).then(r => r.ok ? r.json() : { jobs_results: [] })
  }))

  const jobs = responses.flatMap(data => data.jobs_results ?? [])

  return jobs.map((job: SerpApiJob, i: number): Lehrstelle => {
    const desc = job.description ?? ''
    // Only extract email from description, NOT phone (platform numbers like 0799413527 appear in all listings)
    const emailFromDesc = desc.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
      ?.find(e => !e.includes('yousty') && !e.includes('example') && !e.includes('noreply') && !e.includes('sentry') && !e.includes('.png'))

    // Pick the most direct apply link (prefer non-job-board)
    const applyLinks = job.apply_options ?? []
    const directLink = applyLinks.find(l => l.link && !isJobBoardUrl(l.link ?? ''))?.link
    const anyLink = applyLinks[0]?.link ?? ''

    return {
      id: job.job_id ?? String(i),
      firma: job.company_name ?? 'Unbekannt',
      beruf: job.title ?? beruf,
      kanton: kantonName ? (kanton ?? 'CH') : extractKanton(job.location ?? ''),
      stadt: extractCity(job.location ?? ''),
      telefon: undefined,
      email: emailFromDesc,
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