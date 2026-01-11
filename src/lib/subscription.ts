import { prisma } from './prisma'
import { getActiveSubscription, getPlanFromPriceId } from './stripe'
import {
  getGenerationsLimit,
  SUBSCRIPTION_PLANS,
  type PlanType,
} from '@/constants/subscriptions'

export interface UserSubscription {
  plan: PlanType
  scheduledPlan?: PlanType | null
  generationsUsed: number
  generationsLimit: number
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionStatus: string | null
  currentPeriodEnd: Date | null
}

// Sync user subscription from Stripe to database
export const syncUserSubscription = async (
  userId: string,
  email: string
): Promise<UserSubscription> => {
  try {
    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      // Create user with free plan
      user = await prisma.user.create({
        data: {
          id: userId,
          email,
          plan: 'free',
          generationsUsed: 0,
          generationsLimit: SUBSCRIPTION_PLANS.free.generationsLimit,
        },
      })

      return {
        plan: 'free',
        scheduledPlan: null,
        generationsUsed: 0,
        generationsLimit: SUBSCRIPTION_PLANS.free.generationsLimit,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionStatus: null,
        currentPeriodEnd: null,
      }
    }

    // If user has no Stripe customer ID, return current plan
    if (!user.stripeCustomerId) {
      return {
        plan: user.plan as PlanType,
        scheduledPlan: user.scheduledPlan as PlanType | null,
        generationsUsed: user.generationsUsed,
        generationsLimit: user.generationsLimit,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        currentPeriodEnd: user.currentPeriodEnd,
      }
    }

    // Fetch active subscription from Stripe
    const activeSubscription = await getActiveSubscription(
      user.stripeCustomerId
    )

    if (!activeSubscription) {
      // No active subscription - downgrade to free if not already
      if (user.plan !== 'free') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'free',
            generationsLimit: SUBSCRIPTION_PLANS.free.generationsLimit,
            subscriptionStatus: 'canceled',
            stripeSubscriptionId: null,
          },
        })

        return {
          plan: 'free',
          scheduledPlan: null,
          generationsUsed: user.generationsUsed,
          generationsLimit: SUBSCRIPTION_PLANS.free.generationsLimit,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: null,
          subscriptionStatus: 'canceled',
          currentPeriodEnd: user.currentPeriodEnd,
        }
      }

      return {
        plan: user.plan as PlanType,
        scheduledPlan: user.scheduledPlan as PlanType | null,
        generationsUsed: user.generationsUsed,
        generationsLimit: user.generationsLimit,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        currentPeriodEnd: user.currentPeriodEnd,
      }
    }

    // Get plan from price ID
    const stripePlan =
      getPlanFromPriceId(activeSubscription.items.data[0].price.id) || 'free'
    const stripeGenerationsLimit = getGenerationsLimit(stripePlan)

    // Get current period end - Try multiple sources
    let currentPeriodEndTimestamp: number | null = null

    // 1. Try items[0].current_period_end (most reliable)
    if (activeSubscription.items?.data?.[0]) {
      const itemPeriodEnd = (
        activeSubscription.items.data[0] as unknown as {
          current_period_end?: number
        }
      ).current_period_end
      if (itemPeriodEnd) {
        currentPeriodEndTimestamp = itemPeriodEnd
      }
    }

    // 2. Try subscription-level current_period_end
    if (
      !currentPeriodEndTimestamp &&
      'current_period_end' in activeSubscription
    ) {
      currentPeriodEndTimestamp = (
        activeSubscription as unknown as {
          current_period_end: number
        }
      ).current_period_end
    }

    const currentPeriodEnd = currentPeriodEndTimestamp
      ? new Date(currentPeriodEndTimestamp * 1000)
      : null

    // Check if subscription is set to cancel at period end
    const cancelAtPeriodEnd =
      'cancel_at_period_end' in activeSubscription &&
      (activeSubscription as unknown as { cancel_at_period_end: boolean })
        .cancel_at_period_end

    // Determine subscription status
    let subscriptionStatus: string = activeSubscription.status
    if (cancelAtPeriodEnd && activeSubscription.status === 'active') {
      subscriptionStatus = 'canceling' // Custom status for canceling at period end
    }

    // Check if we should protect the current plan and limit
    // Don't update plan/limit from Stripe if:
    // 1. User has a scheduled plan change (downgrade scheduled), OR
    // 2. User is canceling (cancel_at_period_end is true)
    // In both cases, user has paid for current benefits until period end
    const hasScheduledPlan = user.scheduledPlan !== null
    const isCanceling = subscriptionStatus === 'canceling'
    const shouldProtectPlan = hasScheduledPlan || isCanceling

    // Prepare update data
    const updateData: {
      plan?: string
      generationsLimit?: number
      stripeSubscriptionId: string
      subscriptionStatus: string
      currentPeriodEnd: Date | null
      scheduledPlan?: null
    } = {
      stripeSubscriptionId: activeSubscription.id,
      subscriptionStatus,
      currentPeriodEnd,
    }

    // Protect current plan and limit if needed
    if (shouldProtectPlan) {
      if (hasScheduledPlan) {
        console.log(
          `⏸️  Scheduled plan (${user.scheduledPlan}) detected. Keeping current plan (${user.plan}) and limit (${user.generationsLimit}) until period end.`
        )
      }
      if (isCanceling) {
        console.log(
          `⏸️  Subscription canceling. Keeping current plan (${user.plan}) and limit (${user.generationsLimit}) until period end.`
        )
      }
      // Don't set plan or generationsLimit - keep existing values
    } else {
      // No protection needed - update normally from Stripe
      updateData.plan = stripePlan
      updateData.generationsLimit = stripeGenerationsLimit
    }

    // Update user subscription data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return {
      plan: updatedUser.plan as PlanType,
      scheduledPlan: updatedUser.scheduledPlan as PlanType | null,
      generationsUsed: updatedUser.generationsUsed,
      generationsLimit: updatedUser.generationsLimit,
      stripeCustomerId: updatedUser.stripeCustomerId,
      stripeSubscriptionId: updatedUser.stripeSubscriptionId,
      subscriptionStatus: updatedUser.subscriptionStatus,
      currentPeriodEnd: updatedUser.currentPeriodEnd,
    }
  } catch (error) {
    console.error('Error syncing user subscription:', error)
    throw new Error('Failed to sync user subscription')
  }
}

// Get user subscription data
export const getUserSubscriptionData = async (
  userId: string
): Promise<UserSubscription | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return null
    }

    return {
      plan: user.plan as PlanType,
      scheduledPlan: user.scheduledPlan as PlanType | null,
      generationsUsed: user.generationsUsed,
      generationsLimit: user.generationsLimit,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      subscriptionStatus: user.subscriptionStatus,
      currentPeriodEnd: user.currentPeriodEnd,
    }
  } catch (error) {
    console.error('Error getting user subscription:', error)
    return null
  }
}

// Increment generation count
export const incrementGenerationCount = async (
  userId: string
): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        generationsUsed: {
          increment: 1,
        },
      },
    })
  } catch (error) {
    console.error('Error incrementing generation count:', error)
    throw new Error('Failed to increment generation count')
  }
}

// Check if user can generate
export const canUserGenerate = async (userId: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return false
    }

    return user.generationsUsed < user.generationsLimit
  } catch (error) {
    console.error('Error checking if user can generate:', error)
    return false
  }
}

// Reset monthly generations (to be called on subscription renewal)
export const resetMonthlyGenerations = async (
  userId: string
): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        generationsUsed: 0,
      },
    })
  } catch (error) {
    console.error('Error resetting monthly generations:', error)
    throw new Error('Failed to reset monthly generations')
  }
}
