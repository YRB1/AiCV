import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'
import { PLANS, Tier } from '@/lib/plans'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { userId, tier } = await req.json()

  if (!userId || !tier || !(tier in PLANS)) {
    return NextResponse.json({ error: 'Ungültige Parameter' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('user_id', userId)
    .single()

  const plan = PLANS[tier as Tier]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (profile?.email ?? undefined),
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/upgrade`,
    metadata: { userId, tier },
    subscription_data: { metadata: { userId, tier } },
  })

  return NextResponse.json({ url: session.url })
}