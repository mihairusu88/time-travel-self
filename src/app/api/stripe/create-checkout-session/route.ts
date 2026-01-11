import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import {
  stripe,
  createStripeCustomer,
  createCheckoutSession,
  getActiveSubscription,
  updateSubscription,
} from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body as { plan: string }

    if (!plan || (plan !== 'pro' && plan !== 'premium')) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId = SUBSCRIPTION_PLANS[plan as 'pro' | 'premium'].stripePriceId

    if (!priceId) {
      return NextResponse.json(
        { error: 'Plan price ID not configured' },
        { status: 500 }
      )
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      })
    }

    // Get or create Stripe customer
    let customerId = dbUser.stripeCustomerId

    if (!customerId) {
      customerId = await createStripeCustomer(user.email, user.id)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: customerId,
        },
      })
    }

    // Check if user has an active subscription
    const activeSubscription = await getActiveSubscription(customerId)

    // If user has an active subscription, UPDATE it (with proration) instead of canceling
    if (activeSubscription) {
      console.log(
        `User has active subscription ${activeSubscription.id}, updating with proration...`
      )

      try {
        // Determine if it's a downgrade, upgrade, or same plan
        const currentPlan = dbUser.plan
        const planHierarchy: Record<string, number> = {
          free: 0,
          pro: 1,
          premium: 2,
        }
        const isDowngrade =
          planHierarchy[plan] < planHierarchy[currentPlan || 'free']
        const isSamePlan = plan === currentPlan

        // Handle selecting the same plan (reactivate if canceling)
        if (isSamePlan && dbUser.subscriptionStatus === 'canceling') {
          console.log(
            `🔄 Same plan selected while canceling: ${currentPlan}. Reactivating subscription.`
          )

          // Remove cancellation from Stripe
          await stripe.subscriptions.update(dbUser.stripeSubscriptionId!, {
            cancel_at_period_end: false,
          })

          // Update database
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'active',
              scheduledPlan: null,
            },
          })

          console.log(`✅ Subscription reactivated for user ${user.id}`)

          // Return success with redirect to settings
          return NextResponse.json({
            url: `${request.headers.get('origin') || 'http://localhost:3000'}/settings?updated=true&reactivated=true`,
          })
        }

        if (isDowngrade) {
          // For downgrades, schedule the plan change for the end of the period
          console.log(
            `⏬ Downgrade detected: ${currentPlan} → ${plan}. Scheduling for period end.`
          )

          // If user is currently canceling, we need to reactivate the subscription first
          if (dbUser.subscriptionStatus === 'canceling') {
            console.log(
              'User is canceling, removing cancellation before scheduling downgrade...'
            )
            await stripe.subscriptions.update(dbUser.stripeSubscriptionId!, {
              cancel_at_period_end: false,
            })
          }

          // Schedule the subscription change in Stripe using proration_behavior: 'none'
          // This will change the plan at the end of the current period without immediate charge
          console.log(
            `Updating Stripe subscription to schedule downgrade to ${plan}...`
          )
          await stripe.subscriptions.update(dbUser.stripeSubscriptionId!, {
            items: [
              {
                id: activeSubscription.items.data[0].id,
                price: priceId,
              },
            ],
            proration_behavior: 'none', // Don't prorate - change at period end
            // The subscription will keep current plan until period end
          })

          console.log('✅ Stripe subscription updated with scheduled downgrade')

          // Update database to track the scheduled plan change
          await prisma.user.update({
            where: { id: user.id },
            data: {
              scheduledPlan: plan,
              subscriptionStatus: 'active', // Clear canceling status
              // Keep current plan and limits - they'll be updated by cron at period end
            },
          })

          console.log(
            `✅ Scheduled downgrade to ${plan} at period end for user ${user.id}`
          )

          // Return success with redirect to settings
          return NextResponse.json({
            url: `${request.headers.get('origin') || 'http://localhost:3000'}/settings?updated=true&downgraded=true`,
          })
        }

        // For upgrades, update immediately with proration
        console.log(
          `⏫ Upgrade detected: ${currentPlan} → ${plan}. Applying immediately with proration.`
        )

        // If user is currently canceling, we need to reactivate the subscription first
        if (dbUser.subscriptionStatus === 'canceling') {
          console.log(
            'User is canceling, removing cancellation before upgrading...'
          )
          await stripe.subscriptions.update(dbUser.stripeSubscriptionId!, {
            cancel_at_period_end: false,
          })
        }

        // Update subscription with new price (Stripe handles proration automatically)
        const updatedSubscription = await updateSubscription(
          activeSubscription.id,
          priceId
        )

        console.log(
          `✅ Updated subscription ${updatedSubscription.id} successfully with proration`
        )

        // Clear any scheduled plan change and canceling status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            scheduledPlan: null,
            subscriptionStatus: 'active', // Clear canceling status
          },
        })

        // Trigger a sync to update the database
        await fetch(
          `${request.headers.get('origin') || 'http://localhost:3000'}/api/stripe/sync-subscription`,
          {
            method: 'POST',
            headers: {
              cookie: request.headers.get('cookie') || '',
            },
          }
        )

        // Return success with redirect to settings
        return NextResponse.json({
          url: `${request.headers.get('origin') || 'http://localhost:3000'}/settings?updated=true`,
        })
      } catch (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        )
      }
    }

    // No active subscription - Create new one via Checkout
    console.log(
      'No active subscription found, creating new checkout session...'
    )

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${origin}/settings?session=success`
    const cancelUrl = `${origin}/pricing?session=canceled`

    const sessionUrl = await createCheckoutSession(
      customerId,
      priceId,
      user.id,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({ url: sessionUrl })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
