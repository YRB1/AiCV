import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'
import { Tier } from '@/lib/plans'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook Signatur ungültig' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const tier = session.metadata?.tier as Tier
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (userId && tier) {
      await supabase.from('profiles').update({
        subscription_tier: tier,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: 'active',
      }).eq('user_id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.paused') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.userId
    if (userId) {
      await supabase.from('profiles').update({
        subscription_tier: 'free',
        subscription_status: event.type === 'customer.subscription.paused' ? 'paused' : 'cancelled',
      }).eq('user_id', userId)
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.userId
    const tier = sub.metadata?.tier as Tier
    if (userId && tier) {
      await supabase.from('profiles').update({
        subscription_tier: tier,
        subscription_status: sub.status,
      }).eq('user_id', userId)
    }
  }

  return NextResponse.json({ received: true })
}