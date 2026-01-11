export type PlanType = 'free' | 'pro' | 'premium'

export interface SubscriptionPlan {
  id: PlanType
  name: string
  price: number
  interval: 'month' | 'year'
  stripePriceId?: string
  features: string[]
  generationsLimit: number
  highlighted?: boolean
}

const plansData = {
  free: {
    id: 'free',
    name: 'Free',
    interval: 'month',
    price: 0,
    generationsLimit: 2,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    interval: 'month',
    price: 12.99,
    generationsLimit: 150,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    interval: 'month',
    price: 34.99,
    generationsLimit: 200,
  },
}

export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  free: {
    id: plansData.free.id as PlanType,
    name: plansData.free.name,
    price: plansData.free.price,
    interval: plansData.free.interval as 'month' | 'year',
    generationsLimit: plansData.free.generationsLimit,
    features: [
      `${plansData.free.generationsLimit} generations per month`,
      'Watermark on images',
      '1K quality',
      'Limited templates',
      'Community support',
      'Commercial usage rights',
    ],
  },
  pro: {
    id: plansData.pro.id as PlanType,
    name: plansData.pro.name,
    price: plansData.pro.price,
    interval: plansData.pro.interval as 'month' | 'year',
    stripePriceId: process.env.STRIPE_PRO_PLAN_PRICE_ID,
    generationsLimit: plansData.pro.generationsLimit,
    highlighted: true,
    features: [
      `${plansData.pro.generationsLimit} generations per month`,
      'No watermark',
      '1K, 2K quality',
      'All templates',
      'Priority support',
      'Commercial usage rights',
    ],
  },
  premium: {
    id: plansData.premium.id as PlanType,
    name: plansData.premium.name,
    price: plansData.premium.price,
    interval: plansData.premium.interval as 'month' | 'year',
    stripePriceId: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
    generationsLimit: plansData.premium.generationsLimit,
    features: [
      `${plansData.premium.generationsLimit} generations per month`,
      'No watermark',
      '1K, 2K, 4K quality',
      'Custom dimensions (1024-4096px)',
      'All templates',
      'Custom templates',
      'Priority support',
      'Commercial usage rights',
    ],
  },
}

export const getPlanByType = (planType: PlanType): SubscriptionPlan => {
  return SUBSCRIPTION_PLANS[planType] || SUBSCRIPTION_PLANS.free
}

export const getPlanFeatures = (planType: PlanType): string[] => {
  return getPlanByType(planType).features
}

export const getGenerationsLimit = (planType: PlanType): number => {
  return getPlanByType(planType).generationsLimit
}

export const canUpgrade = (
  currentPlan: PlanType,
  targetPlan: PlanType
): boolean => {
  const planOrder: PlanType[] = ['free', 'pro', 'premium']
  return planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan)
}

export const canDowngrade = (
  currentPlan: PlanType,
  targetPlan: PlanType
): boolean => {
  const planOrder: PlanType[] = ['free', 'pro', 'premium']
  return planOrder.indexOf(targetPlan) < planOrder.indexOf(currentPlan)
}
