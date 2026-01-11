import { HeroSection } from '@/components/homepage/heroSection'
import { HowItWorksSection } from '@/components/homepage/howItWorksSection'
import { PricingSection } from '@/components/homepage/pricingSection'
import { TestimonialsSection } from '@/components/homepage/testimonialsSection'
import { FaqSection } from '@/components/homepage/faqSection'

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-100 dark:bg-background font-display text-gray-800 dark:text-gray-200">
      <main className="w-full mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col gap-20">
          <HeroSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <PricingSection showHeader={true} showFAQ={false} />
          <FaqSection />
        </div>
      </main>
    </div>
  )
}
