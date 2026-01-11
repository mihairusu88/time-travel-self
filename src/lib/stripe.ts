import Stripe from 'stripe'
import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

// Client-side Stripe instance
let stripePromise: Promise<StripeClient | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Create Stripe customer
export const createStripeCustomer = async (
  email: string,
  userId: string
): Promise<string> => {
  try {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    return customer.id
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw new Error('Failed to create Stripe customer')
  }
}

// Create checkout session
export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    })

    return session.url!
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

// Get subscription by ID
export const getSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription | null> => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

// Get customer subscriptions
export const getCustomerSubscriptions = async (
  customerId: string
): Promise<Stripe.Subscription[]> => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
    })

    return subscriptions.data
  } catch (error) {
    console.error('Error retrieving customer subscriptions:', error)
    return []
  }
}

// Cancel subscription immediately (for plan changes)
export const cancelSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

// Cancel subscription at period end (for user-initiated cancellations)
export const cancelSubscriptionAtPeriodEnd = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return subscription
  } catch (error) {
    console.error('Error scheduling subscription cancellation:', error)
    throw new Error('Failed to schedule subscription cancellation')
  }
}

// Update subscription (upgrade/downgrade)
export const updateSubscription = async (
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'always_invoice', // Create invoice immediately
        billing_cycle_anchor: 'now', // Reset billing cycle to now
      }
    )

    return updatedSubscription
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw new Error('Failed to update subscription')
  }
}

// Get active subscription for customer
export const getActiveSubscription = async (
  customerId: string
): Promise<Stripe.Subscription | null> => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    })

    return subscriptions.data.length > 0 ? subscriptions.data[0] : null
  } catch (error) {
    console.error('Error retrieving active subscription:', error)
    return null
  }
}

// Check if subscription is active
export const isSubscriptionActive = (
  subscription: Stripe.Subscription | null
): boolean => {
  if (!subscription) return false
  return subscription.status === 'active' || subscription.status === 'trialing'
}

// Get plan from price ID
export const getPlanFromPriceId = (
  priceId: string
): 'pro' | 'premium' | null => {
  if (priceId === process.env.STRIPE_PRO_PLAN_PRICE_ID) {
    return 'pro'
  }
  if (priceId === process.env.STRIPE_PREMIUM_PLAN_PRICE_ID) {
    return 'premium'
  }
  return null
}
