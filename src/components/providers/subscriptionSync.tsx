'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

export const SubscriptionSync = () => {
  const { user } = useAuth()
  const hasSynced = useRef(false)

  useEffect(() => {
    const syncSubscription = async () => {
      // Only sync once per session
      if (!user || hasSynced.current) return

      try {
        console.log('🔄 Syncing subscription with Stripe...')
        await fetch('/api/stripe/sync-subscription', {
          method: 'POST',
        })
        console.log('✅ Subscription synced successfully')
        hasSynced.current = true
      } catch (error) {
        console.error('❌ Error syncing subscription:', error)
        // Silent fail - don't interrupt user experience
      }
    }

    syncSubscription()
  }, [user?.id]) // Only depend on user ID, not entire user object

  // This component doesn't render anything
  return null
}
