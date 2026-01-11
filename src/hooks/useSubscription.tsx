import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import type { PlanType } from '@/constants/subscriptions'

interface SubscriptionData {
  plan: PlanType
  scheduledPlan?: PlanType | null
  generationsUsed: number
  generationsLimit: number
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionStatus: string | null
  currentPeriodEnd: Date | null
}

export const useSubscription = () => {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false) // Track if we've already fetched

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    // Only fetch once per session, unless explicitly called via refetch
    if (hasFetched.current) {
      return
    }

    console.log('🔄 Fetching subscription data...')
    hasFetched.current = true

    try {
      setLoading(true)
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const data = await response.json()
      setSubscription(data.subscription)
      setError(null)
      console.log('✅ Subscription data loaded')
    } catch (err) {
      console.error('❌ Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      hasFetched.current = false // Reset on error so it can retry
    } finally {
      setLoading(false)
    }
  }, [user?.id]) // Only depend on user ID, not entire user object

  // Manual refetch function that bypasses the hasFetched check
  const refetch = useCallback(async () => {
    if (!user) return

    console.log('🔄 Manual refetch triggered...')

    try {
      setLoading(true)
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const data = await response.json()
      setSubscription(data.subscription)
      setError(null)
      console.log('✅ Subscription data refreshed')
      return data
    } catch (err) {
      console.error('❌ Error refetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const canGenerate = subscription
    ? subscription.generationsUsed < subscription.generationsLimit
    : false

  const remainingGenerations = subscription
    ? Math.max(0, subscription.generationsLimit - subscription.generationsUsed)
    : 0

  const usagePercentage = subscription
    ? (subscription.generationsUsed / subscription.generationsLimit) * 100
    : 0

  const isActive =
    subscription?.subscriptionStatus === 'active' ||
    subscription?.plan === 'free'

  return {
    subscription,
    loading,
    error,
    canGenerate,
    remainingGenerations,
    usagePercentage,
    isActive,
    refetch, // Use the dedicated refetch function instead of fetchSubscription
  }
}
