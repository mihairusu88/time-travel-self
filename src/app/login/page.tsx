'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/constants/validationSchema'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await signInWithEmail(data)

      if (!result.success) {
        toast.error('Login Failed', {
          description: result.error,
          duration: 4000,
        })
        return
      }

      toast.success('Welcome Back!', {
        description: 'You have successfully logged in',
        duration: 3000,
      })

      router.push('/')
    } catch {
      toast.error('Login Failed', {
        description: 'An unexpected error occurred',
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)

    try {
      const result = await signInWithGoogle()

      if (!result.success) {
        toast.error('Google Sign In Failed', {
          description: result.error,
          duration: 4000,
        })
        setIsGoogleLoading(false)
      }
      // If successful, user will be redirected automatically
    } catch {
      toast.error('Google Sign In Failed', {
        description: 'An unexpected error occurred',
        duration: 4000,
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden flex min-h-[calc(100vh-85px-80px)] w-full flex-col bg-gray-100 dark:bg-background font-display text-gray-800 dark:text-gray-200">
      <main className="relative z-2 flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-6 sm:p-10 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome Back!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to create your next masterpiece.
            </p>
          </div>

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

            <div className="space-y-2">
              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                className="block w-full rounded-lg border-0 bg-gray-200/50 dark:bg-white/10 h-14 px-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                placeholder="Password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-primary h-14 px-4 py-2 text-base font-bold text-white shadow-lg shadow-primary/30 transition-transform duration-200 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-gray-500 dark:text-gray-400">
                {' '}
                Or continue with{' '}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isGoogleLoading || isLoading}
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center w-full rounded-lg bg-gray-200/50 dark:bg-white/10 h-12 px-4 text-sm font-bold text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
              </svg>
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>
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
