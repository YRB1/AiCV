// Demo-Modus: funktioniert ohne echte Supabase-Keys

const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@blitzbewerbung.ch',
  created_at: new Date().toISOString(),
}

const DEMO_PROFILE = {
  user_id: 'demo-user-123',
  vorname: 'Max',
  nachname: 'Muster',
  schule: 'Oberstufe Zürich',
  jahrgang: '3. Sek',
  wunschberuf: 'Polymechaniker EFZ',
  wohnort: 'Zürich',
  telefon: '+41 79 123 45 67',
  email: 'demo@blitzbewerbung.ch',
  demo_script: '',
  subscription_tier: 'basic',
}

const DEMO_LEADS = [
  { id: '1', user_id: 'demo-user-123', firma: 'Bäckerei Müller AG', beruf: 'Bäcker-Konditor EFZ', stadt: 'Zürich', kanton: 'ZH', status: 'neu', created_at: new Date(Date.now() - 2*86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: '2', user_id: 'demo-user-123', firma: 'Garage Huber GmbH', beruf: 'Automobil-Mechatroniker EFZ', stadt: 'Winterthur', kanton: 'ZH', status: 'kontaktiert', created_at: new Date(Date.now() - 5*86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: '3', user_id: 'demo-user-123', firma: 'Coiffure Bella', beruf: 'Coiffeuse EFZ', stadt: 'Bern', kanton: 'BE', status: 'antwort', created_at: new Date(Date.now() - 7*86400000).toISOString(), updated_at: new Date().toISOString() },
]

export const isDemoMode = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('abcdefgh')
  ) return true
  if (typeof window !== 'undefined' && localStorage.getItem('ls_preview_mode') === '1') return true
  return false
}

// localStorage keys
const SESSION_KEY = 'ls_demo_session'
const PROFILE_KEY = 'ls_demo_profile'

export function demoSignIn(email: string, password: string): { user: typeof DEMO_USER } | { error: string } {
  if (password !== 'test') return { error: 'Demo-Passwort: "test"' }
  const user = { ...DEMO_USER, email }
  if (typeof window !== 'undefined') localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return { user }
}

export function demoGetUser(): typeof DEMO_USER | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function demoSignOut() {
  if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY)
}

export function demoGetProfile() {
  if (typeof window === 'undefined') return DEMO_PROFILE
  const raw = localStorage.getItem(PROFILE_KEY)
  if (!raw) return DEMO_PROFILE
  try { return { ...DEMO_PROFILE, ...JSON.parse(raw) } } catch { return DEMO_PROFILE }
}

export function demoSaveProfile(data: Partial<typeof DEMO_PROFILE>) {
  if (typeof window !== 'undefined') localStorage.setItem(PROFILE_KEY, JSON.stringify(data))
}

export function demoGetLeads() { return DEMO_LEADS }