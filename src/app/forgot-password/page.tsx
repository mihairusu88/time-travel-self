'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/constants/validationSchema'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { sendPasswordResetEmail } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  // Redirect to homepage if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-card">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the page if user is authenticated (will redirect)
  if (user) {
    return null
  }

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      const result = await sendPasswordResetEmail(data.email)

      if (!result.success) {
        toast.error('Reset Failed', {
          description: result.error,
          duration: 4000,
        })
        return
      }

      setEmailSent(true)
      toast.success('Email Sent!', {
        description: 'Check your inbox for password reset instructions',
        duration: 5000,
      })
    } catch {
      toast.error('Reset Failed', {
        description: 'An unexpected error occurred',
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden flex min-h-[calc(100vh-85px-80px)] w-full flex-col bg-gray-100 dark:bg-background font-display text-gray-800 dark:text-gray-200">
      <main className="relative z-2 flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-6 sm:p-10 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Forgot Password?
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {emailSent
                ? 'We sent you an email with instructions to reset your password.'
                : "Enter your email and we'll send you instructions to reset your password."}
            </p>
          </div>

          {!emailSent ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="sr-only" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  className="block w-full rounded-lg border-0 bg-gray-200/50 dark:bg-white/10 h-14 px-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                  placeholder="Email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-primary h-14 px-4 py-2 text-base font-bold text-white shadow-lg shadow-primary/30 transition-transform duration-200 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  If an account exists with this email, you will receive
                  password reset instructions shortly.
                </p>
              </div>
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Send Another Email
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 text-sm">
            <Link
              href="/login"
              className="flex items-center gap-2 font-medium text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
