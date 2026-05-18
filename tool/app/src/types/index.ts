export interface Lehrstelle {
  id: string
  firma: string
  beruf: string
  kanton: string
  stadt: string
  telefon?: string
  email?: string
  website?: string
  adresse?: string
  beschreibung?: string
  url?: string
  quelle: string
}

export interface Lead {
  id: string
  user_id: string
  firma: string
  beruf: string
  stadt: string
  kanton: string
  telefon?: string
  email?: string
  website?: string
  url?: string
  status: 'neu' | 'kontaktiert' | 'antwort' | 'absage' | 'zusage'
  generated_message?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  vorname: string
  nachname: string
  schule: string
  jahrgang: string
  wunschberuf: string
  wohnort: string
  telefon: string
  email: string
  demo_script: string
  updated_at: string
}