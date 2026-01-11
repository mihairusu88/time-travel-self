import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Authenticate user
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

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        stripeSubscriptionId: true,
        subscriptionStatus: true,
      },
    })

    if (!dbUser || !dbUser.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Only allow reactivation if subscription is canceling
    if (dbUser.subscriptionStatus !== 'canceling') {
      return NextResponse.json(
        { error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      )
    }

    // Update Stripe subscription to remove cancellation
    const subscription = await stripe.subscriptions.update(
      dbUser.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    )

    // Update database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'active',
      },
    })

    console.log('✅ Subscription reactivated successfully')

    // Get current period end safely
    const currentPeriodEnd =
      (subscription as unknown as { current_period_end?: number })
        .current_period_end || null

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd,
      },
    })
  } catch (error: unknown) {
    console.error('❌ Error reactivating subscription:', error)
    return NextResponse.json(
      {
        error: 'Failed to reactivate subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
