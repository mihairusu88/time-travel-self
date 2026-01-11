'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/misc/themeToggle'
import type { User } from '@supabase/supabase-js'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Contact Us', href: '/contact' },
]

export const Navbar = () => {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const result = await signOut()

      if (!result.success) {
        toast.error('Logout Failed', {
          description: result.error,
          duration: 4000,
        })
        return
      }

      toast.success('Logged Out', {
        description: 'You have been successfully logged out',
        duration: 3000,
      })

      router.push('/')
    } catch {
      toast.error('Logout Failed', {
        description: 'An unexpected error occurred',
        duration: 4000,
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getUserInitials = (user: User) => {
    // For Google OAuth users, use full_name from user_metadata
    if (user?.user_metadata?.full_name) {
      const fullName = user.user_metadata.full_name
      const names = fullName.split(' ')
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
      }
      return fullName.charAt(0).toUpperCase()
    }

    // For manually registered users, use email initial
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }

    return 'U'
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        <Link href="/" className="flex items-center gap-2 md:gap-4">
          <svg
            className="w-4 h-4 md:h-8 md:w-8 text-primary"
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
              fill="currentColor"
            ></path>
          </svg>
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
            HeroTime
          </h2>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map(item => (
            <a
              key={item.name}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              href={item.href}
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle className="hidden md:block" />
          <Link className="hidden md:block" href="/generate">
            <Button className="flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">
              <span className="truncate">Create Hero</span>
            </Button>
          </Link>

          {loading ? (
            <div className="size-10 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0"
                >
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || ''}
                      alt={user.email || 'User'}
                    />
                    <AvatarFallback className="bg-primary text-white font-bold">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name ||
                        user.email?.split('@')[0] ||
                        'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-primary dark:text-primary focus:text-primary dark:focus:text-primary"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="rounded-lg px-5 py-2.5 text-sm font-bold"
              >
                Log In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-sm border-y border-white/10">
            {navigation.map(item => (
              <Link
                key={item.name}
                className="block px-3 py-2 text-base font-medium hover:text-secondary transition-colors"
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
