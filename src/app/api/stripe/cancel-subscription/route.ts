import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { stripe, cancelSubscriptionAtPeriodEnd } from '@/lib/stripe'
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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser || !dbUser.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      )
    }

    // If user has a scheduled plan change (downgrade), we need to revert Stripe
    // back to the current plan before canceling, otherwise they'll lose their
    // paid benefits when they reactivate
    if (dbUser.scheduledPlan) {
      console.log(
        `⚠️  User has scheduled plan (${dbUser.scheduledPlan}). Reverting Stripe to current plan (${dbUser.plan}) before canceling...`
      )

      // Get the current plan's price ID
      const currentPlanPriceId =
        SUBSCRIPTION_PLANS[dbUser.plan as 'pro' | 'premium'].stripePriceId

      if (!currentPlanPriceId) {
        throw new Error(`No price ID found for plan: ${dbUser.plan}`)
      }

      // Get the subscription to find the item ID
      const subscription = await stripe.subscriptions.retrieve(
        dbUser.stripeSubscriptionId
      )

      // Revert the subscription price back to the current plan
      await stripe.subscriptions.update(dbUser.stripeSubscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: currentPlanPriceId,
          },
        ],
        proration_behavior: 'none', // Don't charge/refund anything
      })

      console.log(
        `✅ Reverted Stripe subscription back to ${dbUser.plan} plan before canceling`
      )
    }

    // Cancel subscription at period end in Stripe (user keeps benefits until then)
    const canceledSubscription = await cancelSubscriptionAtPeriodEnd(
      dbUser.stripeSubscriptionId
    )

    console.log('📋 Canceled subscription:', {
      id: canceledSubscription.id,
      status: canceledSubscription.status,
      cancel_at_period_end: 'cancel_at_period_end' in canceledSubscription,
      cancel_at: 'cancel_at' in canceledSubscription,
    })

    // Get current_period_end from the subscription
    // Try multiple sources: cancel_at (when canceling), items[0].current_period_end, or current_period_end
    let currentPeriodEndTimestamp: number | null = null

    // 1. Try cancel_at (set when cancel_at_period_end is true)
    if ('cancel_at' in canceledSubscription) {
      currentPeriodEndTimestamp = (
        canceledSubscription as unknown as { cancel_at: number | null }
      ).cancel_at
      console.log('📅 Found cancel_at:', currentPeriodEndTimestamp)
    }

    // 2. Try items[0].current_period_end
    if (!currentPeriodEndTimestamp && canceledSubscription.items?.data?.[0]) {
      const itemPeriodEnd = (
        canceledSubscription.items.data[0] as unknown as {
          current_period_end?: number
        }
      ).current_period_end
      if (itemPeriodEnd) {
        currentPeriodEndTimestamp = itemPeriodEnd
        console.log(
          '📅 Found current_period_end in items[0]:',
          currentPeriodEndTimestamp
        )
      }
    }

    // 3. Try subscription-level current_period_end
    if (
      !currentPeriodEndTimestamp &&
      'current_period_end' in canceledSubscription
    ) {
      currentPeriodEndTimestamp = (
        canceledSubscription as unknown as {
          current_period_end: number
        }
      ).current_period_end
      console.log(
        '📅 Found current_period_end at subscription level:',
        currentPeriodEndTimestamp
      )
    }

    const currentPeriodEnd = currentPeriodEndTimestamp
      ? new Date(currentPeriodEndTimestamp * 1000)
      : null

    console.log('📅 Final current period end:', currentPeriodEnd)

    // If currentPeriodEnd is still null, try to get it from dbUser as fallback
    const finalCurrentPeriodEnd = currentPeriodEnd || dbUser.currentPeriodEnd

    console.log('📅 Using for database:', finalCurrentPeriodEnd)

    // Update subscription status to show it's canceling
    // But keep current plan and limits until period end
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'canceling', // New status to indicate canceling at period end
        currentPeriodEnd: finalCurrentPeriodEnd,
        scheduledPlan: null, // Clear any scheduled plan changes when canceling
        // DON'T change plan or generationsLimit - user keeps benefits until period end
      },
    })

    console.log('✅ User updated with canceling status')

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      cancelsAt: finalCurrentPeriodEnd,
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
