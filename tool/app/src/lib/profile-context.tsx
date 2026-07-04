'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { Tier, getPlan } from './plans'

interface ProfileCtx {
  tier: Tier
  loading: boolean
  dailyUsed: number
  dailyLimit: number | null
  aiUsed: number
  aiLimit: number | null
  canApply: boolean
  canUseAi: boolean
  refresh: () => void
}

const Ctx = createContext<ProfileCtx>({
  tier: 'free', loading: true,
  dailyUsed: 0, dailyLimit: 15,
  aiUsed: 0, aiLimit: 3,
  canApply: true, canUseAi: true,
  refresh: () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier>('free')
  const [dailyUsed, setDailyUsed] = useState(0)
  const [aiUsed, setAiUsed] = useState(0)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single()

      const t: Tier = (['free', 'pro', 'student'].includes(profile?.subscription_tier ?? '')
        ? profile?.subscription_tier : 'free') as Tier
      setTier(t)

      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      // Count applications sent today
      const { count: appCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString())
      setDailyUsed(appCount ?? 0)

      // Count AI generations today (leads with a generated_message)
      const { count: aiCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('generated_message', 'is', null)
        .gte('created_at', startOfDay.toISOString())
      setAiUsed(aiCount ?? 0)

    } catch { /* */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const plan = getPlan(tier)
  const dailyLimit = plan.dailyLimit
  const aiLimit = plan.aiGenerations
  const canApply = dailyLimit === null || dailyUsed < dailyLimit
  const canUseAi = aiLimit === null || aiUsed < aiLimit

  return (
    <Ctx.Provider value={{ tier, loading, dailyUsed, dailyLimit, aiUsed, aiLimit, canApply, canUseAi, refresh: load }}>
      {children}
    </Ctx.Provider>
  )
}

export function useProfile() { return useContext(Ctx) }
