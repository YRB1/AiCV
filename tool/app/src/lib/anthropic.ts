import Anthropic from '@anthropic-ai/sdk'
import { Lehrstelle } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface GenerateResult {
  message: string
  fakten: string[]
}

export async function generateBewerbung(
  lehrstelle: Lehrstelle,
  userScript: string,
  userProfile: {
    vorname: string
    nachname: string
    schule: string
    jahrgang: string
    wohnort: string
  }
): Promise<GenerateResult> {
  const firmaInfo = [
    `Firma: ${lehrstelle.firma}`,
    `Beruf/Stelle: ${lehrstelle.beruf}`,
    `Standort: ${lehrstelle.stadt}, ${lehrstelle.kanton}`,
    lehrstelle.beschreibung ? `Stellenbeschreibung: ${lehrstelle.beschreibung}` : '',
    lehrstelle.website ? `Website: ${lehrstelle.website}` : '',
  ].filter(Boolean).join('\n')

  const systemPrompt = `Du bist ein Experte für Schweizer Lehrstellenbewerbungen.
Du hilfst Jugendlichen, ihr handgeschriebenes Bewerbungsschreiben für eine spezifische Firma zu personalisieren.

REGELN:
- Behalte den Schreibstil und die Struktur des Original-Scripts EXAKT bei
- Ändere NUR: Firmenname, 1-5 firmenspezifische Fakten, Berufsbezeichnung, Schreibfehler korrigieren
- Die Fakten müssen aus der Stellenbeschreibung/Firmeninfo stammen — nichts erfinden
- Schreibe auf Schweizer Deutsch (kein "ß", "ss" statt "ß")
- Das Schreiben soll authentisch wirken, nicht wie eine Vorlage
- Angemessene Länge für eine Bewerbung (ca. 150-300 Wörter)

Antworte im JSON-Format:
{
  "message": "Das vollständige personalisierte Bewerbungsschreiben",
  "fakten": ["Fakt 1 über die Firma", "Fakt 2", ...]
}`

  const userMessage = `FIRMEN-INFORMATION:
${firmaInfo}

BEWERBER:
Name: ${userProfile.vorname} ${userProfile.nachname}
Schule: ${userProfile.schule}
Jahrgang: ${userProfile.jahrgang}
Wohnort: ${userProfile.wohnort}

ORIGINAL SCRIPT (handgeschrieben, mit Schreibfehlern):
${userScript}

Personalisiere das Script für diese Firma. Füge 1-5 echte, spezifische Fakten über die Firma ein.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Kein JSON gefunden')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      message: parsed.message ?? text,
      fakten: parsed.fakten ?? [],
    }
  } catch {
    return { message: text, fakten: [] }
  }
}