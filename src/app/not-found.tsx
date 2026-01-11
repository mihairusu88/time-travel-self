import React from 'react'
import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-80px-85px)] flex items-center justify-center bg-gray-100 dark:bg-background px-4 font-display">
      <div className="text-center space-y-8 max-w-2xl">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-9xl font-black text-primary select-none animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Oops! Looks like this page took an unexpected detour. The page
            you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            asChild
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 shadow-lg font-bold"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
          >
            <Link href="/generate">
              <Search className="w-5 h-5 mr-2" />
              Start Creating
            </Link>
          </Button>
        </div>

        {/* Fun Quote */}
        <div className="pt-6">
          <blockquote className="text-gray-500 dark:text-gray-400 text-sm italic">
            &quot;Not all those who wander are lost... but this page definitely
            is! 🗺️&quot;
          </blockquote>
        </div>
      </div>
    </div>
  )
}
