'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SUBSCRIPTION_PLANS, type PlanType } from '@/constants/subscriptions'
import { Check, Loader2 } from 'lucide-react'

interface PricingSectionProps {
  showHeader?: boolean
  showFAQ?: boolean
}

export const PricingSection = ({
  showHeader = true,
  showFAQ = false,
}: PricingSectionProps) => {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const router = useRouter()
  const [loading, setLoading] = useState<PlanType | null>(null)

  const handleSelectPlan = async (plan: PlanType) => {
    if (!user) {
      // Not logged in - redirect to login
      toast.info('Login Required', {
        description: 'Please log in to subscribe to a plan',
        duration: 3000,
      })
      router.push('/login')
      return
    }

    // Check if user is on free plan
    const isFreeUser = !subscription || subscription.plan === 'free'

    if (isFreeUser && (plan === 'pro' || plan === 'premium')) {
      // Free user wants to subscribe - redirect to Stripe Checkout
      setLoading(plan)

      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan }),
        })

        if (!response.ok) {
          throw new Error('Failed to create checkout session')
        }

        const data = await response.json()

        if (data.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL returned')
        }
      } catch (error) {
        console.error('Error creating checkout session:', error)
        toast.error('Checkout Failed', {
          description: 'Failed to start checkout. Please try again.',
          duration: 4000,
        })
        setLoading(null)
      }
    } else {
      // User already has a subscription - redirect to settings to manage
      router.push('/settings')
    }
  }

  const plans: PlanType[] = ['free', 'pro', 'premium']

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer:
        "Yes! You can cancel your subscription at any time from your settings page. You'll retain access until the end of your billing period.",
    },
    {
      question: 'What happens if I exceed my generation limit?',
      answer:
        "You won't be able to generate new images until your next billing cycle or until you upgrade to a higher plan with more generations.",
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer:
        'Yes! You can upgrade or downgrade at any time. Changes take effect immediately with prorated billing.',
    },
  ]

  return (
    <section
      className={`text-center relative ${!showHeader ? 'md:my-12' : ''}`}
      id="pricing"
    >
      {showHeader && (
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start creating amazing hero images today. Upgrade anytime to unlock
            more features and generations.
          </p>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-6xl">
        {plans.map(planId => {
          const plan = SUBSCRIPTION_PLANS[planId]
          const isPopular = plan.highlighted
          const isLoading = loading === planId

          return (
            <div
              key={planId}
              className={`flex flex-col gap-6 rounded-2xl p-8 shadow-lg bg-card ${
                isPopular
                  ? 'relative border-2 border-primary shadow-2xl scale-105'
                  : 'border border-gray-200 dark:border-gray-700 bg-card'
              } transition-all duration-300 hover:scale-105`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-bold text-white">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center">
                <h3
                  className={`text-2xl font-bold ${isPopular ? 'text-primary' : 'text-gray-900 dark:text-white'}`}
                >
                  {plan.name}
                </h3>
                <p className="text-4xl font-black text-gray-900 dark:text-white">
                  ${plan.price}
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </p>
              </div>

              {/* Features List */}
              <ul className="flex-1 space-y-3 text-left">
                {plan.features.map((feature, index) => (
                  <li className="flex items-center gap-3" key={index}>
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleSelectPlan(planId)}
                disabled={isLoading}
                className={`w-full rounded-lg text-md h-12 py-3 font-bold transition-colors ${
                  isPopular
                    ? 'bg-primary text-white shadow-lg transition-transform hover:scale-105'
                    : 'bg-primary/20 dark:bg-primary/20 text-primary hover:bg-primary/30 dark:hover:bg-primary/40'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Select ${plan.name}`
                )}
              </Button>
            </div>
          )
        })}
      </div>

      {/* FAQ Section */}
      {showFAQ && (
        <div className="mt-20 mb-4 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="cursor-pointer rounded-xl bg-card !border border-gray-200 dark:border-gray-700 px-6 py-4 text-left"
              >
                <AccordionTrigger className="cursor-pointer font-bold text-lg text-gray-900 dark:text-white hover:text-primary text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="mt-4 text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </section>
  )
}
