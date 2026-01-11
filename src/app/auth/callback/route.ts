import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const error = requestUrl.searchParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Check URL hash for errors (Supabase sometimes puts errors in hash)
  const hash = requestUrl.hash
  let hashError = null
  let hashErrorCode = null
  let hashErrorDescription = null

  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1))
    hashError = hashParams.get('error')
    hashErrorCode = hashParams.get('error_code')
    hashErrorDescription = hashParams.get('error_description')
  }

  // Determine final error values (prefer query params over hash)
  const finalError = error || hashError
  const finalErrorCode = errorCode || hashErrorCode
  const finalErrorDescription = errorDescription || hashErrorDescription

  // Handle errors from Supabase
  if (finalError) {
    console.error('Auth callback error:', {
      error: finalError,
      errorCode: finalErrorCode,
      errorDescription: finalErrorDescription,
      type,
      url: requestUrl.toString(),
    })

    // Check if this is a password recovery flow
    // Look for 'recovery' in type param or check if error is related to password reset
    const isRecovery =
      type === 'recovery' ||
      finalErrorCode === 'otp_expired' ||
      finalErrorDescription?.toLowerCase().includes('email link')

    if (isRecovery) {
      const message = encodeURIComponent(
        finalErrorDescription || 'Password reset link has expired or is invalid'
      )
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=invalid_token&message=${message}`
      )
    }

    const message = encodeURIComponent(
      finalErrorDescription || 'Authentication failed'
    )
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_failed&message=${message}`
    )
  }

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

  // Handle PKCE flow with code
  if (code) {
    try {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        // If it's a password recovery, redirect to reset password with error
        if (type === 'recovery') {
          return NextResponse.redirect(
            `${requestUrl.origin}/reset-password#error=invalid_token&error_description=${encodeURIComponent(exchangeError.message)}`
          )
        }
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`
        )
      }

      // If it's a password recovery, redirect to reset password page
      // Note: User is now authenticated with a session specifically for password reset
      if (type === 'recovery') {
        return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
      }

      // Redirect to homepage after successful authentication (non-recovery)
      return NextResponse.redirect(`${requestUrl.origin}`)
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      // If it's a password recovery, redirect to reset password with error
      if (type === 'recovery') {
        return NextResponse.redirect(
          `${requestUrl.origin}/reset-password#error=invalid_token&error_description=${encodeURIComponent(errorMessage)}`
        )
      }
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=auth_failed&message=${encodeURIComponent(errorMessage)}`
      )
    }
  }

  // Handle legacy token-based flow (for password recovery with token in URL)
  if (token && type === 'recovery') {
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      })

      if (verifyError) {
        console.error('Error verifying recovery token:', verifyError)
        return NextResponse.redirect(
          `${requestUrl.origin}/reset-password?error=invalid_token&message=${encodeURIComponent(verifyError.message)}`
        )
      }

      // Token verified successfully, redirect to reset password page
      return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
    } catch (error) {
      console.error('Error verifying recovery token:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=invalid_token&message=${encodeURIComponent(errorMessage)}`
      )
    }
  }

  // No code or token provided, redirect to homepage
  return NextResponse.redirect(`${requestUrl.origin}`)
}
