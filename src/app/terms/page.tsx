import { FileText, Calendar, Shield } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background font-display">
      {/* Header */}
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Terms of Service
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last updated: January 1, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Welcome to HeroTime. By accessing or using our service, you
                agree to be bound by these Terms of Service. Please read them
                carefully.
              </p>
            </section>

            {/* Sections */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                By creating an account or using HeroTime, you agree to comply
                with and be legally bound by these Terms of Service, whether or
                not you become a registered user of the services. These terms
                govern your access to and use of HeroTime, including any
                content, functionality, and services offered.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                If you do not agree to these terms, you must not access or use
                the service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                HeroTime is an AI-powered image generation platform that allows
                users to create custom hero images using artificial
                intelligence. The service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>AI-powered image generation capabilities</li>
                <li>Template and prop selection tools</li>
                <li>Image storage and management</li>
                <li>Multiple subscription tiers with varying features</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                3. User Accounts
              </h2>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                3.1 Account Creation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                To use certain features of HeroTime, you must create an account.
                You agree to provide accurate, current, and complete information
                during the registration process and to update such information
                to keep it accurate, current, and complete.
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                3.2 Account Security
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You agree to notify us immediately of any unauthorized
                access to or use of your account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                4. Subscription and Payment
              </h2>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                4.1 Subscription Plans
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                HeroTime offers multiple subscription plans (Free, Pro, and
                Premium) with different features and generation limits.
                Subscription fees are billed on a monthly basis.
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                4.2 Payment Terms
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All payments are processed securely through Stripe. By
                subscribing to a paid plan, you authorize us to charge your
                payment method on a recurring basis.
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                4.3 Cancellation and Refunds
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You may cancel your subscription at any time. Upon cancellation,
                you will retain access to paid features until the end of your
                current billing period. We do not provide refunds for partial
                months or unused generations.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                5. Content and Intellectual Property
              </h2>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                5.1 User-Generated Content
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You retain ownership of the images you upload and the final
                generated images. By using our service, you grant HeroTime a
                non-exclusive, worldwide, royalty-free license to use, store,
                and process your content solely for the purpose of providing the
                service.
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                5.2 Prohibited Content
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You agree not to upload or generate content that:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Is illegal, harmful, or offensive</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains personal information of others without consent</li>
                <li>Is used for spam or malicious purposes</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                6. Service Limitations
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We reserve the right to modify, suspend, or discontinue any part
                of the service at any time. We are not liable for any
                modification, suspension, or discontinuation of the service.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Generation limits are enforced based on your subscription plan.
                We reserve the right to adjust these limits with reasonable
                notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                HeroTime and its affiliates shall not be liable for any
                indirect, incidental, special, consequential, or punitive
                damages resulting from your use of or inability to use the
                service.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                The service is provided &quot;as is&quot; without warranties of
                any kind, either express or implied.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                8. Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We reserve the right to modify these Terms of Service at any
                time. We will notify users of any material changes via email or
                through the service. Your continued use of the service after
                such modifications constitutes your acceptance of the updated
                terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                9. Contact Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="bg-card rounded-lg p-6 border border-gray-300 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white">
                    Email:
                  </strong>{' '}
                  legal@herotime.com
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  <strong className="text-gray-900 dark:text-white">
                    Address:
                  </strong>{' '}
                  HeroTime, Inc., 123 AI Street, San Francisco, CA 94103
                </p>
              </div>
            </section>
          </div>

          {/* Back to Top */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <a
              href="#"
              className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Back to Top
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
