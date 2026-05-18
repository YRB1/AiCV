export type Tier = 'basic' | 'pro' | 'unlimited'

export const PLANS = {
  basic: {
    name: 'Basic',
    price: 20,
    dailyLimit: 30,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!,
    features: ['30 Bewerbungen / Tag', 'KI-Personalisierung', 'Word-Export', 'Email-Versand'],
  },
  pro: {
    name: 'Pro',
    price: 39,
    dailyLimit: 60,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
    features: ['60 Bewerbungen / Tag', 'KI-Personalisierung', 'Word-Export', 'Email-Versand', 'Priorität-Support'],
  },
  unlimited: {
    name: 'Unlimited',
    price: 55,
    dailyLimit: null,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED!,
    features: ['Unlimitierte Bewerbungen', 'KI-Personalisierung', 'Word-Export', 'Email-Versand', 'Priorität-Support', 'Früher Zugang zu neuen Features'],
  },
} as const

export function getDailyLimit(tier: Tier): number | null {
  return PLANS[tier].dailyLimit
}