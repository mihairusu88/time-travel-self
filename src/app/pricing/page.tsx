import { PricingSection } from '@/components/homepage/pricingSection'

export default function PricingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-background font-display">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <PricingSection showHeader={true} showFAQ={true} />
        </div>
      </main>
    </div>
  )
}
