'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const isMobile = useIsMobile()

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return null during SSR to prevent hydration mismatch
    return null
  }

  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant={isMobile ? 'ghost' : 'outline'}
      size="icon"
      onClick={handleToggle}
      className={cn(isMobile ? 'h-9 w-auto px-3' : 'h-9 w-9', className)}
    >
      {theme === 'light' ? (
        <div className="flex justify-center items-center gap-2">
          <Moon className="h-[1.2rem] w-[1.2rem]" />
          {isMobile && <span>Dark Mode</span>}
          <span className="sr-only">Switch to dark mode</span>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-2">
          <Sun className="h-[1.2rem] w-[1.2rem]" />
          {isMobile && <span>Light Mode</span>}
          <span className="sr-only">Switch to light mode</span>
        </div>
      )}
    </Button>
  )
}
