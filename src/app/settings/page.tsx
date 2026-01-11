'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SUBSCRIPTION_PLANS, type PlanType } from '@/constants/subscriptions'
import {
  Crown,
  Loader2,
  TrendingUp,
  Calendar,
  Zap,
  AlertCircle,
  RotateCcw,
  TrendingDown,
  Check,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const {
    subscription,
    loading: subLoading,
    remainingGenerations,
    usagePercentage,
    refetch,
  } = useSubscription()
  const router = useRouter()
  const [canceling, setCanceling] = useState(false)
  const [reactivating, setReactivating] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false)
  const [selectedPlanChange, setSelectedPlanChange] = useState<PlanType | null>(
    null
  )
  const [upgradingTo, setUpgradingTo] = useState<PlanType | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Check for downgrade notification from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('downgraded') === 'true') {
      toast.success('Plan Change Scheduled', {
        description:
          'Your plan change will take effect at the end of your billing period. You will keep your current benefits until then.',
        duration: 6000,
      })
      // Clean up URL
      window.history.replaceState({}, '', '/settings')
    }
  }, [])

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = async () => {
    setShowCancelDialog(false)
    setCanceling(true)

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const data = await response.json()

      toast.success('Subscription Scheduled for Cancellation', {
        description: `Your subscription will remain active until ${
          data.cancelsAt
            ? new Date(data.cancelsAt).toLocaleDateString()
            : 'the end of your billing period'
        }. You'll keep all premium features until then.`,
        duration: 6000,
      })

      // Refresh subscription data
      await refetch()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast.error('Cancellation Failed', {
        description: 'Failed to cancel subscription. Please try again.',
        duration: 4000,
      })
    } finally {
      setCanceling(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setReactivating(true)

    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription')
      }

      toast.success('Subscription Reactivated', {
        description:
          'Your subscription has been reactivated and will continue as normal.',
        duration: 5000,
      })

      // Refresh subscription data
      await refetch()
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      toast.error('Reactivation Failed', {
        description: 'Failed to reactivate subscription. Please try again.',
        duration: 4000,
      })
    } finally {
      setReactivating(false)
    }
  }

  const handleUpgradeClick = (targetPlan: PlanType) => {
    // If clicking on current plan while canceling, reactivate instead
    if (isCanceling && subscription && subscription.plan === targetPlan) {
      handleReactivateSubscription()
      return
    }

    // Show confirmation modal
    setSelectedPlanChange(targetPlan)
    setShowPlanChangeDialog(true)
  }

  const handleConfirmPlanChange = async () => {
    if (!selectedPlanChange) return

    setShowPlanChangeDialog(false)
    setUpgradingTo(selectedPlanChange)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlanChange }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe checkout or settings
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error changing plan:', error)
      toast.error('Plan Change Failed', {
        description: 'Failed to change plan. Please try again.',
        duration: 4000,
      })
      setUpgradingTo(null)
    }
  }

  if (authLoading || subLoading || !subscription) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-background">
        <div className="text-center">
          <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Settings...
          </h2>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const currentPlan = SUBSCRIPTION_PLANS[subscription.plan]
  const isFreePlan = subscription.plan === 'free'
  const isProPlan = subscription.plan === 'pro'
  const isPremiumPlan = subscription.plan === 'premium'
  const scheduledPlan = subscription?.scheduledPlan || null
  const isProScheduled = scheduledPlan === 'pro'
  const isPremiumScheduled = scheduledPlan === 'premium'
  const isCanceling = subscription.subscriptionStatus === 'canceling'
  const hasScheduledPlan = !!subscription.scheduledPlan
  const scheduledPlanName = hasScheduledPlan
    ? SUBSCRIPTION_PLANS[subscription.scheduledPlan as PlanType]?.name
    : null

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-background font-display">
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white mb-2">
              Account Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage your subscription and usage
            </p>
          </div>

          {/* Scheduled Plan Change Banner */}
          {hasScheduledPlan && subscription.currentPeriodEnd && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-500 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
                    Plan Change Scheduled
                  </h3>
                  <p className="text-blue-800 dark:text-blue-400 text-sm">
                    Your plan will switch to{' '}
                    <span className="font-semibold">{scheduledPlanName}</span>{' '}
                    on{' '}
                    <span className="font-semibold">
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </span>
                    . You&apos;ll keep your current {currentPlan.name} features
                    and generation limit (
                    <span className="font-semibold">
                      {subscription.generationsLimit}
                    </span>
                    ) until then. After that date, your limit will adjust to the
                    new plan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Warning Banner */}
          {isCanceling && subscription.currentPeriodEnd && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 dark:text-orange-300 mb-2">
                    Subscription Canceling
                  </h3>
                  <p className="text-orange-800 dark:text-orange-400 text-sm mb-4">
                    Your subscription will end on{' '}
                    <span className="font-semibold">
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </span>
                    . You&apos;ll keep all {currentPlan.name} features until
                    then. After that, you&apos;ll be moved to the Free plan.
                  </p>
                  <Button
                    onClick={handleReactivateSubscription}
                    disabled={reactivating}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {reactivating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Reactivating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Don&apos;t Cancel Subscription
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Current Plan Card */}
          <div className="bg-card rounded-2xl p-8 ring-1 ring-gray-200 dark:ring-gray-700 mb-8">
            <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between mb-6">
              <div className="flex w-full items-center gap-3">
                <Crown
                  className={`w-8 h-8 ${
                    isPremiumPlan
                      ? 'text-yellow-500'
                      : isProPlan
                        ? 'text-primary'
                        : 'text-gray-400'
                  }`}
                />
                <div className="flex flex-col flex-grow">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentPlan.name} Plan
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isFreePlan ? (
                      'Start creating amazing hero images'
                    ) : (
                      <span className="flex flex-col md:flex-row md:items-center gap-2">
                        <span className="font-bold text-primary">
                          ${currentPlan.price}/month
                        </span>
                        {subscription.currentPeriodEnd && (
                          <span>
                            •{' '}
                            {isCanceling
                              ? `Ends ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                              : `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                          </span>
                        )}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {!isFreePlan && !isCanceling && (
                <Button
                  variant="outline"
                  onClick={handleCancelClick}
                  disabled={canceling}
                  className="!border-primary text-primary hover:text-white hover:bg-primary/50 dark:hover:bg-primary"
                >
                  {canceling ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Canceling...
                    </span>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              )}
              {isCanceling && (
                <div className="text-right">
                  <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-4 py-2 rounded-lg text-sm font-medium">
                    Canceling at Period End
                  </span>
                </div>
              )}
            </div>

            {/* Usage Stats */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-bold text-gray-900 dark:text-white">
                      Generation Usage
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {subscription.generationsUsed} /{' '}
                    {subscription.generationsLimit} used
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-3" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {remainingGenerations} generations remaining
                  </span>
                  {usagePercentage >= 80 && (
                    <span className="text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Running low
                    </span>
                  )}
                </div>
              </div>

              {/* Cancellation Details */}
              {isCanceling && subscription.currentPeriodEnd && (
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Subscription Ending Soon
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your {currentPlan.name} subscription will end on{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(
                            subscription.currentPeriodEnd
                          ).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        . After this date, you&apos;ll be moved to the Free plan
                        with {SUBSCRIPTION_PLANS['free'].generationsLimit}{' '}
                        generations per month.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Available Plans - Always Visible */}
          <div className="bg-primary/10 rounded-2xl p-8 mb-8 border-1 border-primary/30">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Available Plans
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Pro Plan Option */}
              <div
                className={`flex flex-col bg-card rounded-xl p-6 border-1 ${
                  isProPlan && !isCanceling
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    Pro Plan
                  </h4>
                  {isProScheduled ? (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      SCHEDULED
                    </span>
                  ) : isProPlan && !isCanceling ? (
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      SELECTED
                    </span>
                  ) : null}
                </div>
                <p className="text-3xl font-black text-primary mb-4">
                  ${SUBSCRIPTION_PLANS['pro'].price}
                  <span className="text-sm font-medium text-gray-500">
                    /month
                  </span>
                </p>
                <ul className="space-y-2 mb-4">
                  {SUBSCRIPTION_PLANS['pro'].features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <Check className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgradeClick('pro')}
                  disabled={
                    upgradingTo === 'pro' ||
                    reactivating ||
                    (isProPlan && !isCanceling) ||
                    isProScheduled
                  }
                  className={`w-full mt-auto ${
                    isProScheduled
                      ? 'bg-blue-600 hover:bg-blue-600 text-white cursor-not-allowed'
                      : isProPlan && !isCanceling
                        ? 'bg-green-600 hover:bg-green-600 text-white cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-white'
                  }`}
                >
                  {upgradingTo === 'pro' || (reactivating && isProPlan) ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {reactivating && isProPlan
                        ? 'Reactivating...'
                        : 'Processing...'}
                    </span>
                  ) : isProScheduled ? (
                    'Scheduled'
                  ) : isProPlan && !isCanceling ? (
                    'Current Plan'
                  ) : isCanceling && isProPlan ? (
                    'Reactivate Plan'
                  ) : (
                    'Select Pro'
                  )}
                </Button>
              </div>

              {/* Premium Plan Option */}
              <div
                className={`bg-card rounded-xl p-6 border-1 ${
                  isPremiumPlan && !isCanceling
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-primary'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    Premium Plan
                  </h4>
                  {isPremiumScheduled ? (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      SCHEDULED
                    </span>
                  ) : isPremiumPlan && !isCanceling ? (
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      SELECTED
                    </span>
                  ) : (
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                      BEST VALUE
                    </span>
                  )}
                </div>
                <p className="text-3xl font-black text-primary mb-4">
                  ${SUBSCRIPTION_PLANS['premium'].price}
                  <span className="text-sm font-medium text-gray-500">
                    /month
                  </span>
                </p>
                <ul className="space-y-2 mb-4">
                  {SUBSCRIPTION_PLANS['premium'].features.map(
                    (feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Check className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    )
                  )}
                </ul>
                <Button
                  onClick={() => handleUpgradeClick('premium')}
                  disabled={
                    upgradingTo === 'premium' ||
                    reactivating ||
                    (isPremiumPlan && !isCanceling) ||
                    isPremiumScheduled
                  }
                  className={`w-full ${
                    isPremiumScheduled
                      ? 'bg-blue-600 hover:bg-blue-600 text-white cursor-not-allowed'
                      : isPremiumPlan && !isCanceling
                        ? 'bg-green-600 hover:bg-green-600 text-white cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-white'
                  }`}
                >
                  {upgradingTo === 'premium' ||
                  (reactivating && isPremiumPlan) ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {reactivating && isPremiumPlan
                        ? 'Reactivating...'
                        : 'Processing...'}
                    </span>
                  ) : isPremiumScheduled ? (
                    'Scheduled'
                  ) : isPremiumPlan && !isCanceling ? (
                    'Current Plan'
                  ) : isCanceling && isPremiumPlan ? (
                    'Reactivate Plan'
                  ) : (
                    'Select Premium'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Current Plan Features */}
          <div className="bg-card rounded-2xl p-8 ring-1 ring-gray-200 dark:ring-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Your Plan Includes
            </h3>
            <ul className="space-y-3">
              {currentPlan.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                >
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Need Help Section */}
          <div className="mt-8 bg-card rounded-xl p-6 text-center border-1 border-gray-300 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Need help with your subscription?
            </p>
            <Button variant="outline" onClick={() => router.push('/contact')}>
              Contact Support
            </Button>
          </div>
        </div>
      </main>

      {/* Plan Change Confirmation Dialog */}
      {selectedPlanChange && (
        <AlertDialog
          open={showPlanChangeDialog}
          onOpenChange={setShowPlanChangeDialog}
        >
          <AlertDialogContent className="max-w-md sm:max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {subscription &&
                subscription.plan === 'premium' &&
                selectedPlanChange !== 'premium' ? (
                  <>
                    <TrendingDown className="w-6 h-6 text-orange-500" />
                    Switch to {SUBSCRIPTION_PLANS[selectedPlanChange].name}?
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    Upgrade to {SUBSCRIPTION_PLANS[selectedPlanChange].name}?
                  </>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
                You&apos;re currently on the{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {subscription && SUBSCRIPTION_PLANS[subscription.plan].name}
                </span>{' '}
                plan. Switching to{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {SUBSCRIPTION_PLANS[selectedPlanChange].name}
                </span>{' '}
                will update your subscription.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Plan Details */}
            <div className="space-y-3 px-6">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {SUBSCRIPTION_PLANS[selectedPlanChange].name} includes:
                </p>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {SUBSCRIPTION_PLANS[selectedPlanChange].features
                    .slice(0, 4)
                    .map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Downgrade notice */}
              {subscription &&
                subscription.plan === 'premium' &&
                selectedPlanChange !== 'premium' && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4">
                    <p className="text-sm text-orange-900 dark:text-orange-300">
                      <span className="font-semibold">Important:</span> Your
                      current generation limit ({subscription.generationsLimit})
                      will be preserved until{' '}
                      {subscription.currentPeriodEnd &&
                        new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()}
                      . After that, you&apos;ll have{' '}
                      {SUBSCRIPTION_PLANS[selectedPlanChange].generationsLimit}{' '}
                      generations per month.
                    </p>
                  </div>
                )}

              {/* Upgrade notice */}
              {subscription &&
                subscription.plan !== 'premium' &&
                selectedPlanChange === 'premium' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      Upgrade:
                    </span>{' '}
                    You&apos;ll be charged the prorated difference for the
                    remaining billing period.
                  </p>
                )}
            </div>

            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmPlanChange}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
              >
                Confirm Change
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Cancel Subscription Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-md sm:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              Cancel Subscription?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel your{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {subscription && SUBSCRIPTION_PLANS[subscription.plan].name}
              </span>{' '}
              subscription?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Warning Section - Outside AlertDialogDescription to avoid nesting issues */}
          <div className="space-y-3 px-6">
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-red-900 dark:text-red-300 text-sm">
                You will lose access to:
              </p>
              <ul className="space-y-1 text-sm text-red-800 dark:text-red-400">
                {subscription &&
                  SUBSCRIPTION_PLANS[subscription.plan].features
                    .slice(0, 4)
                    .map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
              </ul>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your subscription will remain active until the end of your billing
              period on{' '}
              {subscription?.currentPeriodEnd &&
                new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              . After that, you&apos;ll be downgraded to the Free plan.
            </p>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
