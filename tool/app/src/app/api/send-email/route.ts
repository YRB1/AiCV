import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { leadId, userId, toEmail, subject, message, vonName } = body

  if (!toEmail || !message || !userId) {
    return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
  }

  try {
    const { error } = await resend.emails.send({
      from: `${vonName} <bewerbung@lehrstellensniper.ch>`,
      to: [toEmail],
      subject: subject ?? `Bewerbung als Lernende/r`,
      text: message,
    })

    if (error) throw error

    // Update lead status
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