'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-card px-4 font-display">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Error Icon with Animation */}
        <div className="relative">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-red-200 dark:border-red-900/40 rounded-full animate-ping mx-auto opacity-75"></div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            Something Went Wrong!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We encountered an unexpected error while loading this page.
            Don&apos;t worry, this is usually temporary and can be fixed.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left border border-gray-200 dark:border-gray-700">
              <summary className="cursor-pointer font-bold text-gray-800 dark:text-gray-200 hover:text-primary transition-colors">
                🔍 Error Details (Development Only)
              </summary>
              <div className="mt-4 space-y-2">
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto p-3 bg-gray-50 dark:bg-background rounded border border-gray-200 dark:border-gray-700">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Error ID:</span>{' '}
                    {error.digest}
                  </p>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={reset}
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 shadow-lg font-bold"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => (window.location.href = '/')}
            className="border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Button>
        </div>

        {/* Support Information */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If this problem persists, please try the following:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Clear your browser cache and reload the page
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Check your internet connection
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Try again in a few minutes
            </li>
          </ul>
        </div>

        {/* Additional Help */}
        <div className="pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Still having issues?{' '}
            <button
              onClick={() => (window.location.href = '/')}
              className="text-primary hover:underline font-semibold"
            >
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
