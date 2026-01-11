import type { Metadata } from 'next'
import { Geist, Geist_Mono, Orbitron, Space_Grotesk } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'
import ThemeProvider from '@/components/providers/themeProvider'
import { SubscriptionSync } from '@/components/providers/subscriptionSync'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const orbitron = Orbitron({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '700'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'HeroTime - Turn Your Photo Into The Hero Of Their Story',
  description:
    'Unleash your imagination and turn yourself into the hero of your own story. Our AI brings your dreams to life through magical, personalized images.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${spaceGrotesk.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SubscriptionSync />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster position="top-right" expand={true} closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
