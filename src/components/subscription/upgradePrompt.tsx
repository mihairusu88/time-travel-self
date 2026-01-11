'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Crown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions'

interface UpgradePromptProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  currentPlan?: string
}

export const UpgradePrompt = ({
  open,
  onClose,
  title = 'Generation Limit Reached',
  description = "You've used all your generations for this month. Upgrade to continue creating amazing hero images!",
  currentPlan = 'free',
}: UpgradePromptProps) => {
  const recommendedPlan = currentPlan === 'free' ? 'Pro' : 'Premium'

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md sm:max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-2xl">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 dark:from-primary/20 dark:to-purple-600/20 rounded-xl p-6 my-4">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {recommendedPlan} Plan Benefits:
          </h4>
          <ul className="space-y-2">
            {currentPlan === 'free' ? (
              <>
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  ✨ {SUBSCRIPTION_PLANS['pro'].generationsLimit} generations
                  per month
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  🎨 {SUBSCRIPTION_PLANS['pro'].features[1]}
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  🖼️ {SUBSCRIPTION_PLANS['pro'].features[2]}
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  🎯 {SUBSCRIPTION_PLANS['pro'].features[3]}
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  💼 {SUBSCRIPTION_PLANS['pro'].features[4]}
                </li>
              </>
            ) : (
              <>
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  ✨ {SUBSCRIPTION_PLANS['premium'].generationsLimit}{' '}
                  generations per month
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  🎨 {SUBSCRIPTION_PLANS['premium'].features[1]}
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  ⚡ {SUBSCRIPTION_PLANS['premium'].features[2]}
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  🎯 {SUBSCRIPTION_PLANS['premium'].features[3]}
                </li>
              </>
            )}
          </ul>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full max-w-1/2"
          >
            Maybe Later
          </Button>
          <Link href="/pricing" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
              Upgrade to {recommendedPlan}
            </Button>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
