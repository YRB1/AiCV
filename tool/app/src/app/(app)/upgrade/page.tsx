'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { PLANS, Tier, Billing } from '@/lib/plans'
import { useSearchParams } from 'next/navigation'

const CHECK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

function UpgradeContent() {
  const [currentTier, setCurrentTier] = useState<Tier>('free')
  const [billing, setBilling] = useState<Billing>('monthly')
  const [loading, setLoading] = useState<Tier | null>(null)
  const params = useSearchParams()
  const upgraded = params.get('upgraded')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('subscription_tier').eq('user_id', user.id).single()
        .then(({ data }) => {
          if (data?.subscription_tier) setCurrentTier(data.subscription_tier as Tier)
        })
    })
  }, [])

  async function handleCheckout(tier: Tier) {
    if (tier === 'free' || tier === currentTier) return
    setLoading(tier)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(null); return }

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, tier, billing }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  const tiers: Tier[] = ['free', 'pro', 'student']

  return (
    <div style={{ padding: '36px 32px', maxWidth: '900px' }} className="fade-in">
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Choose your plan</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>
        More applications per day — more chances at your dream apprenticeship.
      </p>

      {upgraded && (
        <div style={{ marginBottom: '24px', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--green)' }}>
          ✓ Upgrade successful! Your plan has been activated.
        </div>
      )}

      {/* Billing toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--surface)' }}>
          {(['monthly', 'yearly'] as Billing[]).map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{
              padding: '7px 16px', fontSize: '12px', fontWeight: 600,
              background: billing === b ? 'var(--accent-glow-2)' : 'transparent',
              color: billing === b ? 'var(--accent-light)' : 'var(--muted)',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              textTransform: 'capitalize',
            }}>
              {b}
            </button>
          ))}
        </div>
        {billing === 'yearly' && (
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.25)' }}>
            Save 20% yearly
          </span>
        )}
      </div>

      {/* Plan cards */}
      <div className="ls-plan-grid">
        {tiers.map((tier) => {
          const plan = PLANS[tier]
          const isCurrent = tier === currentTier
          const isPopular = tier === 'pro'
          const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice

          return (
            <div key={tier} style={{
              borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column',
              position: 'relative',
              background: isPopular ? 'var(--accent-glow)' : 'var(--surface)',
              border: `1.5px solid ${isCurrent ? 'var(--green)' : isPopular ? 'var(--accent)' : 'var(--border)'}`,
              boxShadow: isPopular ? '0 0 32px var(--accent-glow)' : 'var(--shadow-sm)',
              transition: 'border-color 0.15s',
            }}>
              {/* Badges */}
              {isPopular && !isCurrent && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'var(--accent)', color: 'white', whiteSpace: 'nowrap' }}>
                  POPULAR
                </div>
              )}
              {isCurrent && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'var(--green)', color: 'white', whiteSpace: 'nowrap' }}>
                  CURRENT PLAN
                </div>
              )}

              {/* Name & price */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)' }}>
                    {price === 0 ? 'Free' : `CHF ${price}`}
                  </span>
                  {price > 0 && (
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>/mo</span>
                  )}
                </div>
                {billing === 'yearly' && plan.yearlyTotal > 0 && (
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    CHF {plan.yearlyTotal} billed annually
                  </p>
                )}
                {billing === 'monthly' && plan.monthlyPrice > 0 && (
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    Or CHF {plan.yearlyPrice}/mo billed yearly
                  </p>
                )}
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', flex: 1, marginBottom: '22px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-2)' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: '1px' }}>{CHECK}</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button onClick={() => handleCheckout(tier)} disabled={isCurrent || tier === 'free' || loading !== null}
                style={{
                  width: '100%', padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
                  cursor: isCurrent || tier === 'free' ? 'default' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  background: isCurrent || tier === 'free' ? 'var(--surface-2)' : isPopular ? 'var(--accent)' : 'var(--surface-3)',
                  color: isCurrent || tier === 'free' ? 'var(--muted)' : isPopular ? 'white' : 'var(--accent-light)',
                  opacity: loading !== null && loading !== tier ? 0.5 : 1,
                  border: isCurrent || tier === 'free' ? '1px solid var(--border)' : isPopular ? 'none' : `1px solid var(--accent)`,
                } as React.CSSProperties}>
                {loading === tier
                  ? 'Redirecting…'
                  : isCurrent
                  ? 'Current plan'
                  : tier === 'free'
                  ? 'Get started free'
                  : `Start ${plan.name} — CHF ${price}/mo`}
              </button>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: '12px', textAlign: 'center', color: 'var(--muted-2)' }}>
        Cancel anytime · Secure payment via Stripe · CHF · Switzerland
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
