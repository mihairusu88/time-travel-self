import type { PlanType } from '@/constants/subscriptions'

export interface ButtonTextResult {
  text: string
  icon: 'upgrade' | 'downgrade' | 'subscribe' | 'current'
}

/**
 * Get the appropriate button text for a subscription action
 * @param currentPlan - The user's current plan (or null if no subscription)
 * @param targetPlan - The plan the user wants to switch to
 * @param isCanceling - Whether the current subscription is scheduled for cancellation
 * @returns Object with button text and icon type
 */
export const getSubscriptionButtonText = (
  currentPlan: PlanType | null,
  targetPlan: PlanType,
  isCanceling: boolean = false
): ButtonTextResult => {
  // If user is not subscribed or is on free plan
  if (!currentPlan || currentPlan === 'free') {
    if (targetPlan === 'free') {
      return { text: 'Current Plan', icon: 'current' }
    }
    return {
      text: `Upgrade to ${targetPlan === 'pro' ? 'Pro' : 'Premium'}`,
      icon: 'upgrade',
    }
  }

  // If the current plan matches target plan
  if (currentPlan === targetPlan) {
    return {
      text: isCanceling ? 'Reactivate Plan' : 'Current Plan',
      icon: 'current',
    }
  }

  // Determine if it's an upgrade or downgrade
  const planHierarchy: Record<PlanType, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  }

  const currentLevel = planHierarchy[currentPlan]
  const targetLevel = planHierarchy[targetPlan]

  if (targetLevel > currentLevel) {
    // Upgrading
    return {
      text: `Upgrade to ${targetPlan === 'premium' ? 'Premium' : 'Pro'}`,
      icon: 'upgrade',
    }
  } else {
    // Downgrading
    return {
      text: `Downgrade to ${targetPlan === 'free' ? 'Free' : 'Pro'}`,
      icon: 'downgrade',
    }
  }
}

/**
 * Check if a target plan is available for the current user
 * @param currentPlan - The user's current plan
 * @param targetPlan - The plan to check availability for
 * @param isCanceling - Whether the current subscription is scheduled for cancellation
 * @param scheduledPlan - The plan scheduled to take effect at period end
 * @returns true if the plan can be selected
 */
export const canSelectPlan = (
  currentPlan: PlanType | null,
  targetPlan: PlanType,
  isCanceling: boolean = false,
  scheduledPlan: PlanType | null = null
): boolean => {
  // Cannot select a plan that is already scheduled
  if (scheduledPlan === targetPlan) {
    return false
  }

  // Can always select a different plan
  if (currentPlan !== targetPlan) {
    return true
  }

  // Can select current plan if it's canceling (to reactivate)
  if (isCanceling && currentPlan === targetPlan) {
    return true
  }

  // Cannot select current active plan
  return false
}

/**
 * Check if a plan is scheduled to take effect
 * @param targetPlan - The plan to check
 * @param scheduledPlan - The scheduled plan from subscription
 * @returns true if this plan is scheduled
 */
export const isPlanScheduled = (
  targetPlan: PlanType,
  scheduledPlan: PlanType | null
): boolean => {
  return scheduledPlan === targetPlan
}
