import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface ApplicantInfo {
  vorname?: string
  nachname?: string
  email?: string
  telefon?: string
  wohnort?: string
  schule?: string
  wunschberuf?: string
}

function buildHtml(subject: string, message: string, applicantInfo: ApplicantInfo, replyTo?: string): string {
  const rows: [string, string][] = []
  const name = [applicantInfo.vorname, applicantInfo.nachname].filter(Boolean).join(' ')
  if (name) rows.push(['Name', name])
  if (applicantInfo.telefon) rows.push(['Telefon', applicantInfo.telefon])
  if (applicantInfo.wohnort) rows.push(['Wohnort', applicantInfo.wohnort])
  if (applicantInfo.schule) rows.push(['Schule', applicantInfo.schule])

  const tableRows = rows.map(([k, v]) => `
    <tr>
      <td style="padding:5px 16px 5px 0;font-size:12px;color:#6b7280;white-space:nowrap;vertical-align:top;">${k}</td>
      <td style="padding:5px 0;font-size:13px;color:#111827;">${v}</td>
    </tr>`).join('')

  const replyRow = replyTo ? `
    <div style="margin-top:14px;padding:10px 14px;background:#f9fafb;border-radius:8px;font-size:12px;color:#6b7280;">
      Direkt antworten an: <a href="mailto:${replyTo}" style="color:#7c3aed;font-weight:600;">${replyTo}</a>
    </div>` : ''

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:24px 28px;">
        <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:0.06em;text-transform:uppercase;">Bewerbung via Blitzbewerbung.ch</p>
        <h1 style="margin:0;font-size:20px;font-weight:700;color:white;line-height:1.3;">${subject}</h1>
      </div>

      <div style="padding:22px 28px;border-bottom:1px solid #f0f0f0;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:0.07em;color:#9ca3af;text-transform:uppercase;">Bewerber/in</p>
        <table style="border-collapse:collapse;">${tableRows}</table>
        ${replyRow}
      </div>

      <div style="padding:22px 28px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.07em;color:#9ca3af;text-transform:uppercase;">Bewerbungsschreiben</p>
        <div style="font-size:14px;line-height:1.85;color:#374151;white-space:pre-line;">${message}</div>
      </div>

      <div style="padding:14px 28px;background:#f9fafb;border-top:1px solid #f0f0f0;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          Automatisch generiert und gesendet via
          <a href="https://blitzbewerbung.ch" style="color:#7c3aed;font-weight:600;text-decoration:none;">Blitzbewerbung.ch</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const body = await req.json()
  const { leadId, userId, toEmail, subject, message, vonName, replyTo, applicantInfo } = body

  if (!toEmail || !message || !userId) {
    return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
  }

  const fromName = vonName || 'Bewerber/in'
  const html = buildHtml(subject ?? `Bewerbung`, message, applicantInfo ?? {}, replyTo)

  try {
    const emailPayload: Parameters<typeof resend.emails.send>[0] = {
      from: `${fromName} via Blitzbewerbung <bewerbung@blitzbewerbung.ch>`,
      to: [toEmail],
      subject: subject ?? `Bewerbung als Lernende/r`,
      html,
      text: message,
    }
    if (replyTo) emailPayload.replyTo = replyTo

    const { error } = await resend.emails.send(emailPayload)
    if (error) throw error

    if (leadId) {
      const supabase = createServiceClient()
      await supabase
        .from('leads')
        .update({ status: 'kontaktiert', updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .eq('user_id', userId)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email Fehler:', err)
    return NextResponse.json({ error: 'Email konnte nicht gesendet werden' }, { status: 500 })
  }
}
