import { NextRequest, NextResponse } from 'next/server'
import { generateDocx } from '@/lib/docx-gen'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { firma, beruf, bewerbungstext, userId } = body

  if (!firma || !beruf || !bewerbungstext || !userId) {
    return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('vorname, nachname, wohnort')
    .eq('user_id', userId)
    .single()

  const { buffer, filename } = await generateDocx({
    firma,
    beruf,
    bewerbungstext,
    vorname: profile?.vorname ?? '',
    nachname: profile?.nachname ?? '',
    wohnort: profile?.wohnort ?? '',
  })

  return new NextResponse(buffer.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}