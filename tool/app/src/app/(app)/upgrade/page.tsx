'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { PLANS, Tier } from '@/lib/plans'
import { useSearchParams } from 'next/navigation'

function UpgradeContent() {
  const [currentTier, setCurrentTier] = useState<Tier>('basic')
  const [loading, setLoading] = useState<Tier | null>(null)
  const params = useSearchParams()
  const upgraded = params.get('upgraded')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('subscription_tier').eq('user_id', user.id).single()
        .then(({ data }) => { if (data?.subscription_tier) setCurrentTier(data.subscription_tier as Tier) })
    })
  }, [])

  async function handleCheckout(tier: Tier) {
    if (tier === currentTier) return
    setLoading(tier)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, tier }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  const tierOrder: Tier[] = ['basic', 'pro', 'unlimited']

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Plan wählen</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        Mehr Bewerbungen pro Tag — mehr Chancen auf deine Traumlehrstelle.
      </p>

      {upgraded && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--green)', color: 'var(--green)' }}>
          ✓ Upgrade erfolgreich! Dein Plan wurde aktiviert.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {tierOrder.map((tier) => {
          const plan = PLANS[tier]
          const isCurrent = tier === currentTier
          const isPopular = tier === 'pro'

          return (
            <div
              key={tier}
              className="rounded-xl p-6 flex flex-col relative"
              style={{
                background: isCurrent ? 'var(--purple-glow)' : 'var(--surface)',
                border: `1px solid ${isCurrent ? 'var(--purple)' : isPopular ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
              }}
            >
              {isPopular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--purple)', color: 'white' }}>
                  Beliebt
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--green)', color: 'white' }}>
                  Aktuell
                </div>
              )}

              <div className="mb-4">
                <p className="font-bold text-lg">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold">CHF {plan.price}</span>
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>/Monat</span>
                </div>
                <p className="text-sm mt-2 font-medium" style={{ color: 'var(--purple-light)' }}>
                  {plan.dailyLimit ? `${plan.dailyLimit} Bewerbungen / Tag` : 'Unlimitierte Bewerbungen'}
                </p>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--green)' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(tier)}
                disabled={isCurrent || loading !== null}
                className="w-full py-2.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-default"
                style={{
                  background: isCurrent ? 'transparent' : 'var(--purple)',
                  color: isCurrent ? 'var(--muted)' : 'white',
                  border: isCurrent ? '1px solid var(--border)' : 'none',
                }}
              >
                {loading === tier ? 'Weiterleitung...' : isCurrent ? 'Aktueller Plan' : `${plan.name} wählen`}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-center mt-6" style={{ color: 'var(--muted-2)' }}>
        Monatlich kündbar · Zahlung via Stripe · CHF · Schweiz
      </p>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense>
      <UpgradeContent />
    </Suspense>
  )
}