'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/constants/validationSchema'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'
import { updatePassword } from '@/lib/auth'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Check if we have a valid session/token
  useEffect(() => {
    const checkSession = async () => {
      // Check for error in URL params or hash
      const searchParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))

      const errorParam = searchParams.get('error') || hashParams.get('error')
      const errorCode =
        searchParams.get('error_code') || hashParams.get('error_code')
      const errorDescription =
        searchParams.get('error_description') ||
        hashParams.get('error_description')
      const messageParam = searchParams.get('message')

      // Check for errors from Supabase
      if (errorParam || errorCode) {
        setIsValidToken(false)
        const errorMessage = errorDescription
          ? decodeURIComponent(errorDescription)
          : messageParam
            ? decodeURIComponent(messageParam)
            : 'This password reset link is invalid or has expired.'

        toast.error('Invalid or Expired Link', {
          description: errorMessage,
          duration: 5000,
        })
        return
      }

      // Check if user has a valid session (they should be auto-authenticated by Supabase)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setIsValidToken(false)
        toast.error('Invalid or Expired Link', {
          description:
            'This password reset link is invalid or has expired. Please request a new one.',
          duration: 5000,
        })
      } else {
        // User is authenticated, show the password reset form
        setIsValidToken(true)
      }
    }

    checkSession()
  }, [])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)

    try {
      const result = await updatePassword(data.password)

      if (!result.success) {
        toast.error('Reset Failed', {
          description: result.error,
          duration: 4000,
        })
        return
      }

      toast.success('Password Reset Successfully!', {
        description: 'You can now log in with your new password.',
        duration: 5000,
      })

      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      toast.error('Reset Failed', {
        description: 'An unexpected error occurred',
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-card">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying reset link...
          </p>
        </div>
      </div>
    )
  }

  // Show error if token is invalid
  if (isValidToken === false) {
    return (
      <div className="relative overflow-hidden flex min-h-[calc(100vh-85px-80px)] w-full flex-col bg-gray-100 dark:bg-background font-display text-gray-800 dark:text-gray-200">
        <main className="relative z-2 flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-6 sm:p-10 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Invalid Reset Link
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                This password reset link is invalid or has expired. Please
                request a new password reset.
              </p>
            </div>

            <div className="space-y-4 flex flex-col">
              <Link href="/forgot-password">
                <Button className="w-full text-white">
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden flex min-h-[calc(100vh-85px-80px)] w-full flex-col bg-gray-100 dark:bg-background font-display text-gray-800 dark:text-gray-200">
      <main className="relative z-2 flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-6 sm:p-10 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter your new password below
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="sr-only" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="block w-full rounded-lg border-0 bg-gray-200/50 dark:bg-white/10 h-14 px-4 pr-12 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                  placeholder="New Password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="sr-only" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="block w-full rounded-lg border-0 bg-gray-200/50 dark:bg-white/10 h-14 px-4 pr-12 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                  placeholder="Confirm New Password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-primary h-14 px-4 py-2 text-base font-bold text-white shadow-lg shadow-primary/30 transition-transform duration-200 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Remember your password?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
