import { Lehrstelle } from '@/types'

const APP_ID = process.env.ADZUNA_APP_ID!
const APP_KEY = process.env.ADZUNA_APP_KEY!
const BASE = 'https://api.adzuna.com/v1/api/jobs/ch/search'

export interface AdzunaSearchParams {
  beruf: string
  kanton?: string
  seite?: number
}

export async function searchLehrstellen(params: AdzunaSearchParams): Promise<Lehrstelle[]> {
  const { beruf, kanton, seite = 1 } = params

  const url = new URL(`${BASE}/${seite}`)
  url.searchParams.set('app_id', APP_ID)
  url.searchParams.set('app_key', APP_KEY)
  const kantonNames: Record<string, string> = {
    AG: 'Aargau', AI: 'Appenzell', AR: 'Appenzell', BE: 'Bern', BL: 'Basel',
    BS: 'Basel', FR: 'Fribourg', GE: 'Genf', GL: 'Glarus', GR: 'Graubünden',
    JU: 'Jura', LU: 'Luzern', NE: 'Neuenburg', NW: 'Nidwalden', OW: 'Obwalden',
    SG: 'St. Gallen', SH: 'Schaffhausen', SO: 'Solothurn', SZ: 'Schwyz',
    TG: 'Thurgau', TI: 'Tessin', UR: 'Uri', VD: 'Waadt', VS: 'Wallis',
    ZG: 'Zug', ZH: 'Zürich',
  }
  const whatQuery = kanton && kantonNames[kanton] ? `${beruf} ${kantonNames[kanton]}` : beruf
  url.searchParams.set('what', whatQuery)
  url.searchParams.set('results_per_page', '50')
  url.searchParams.set('content-type', 'application/json')

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } }) // 24h Cache via Next.js fetch
  if (!res.ok) throw new Error(`Adzuna API Fehler: ${res.status}`)

  const data = await res.json()
  const results: Lehrstelle[] = (data.results ?? []).map((job: AdzunaJob) => ({
    id: job.id,
    firma: job.company?.display_name ?? 'Unbekannt',
    beruf: job.title,
    kanton: extractKanton(job.location?.display_name ?? ''),
    stadt: job.location?.area?.[3] ?? job.location?.display_name ?? '',
    telefon: undefined,
    email: undefined,
    website: job.redirect_url,
    adresse: job.location?.display_name,
    beschreibung: stripHtml(job.description ?? ''),
    url: job.redirect_url,
    quelle: 'Adzuna',
  }))

  return results
}

interface AdzunaJob {
  id: string
  title: string
  company?: { display_name: string }
  location?: { display_name: string; area?: string[] }
  description?: string
  redirect_url: string
}

function extractKanton(location: string): string {
  const kantonMap: Record<string, string> = {
    Zürich: 'ZH', Bern: 'BE', Luzern: 'LU', Basel: 'BS', Genf: 'GE',
    Lausanne: 'VD', 'St. Gallen': 'SG', Winterthur: 'ZH', Zug: 'ZG',
    Aargau: 'AG', Thurgau: 'TG', Solothurn: 'SO', Freiburg: 'FR',
    Wallis: 'VS', Graubünden: 'GR', Tessin: 'TI',
  }
  for (const [city, kanton] of Object.entries(kantonMap)) {
    if (location.includes(city)) return kanton
  }
  return 'CH'
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500)
}