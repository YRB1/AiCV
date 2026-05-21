export type Tier = 'free' | 'pro' | 'student'
export type Billing = 'monthly' | 'yearly'

export const PLANS: Record<Tier, {
  name: string
  monthlyPrice: number
  yearlyPrice: number        // per month, billed annually
  yearlyTotal: number        // actual charge per year
  dailyLimit: number | null
  aiEnabled: boolean
  aiGenerations: number | null
  badge: string
  features: string[]
  // Fill these in after creating products in Stripe dashboard
  stripePriceMonthly: string | null
  stripePriceYearly: string | null
}> = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyTotal: 0,
    dailyLimit: 15,
    aiEnabled: true,
    aiGenerations: 3,
    badge: 'Free',
    features: [
      '15 applications / day',
      '3 AI cover letters / day',
      'Job board search',
      'Application tracker',
      'Email & phone finder',
    ],
    stripePriceMonthly: null,
    stripePriceYearly: null,
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 20,
    yearlyPrice: 16,
    yearlyTotal: 192,
    dailyLimit: 100,
    aiEnabled: true,
    aiGenerations: null,
    badge: 'Pro',
    features: [
      '100 applications / day',
      'Unlimited AI cover letters',
      'Full AI CV tailoring',
      'Auto-apply to matches',
      'Interview prep AI',
      'Priority support',
    ],
    stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? null,
    stripePriceYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? null,
  },
  student: {
    name: 'Student',
    monthlyPrice: 15,
    yearlyPrice: 12,
    yearlyTotal: 144,
    dailyLimit: 100,
    aiEnabled: true,
    aiGenerations: null,
    badge: 'Student',
    features: [
      'Everything in Pro',
      'Student verified badge',
      'University job board access',
      'Graduate scheme matching',
      'Campus career fair alerts',
      'Priority support',
    ],
    stripePriceMonthly: process.env.STRIPE_PRICE_STUDENT_MONTHLY ?? null,
    stripePriceYearly: process.env.STRIPE_PRICE_STUDENT_YEARLY ?? null,
  },
}

export function getPlan(tier: Tier) {
  return PLANS[tier] ?? PLANS.free
}

export function getStripePriceId(tier: Tier, billing: Billing): string | null {
  const plan = getPlan(tier)
  return billing === 'yearly' ? plan.stripePriceYearly : plan.stripePriceMonthly
}

export function getDailyLimit(tier: Tier): number | null {
  return getPlan(tier).dailyLimit
}

export function isAiEnabled(tier: Tier): boolean {
  return getPlan(tier).aiEnabled
}

export function getAiGenerationLimit(tier: Tier): number | null {
  return getPlan(tier).aiGenerations
}
