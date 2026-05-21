import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'
import { getStripePriceId, Tier, Billing } from '@/lib/plans'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { userId, tier, billing = 'monthly' } = await req.json() as { userId: string; tier: Tier; billing: Billing }

  if (!userId || !tier || !['pro', 'student'].includes(tier)) {
    return NextResponse.json({ error: 'Ungültige Parameter' }, { status: 400 })
  }

  const priceId = getStripePriceId(tier, billing)
  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price ID nicht konfiguriert' }, { status: 500 })
  }

  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('user_id', userId)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (profile?.email ?? undefined),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/upgrade`,
    metadata: { userId, tier, billing },
    subscription_data: { metadata: { userId, tier, billing } },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
