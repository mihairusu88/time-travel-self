'use client'

import Image from 'next/image'
import { Loader2, Shield } from 'lucide-react'

interface LoadingSectionProps {
  isCheckingLimits?: boolean
  isGenerating?: boolean
}

export const LoadingSection = ({
  isCheckingLimits = false,
  isGenerating = false,
}: LoadingSectionProps) => {
  return (
    <section className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            {/* Animated loading circle */}
            <div className="space-y-4">
              <div className="relative">
                <div className="relative">
                  {/* Animated border circle */}
                  <div
                    className="w-40 h-40 rounded-full border-4 border-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-spin"
                    style={{
                      background:
                        'conic-gradient(from 0deg, #FF0099, #00FFFF, #8A2BE2, #FF0099)',
                      animation: 'spin 2s linear infinite',
                    }}
                  ></div>

                  {/* Inner circle with glow effect */}
                  <div className="absolute inset-2 rounded-full bg-background/80 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-primary animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            {isCheckingLimits ? 'Verifying Your Plan' : 'Generating Your Image'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {isCheckingLimits
              ? 'Checking your generation limits and subscription status...'
              : 'Our AI is working its magic to create your time travel experience.'}
          </p>
        </div>

        {/* Step 1: Checking */}
        {isCheckingLimits && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-12">
            <div className="flex-shrink-0">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                Checking subscription
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifying your current plan and usage...
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Generating image */}
        {isGenerating && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-12">
            <div className="flex-shrink-0">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                Generating your image
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Processing your image with advanced AI algorithms...
              </p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            This will only take a moment...
          </p>
        </div>
      </div>
    </section>
  )
}
